from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from services.upc_lookup import UPCLookupService
from services.ebay_service import EbayService
import json
import os
from datetime import datetime

router = APIRouter(prefix="/api/upc", tags=["upc"])
upc_service = UPCLookupService()
ebay_service = EbayService()

class UPCRequest(BaseModel):
    upc: str
    quantity: int = 1

class BatchUPCRequest(BaseModel):
    items: List[UPCRequest]

class InventoryItem(BaseModel):
    upc: str
    quantity: int
    title: str
    description: Optional[str]
    brand: Optional[str]
    category: Optional[str]
    images: List[str]
    price_history: Optional[dict]
    suggested_price: Optional[float]
    last_updated: datetime

@router.post("/scan")
async def scan_upc(request: UPCRequest, response: Response):
    """
    Scan a single UPC and return product information with eBay market data
    """
    try:
        # First try eBay lookup since it provides more detailed market data
        ebay_result = await ebay_service.find_by_upc(request.upc)
        
        if ebay_result["success"]:
            # Get eBay transaction history
            market_data = await ebay_service.get_item_transactions(ebay_result["product"]["title"])
            
            # Set rate limit headers
            response.headers["X-RateLimit-Remaining"] = "100"  # Replace with actual values
            response.headers["X-RateLimit-Limit"] = "100"
            
            return {
                "success": True,
                "product": {
                    **ebay_result["product"],
                    "market_data": market_data.get("data", {}),
                    "quantity": request.quantity
                }
            }
        
        # If eBay lookup fails, try UPCItemDB
        product_info = await upc_service.lookup_upc(request.upc)
        
        if not product_info["success"]:
            raise HTTPException(status_code=404, detail="Product not found in any database")
            
        # Try to get eBay market data using the product title
        market_data = await ebay_service.get_item_transactions(product_info["product"]["title"])
        
        # Set rate limit headers
        response.headers["X-RateLimit-Remaining"] = "100"  # Replace with actual values
        response.headers["X-RateLimit-Limit"] = "100"
        
        return {
            "success": True,
            "product": {
                **product_info["product"],
                "market_data": market_data.get("data", {}),
                "quantity": request.quantity
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
async def batch_scan_upc(request: BatchUPCRequest):
    """
    Scan multiple UPC codes in batch and manage inventory
    """
    results = []
    for item in request.items:
        try:
            result = await scan_upc(item)
            results.append(result)
        except HTTPException as e:
            results.append({
                "success": False,
                "upc": item.upc,
                "error": e.detail
            })
    return results

@router.get("/{upc}")
async def get_inventory_item(upc: str):
    """
    Get detailed information about a specific inventory item
    """
    try:
        # First try eBay
        product = await ebay_service.find_by_upc(upc)
        if product["success"]:
            history = await ebay_service.get_item_transactions(product["product"]["title"])
            return {
                **product,
                "market_data": history.get("data", {})
            }
        
        # Fallback to UPC database
        product = await upc_service.lookup_upc(upc)
        if not product["success"]:
            raise HTTPException(status_code=404, detail="Product not found")
            
        return product
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
