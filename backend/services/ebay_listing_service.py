from typing import Dict, List, Optional
from ebaysdk.trading import Connection as Trading
from datetime import datetime
import os
import gzip
import json
import httpx

class EbayListingService:
    def __init__(self):
        self.trading_api = Trading(
            domain='api.ebay.com',
            appid=os.getenv('EBAY_APP_ID'),
            devid=os.getenv('EBAY_DEV_ID'),
            certid=os.getenv('EBAY_CERT_ID'),
            token=os.getenv('EBAY_AUTH_TOKEN')
        )
        
        self.api_url = "https://api.ebay.com/commerce/taxonomy/v1"
        self.sandbox_url = "https://api.sandbox.ebay.com/commerce/taxonomy/v1"
        self.use_sandbox = os.getenv('EBAY_USE_SANDBOX', 'True').lower() == 'true'
        self.base_url = self.sandbox_url if self.use_sandbox else self.api_url
        
    async def get_item_details(self, item_id: str) -> Dict:
        """Get full details of an eBay item for Sell Similar"""
        try:
            response = self.trading_api.execute('GetItem', {
                'ItemID': item_id,
                'DetailLevel': 'ReturnAll',
                'IncludeItemSpecifics': True
            })
            
            item = response.dict()['Item']
            return {
                'title': item.get('Title', ''),
                'description': item.get('Description', ''),
                'category_id': item.get('PrimaryCategory', {}).get('CategoryID', ''),
                'item_specifics': self._parse_item_specifics(item.get('ItemSpecifics', {}).get('NameValueList', [])),
                'condition_id': item.get('ConditionID', ''),
                'condition_description': item.get('ConditionDescription', ''),
                'price': item.get('StartPrice', {}).get('value', ''),
                'quantity': item.get('Quantity', 1),
                'duration': item.get('ListingDuration', ''),
                'payment_methods': item.get('PaymentMethods', []),
                'return_policy': self._parse_return_policy(item.get('ReturnPolicy', {})),
                'shipping_details': self._parse_shipping_details(item.get('ShippingDetails', {})),
                'listing_type': item.get('ListingType', ''),
                'pictures': self._parse_pictures(item.get('PictureDetails', {}))
            }
        except Exception as e:
            print(f"Error getting item details: {str(e)}")
            return None

    async def get_oauth_token(self) -> str:
        """Get OAuth token using client credentials flow"""
        auth_url = "https://api.ebay.com/identity/v1/oauth/token"
        if self.use_sandbox:
            auth_url = "https://api.sandbox.ebay.com/identity/v1/oauth/token"
            
        credentials = f"{os.getenv('EBAY_APP_ID')}:{os.getenv('EBAY_CERT_ID')}"
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {credentials}"
        }
        
        data = {
            "grant_type": "client_credentials",
            "scope": "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/metadata.insights"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(auth_url, headers=headers, data=data)
            response.raise_for_status()
            return response.json()["access_token"]

    async def get_category_tree_id(self, marketplace_id: str = "EBAY_US") -> str:
        """Get the category tree ID for a marketplace"""
        token = await self.get_oauth_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-EBAY-C-MARKETPLACE-ID": marketplace_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/get_default_category_tree_id",
                headers=headers,
                params={"marketplace_id": marketplace_id}
            )
            response.raise_for_status()
            return response.json()["categoryTreeId"]

    async def fetch_item_aspects(self, category_id: str, marketplace_id: str = "EBAY_US") -> Dict:
        """Fetch item aspects for a category using the Taxonomy API"""
        try:
            token = await self.get_oauth_token()
            tree_id = await self.get_category_tree_id(marketplace_id)
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip"
            }
            
            url = f"{self.base_url}/category_tree/{tree_id}/fetch_item_aspects"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                # Decompress gzipped response
                decompressed_data = gzip.decompress(response.content)
                data = json.loads(decompressed_data)
                
                # Process aspects data
                aspects_data = {
                    "required": [],
                    "recommended": [],
                    "upcoming_required": []
                }
                
                for category_aspect in data.get("categoryAspects", []):
                    if category_aspect["category"]["categoryId"] == category_id:
                        for aspect in category_aspect.get("aspects", []):
                            aspect_info = {
                                "name": aspect["localizedAspectName"],
                                "values": [v["localizedValue"] for v in aspect.get("aspectValues", [])],
                                "mode": aspect["aspectConstraint"]["aspectMode"],
                                "data_type": aspect["aspectConstraint"]["aspectDataType"],
                                "max_length": aspect["aspectConstraint"].get("aspectMaxLength"),
                                "cardinality": aspect["aspectConstraint"]["itemToAspectCardinality"],
                                "variation_enabled": aspect["aspectConstraint"]["aspectEnabledForVariations"],
                                "search_count": aspect.get("relevanceIndicator", {}).get("searchCount")
                            }
                            
                            if aspect["aspectConstraint"]["aspectRequired"]:
                                aspects_data["required"].append(aspect_info)
                            elif aspect["aspectConstraint"].get("expectedRequiredByDate"):
                                aspect_info["required_by"] = aspect["aspectConstraint"]["expectedRequiredByDate"]
                                aspects_data["upcoming_required"].append(aspect_info)
                            else:
                                aspects_data["recommended"].append(aspect_info)
                
                return aspects_data
                
        except Exception as e:
            print(f"Error fetching item aspects: {str(e)}")
            return None

    async def get_aspect_values(self, category_id: str, aspect_name: str, marketplace_id: str = "EBAY_US") -> List[str]:
        """Get recommended values for a specific aspect"""
        try:
            aspects_data = await self.fetch_item_aspects(category_id, marketplace_id)
            if not aspects_data:
                return []
                
            # Search through all aspect types
            for aspect_type in ["required", "recommended", "upcoming_required"]:
                for aspect in aspects_data[aspect_type]:
                    if aspect["name"] == aspect_name:
                        return aspect["values"]
            
            return []
            
        except Exception as e:
            print(f"Error getting aspect values: {str(e)}")
            return []

    def format_aspect_value(self, value: str, data_type: str, aspect_format: Optional[str] = None) -> str:
        """Format aspect value according to its data type and format"""
        if data_type == "DATE":
            if aspect_format == "YYYY":
                return value[:4]
            elif aspect_format == "YYYYMM":
                return value[:6]
            elif aspect_format == "YYYYMMDD":
                return value[:8]
        elif data_type == "NUMBER":
            if aspect_format == "int32":
                return str(int(float(value)))
            elif aspect_format == "double":
                return str(float(value))
        
        return value

    def _parse_item_specifics(self, specifics: List) -> Dict:
        """Parse item specifics into a structured format"""
        return {
            specific.get('Name'): specific.get('Value', [])[0] if isinstance(specific.get('Value', []), list) else specific.get('Value')
            for specific in specifics
        }

    def _parse_return_policy(self, policy: Dict) -> Dict:
        """Parse return policy details"""
        return {
            'returns_accepted': policy.get('ReturnsAccepted', 'ReturnsNotAccepted'),
            'refund_option': policy.get('RefundOption', ''),
            'returns_within': policy.get('ReturnsWithin', ''),
            'shipping_cost_paid_by': policy.get('ShippingCostPaidBy', ''),
            'description': policy.get('Description', '')
        }

    def _parse_shipping_details(self, details: Dict) -> Dict:
        """Parse shipping details"""
        return {
            'shipping_type': details.get('ShippingType', ''),
            'shipping_service': details.get('ShippingServiceOptions', [{}])[0].get('ShippingService', ''),
            'free_shipping': details.get('ShippingServiceOptions', [{}])[0].get('FreeShipping', 'false'),
            'handling_time': details.get('HandlingTime', ''),
            'excluded_locations': details.get('ExcludeShipToLocation', [])
        }

    def _parse_pictures(self, details: Dict) -> List[str]:
        """Parse picture URLs"""
        if 'PictureURL' in details:
            return details['PictureURL'] if isinstance(details['PictureURL'], list) else [details['PictureURL']]
        return []
