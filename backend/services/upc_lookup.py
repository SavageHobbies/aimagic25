import httpx
from typing import Dict, Any, Optional
import os
import logging

logger = logging.getLogger(__name__)

class UPCLookupService:
    def __init__(self):
        self.base_url = "https://api.upcitemdb.com/prod/trial/lookup"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def lookup_upc(self, upc: str) -> Dict[str, Any]:
        """
        Look up product information using UPC code
        """
        try:
            logger.debug(f"Looking up UPC: {upc}")
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}?upc={upc}",
                    headers=self.headers,
                    timeout=10.0  # Reduced timeout
                )
                
                logger.debug(f"UPC lookup response status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    logger.debug(f"UPC lookup response data: {data}")
                    
                    if data.get("items"):
                        item = data["items"][0]
                        return {
                            "success": True,
                            "product": {
                                "title": item.get("title", ""),
                                "description": item.get("description", ""),
                                "brand": item.get("brand", ""),
                                "category": item.get("category", ""),
                                "upc": item.get("upc", ""),
                                "ean": item.get("ean", ""),
                                "model": item.get("model", ""),
                                "color": item.get("color", ""),
                                "size": item.get("size", ""),
                                "dimension": item.get("dimension", ""),
                                "weight": item.get("weight", ""),
                                "images": item.get("images", []),
                                "offers": item.get("offers", []),
                                "lowest_price": item.get("lowest_recorded_price"),
                                "highest_price": item.get("highest_recorded_price"),
                                "source": "upcitemdb"
                            }
                        }
                    
                    logger.warning(f"No items found for UPC: {upc}")
                    return {
                        "success": False,
                        "message": "Product not found"
                    }
                    
                elif response.status_code == 429:
                    logger.warning("Rate limit exceeded")
                    return {
                        "success": False,
                        "message": "Rate limit exceeded"
                    }
                
                logger.error(f"API error: {response.status_code}")
                return {
                    "success": False,
                    "message": f"API error: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error looking up UPC: {str(e)}")
            return {
                "success": False,
                "message": f"Error looking up UPC: {str(e)}"
            }

    async def batch_lookup(self, upc_codes: list[str]) -> Dict[str, Any]:
        """
        Look up multiple UPC codes in batch
        """
        results = []
        errors = []
        
        for upc in upc_codes:
            result = await self.lookup_upc(upc)
            if result["success"]:
                results.append(result["product"])
            else:
                errors.append({
                    "upc": upc,
                    "error": result["message"]
                })
        
        return {
            "success": len(errors) == 0,
            "products": results,
            "errors": errors
        }
