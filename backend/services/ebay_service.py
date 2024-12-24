import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from ebaysdk.trading import Connection as Trading
from ebaysdk.finding import Connection as Finding
from ebaysdk.analytics import Connection as Analytics

class EbayService:
    def __init__(self):
        self.app_id = os.getenv('EBAY_APP_ID')
        self.cert_id = os.getenv('EBAY_CERT_ID')
        self.dev_id = os.getenv('EBAY_DEV_ID')
        self.auth_token = os.getenv('EBAY_AUTH_TOKEN')
        
        self.trading_api = Trading(
            appid=self.app_id,
            certid=self.cert_id,
            devid=self.dev_id,
            token=self.auth_token,
            config_file=None
        )
        
        self.finding_api = Finding(
            appid=self.app_id,
            config_file=None
        )
        
        self.analytics_api = Analytics(
            appid=self.app_id,
            certid=self.cert_id,
            devid=self.dev_id,
            token=self.auth_token,
            config_file=None
        )

    def get_terapeak_data(self, query: str, days: int = 30) -> Dict:
        """
        Get Terapeak sales data for a specific query
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        try:
            response = self.analytics_api.execute('getMarketplaceInsights', {
                'keywords': query,
                'categoryId': '149372',  # Funko Pop category
                'dateRange': {
                    'from': start_date.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                    'to': end_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                },
                'marketplaceId': 'EBAY_US',
                'metricKeys': [
                    'SOLD_ITEMS',
                    'AVERAGE_SOLD_PRICE',
                    'SELL_THROUGH_RATE',
                    'TOTAL_GMV',
                    'AVERAGE_SHIPPING_COST'
                ]
            })
            
            # Get top performing listings
            top_listings = self.analytics_api.execute('getListingAnalytics', {
                'keywords': query,
                'categoryId': '149372',
                'dateRange': {
                    'from': start_date.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                    'to': end_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                },
                'marketplaceId': 'EBAY_US',
                'limit': 10,
                'offset': 0,
                'sort': 'TOTAL_GMV',
                'sortOrder': 'DESC'
            })
            
            # Format the response
            metrics = response.dict()['insights'][0]['metrics']
            listings = top_listings.dict()['listings']
            
            return {
                'metrics': {
                    'totalSold': metrics['SOLD_ITEMS'],
                    'avgSoldPrice': metrics['AVERAGE_SOLD_PRICE'],
                    'sellThrough': metrics['SELL_THROUGH_RATE'],
                    'totalGMV': metrics['TOTAL_GMV'],
                    'avgShipping': metrics['AVERAGE_SHIPPING_COST']
                },
                'topListings': [{
                    'itemId': listing['itemId'],
                    'title': listing['title'],
                    'price': listing['price'],
                    'soldQuantity': listing['soldQuantity'],
                    'totalGMV': listing['totalGMV'],
                    'sellThrough': listing['sellThroughRate']
                } for listing in listings]
            }
            
        except Exception as e:
            print(f"Error getting Terapeak data: {str(e)}")
            return None
            
    def get_listing_details(self, item_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific listing
        """
        try:
            response = self.trading_api.execute('GetItem', {
                'ItemID': item_id,
                'DetailLevel': 'ReturnAll'
            })
            
            item = response.dict()['Item']
            
            return {
                'title': item.get('Title'),
                'subtitle': item.get('Subtitle'),
                'description': item.get('Description'),
                'price': item.get('StartPrice', {}).get('value'),
                'quantity': item.get('Quantity'),
                'condition': item.get('ConditionDisplayName'),
                'specifics': item.get('ItemSpecifics', {}).get('NameValueList', []),
                'shipping': {
                    'type': item.get('ShippingDetails', {}).get('ShippingType'),
                    'service': item.get('ShippingDetails', {}).get('ShippingServiceOptions', [{}])[0].get('ShippingService'),
                    'cost': item.get('ShippingDetails', {}).get('ShippingServiceOptions', [{}])[0].get('ShippingServiceCost', {}).get('value')
                }
            }
            
        except Exception as e:
            print(f"Error getting listing details: {str(e)}")
            return None
            
    def get_similar_listings(self, item_id: str) -> List[Dict]:
        """
        Get similar active listings
        """
        try:
            item_details = self.get_listing_details(item_id)
            if not item_details:
                return []
                
            response = self.finding_api.execute('findItemsAdvanced', {
                'keywords': item_details['title'],
                'categoryId': '149372',
                'itemFilter': [
                    {'name': 'Condition', 'value': item_details['condition']},
                    {'name': 'ListingType', 'value': 'FixedPrice'}
                ],
                'sortOrder': 'PricePlusShippingHighest'
            })
            
            items = response.dict()['searchResult']['item']
            return [{
                'itemId': item['itemId'],
                'title': item['title'],
                'price': item['sellingStatus']['currentPrice']['value'],
                'shipping': item.get('shippingInfo', {}).get('shippingServiceCost', {}).get('value', '0.00'),
                'condition': item.get('condition', {}).get('conditionDisplayName')
            } for item in items]
            
        except Exception as e:
            print(f"Error getting similar listings: {str(e)}")
            return []

    async def get_category_aspects(self, category_id: str) -> Dict:
        """
        Get item aspects for a specific category
        """
        try:
            response = self.trading_api.execute('GetCategorySpecifics', {
                'CategoryID': category_id,
                'DetailLevel': 'ReturnAll'
            })
            
            # Extract aspects from response
            aspects = []
            if response.reply.get('Recommendations'):
                for rec in response.reply.Recommendations.NameRecommendation:
                    aspect = {
                        'localizedAspectName': rec.Name,
                        'aspectConstraint': {
                            'aspectRequired': rec.ValidationRules.get('MinValues', 0) > 0,
                            'aspectUsage': 'REQUIRED' if rec.ValidationRules.get('MinValues', 0) > 0 else 'RECOMMENDED'
                        },
                        'aspectMode': 'SELECTION_ONLY' if rec.get('ValueRecommendation') else 'FREE_TEXT',
                        'aspectValues': []
                    }
                    
                    # Add recommended values if any
                    if rec.get('ValueRecommendation'):
                        for value in rec.ValueRecommendation:
                            aspect['aspectValues'].append({
                                'value': value.Value,
                                'constraints': {
                                    'itemToAspectCardinality': 'SINGLE',
                                    'aspectValueUsage': 'RECOMMENDED'
                                }
                            })
                    
                    aspects.append(aspect)
            
            return {
                'aspects': aspects,
                'categoryId': category_id,
                'categoryName': response.reply.get('CategoryName', '')
            }
            
        except Exception as e:
            print(f"Error getting category aspects: {str(e)}")
            return {
                'aspects': [],
                'categoryId': category_id,
                'categoryName': ''
            }
