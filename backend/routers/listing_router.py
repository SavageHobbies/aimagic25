from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Optional
from services.ebay_listing_service import EbayListingService

router = APIRouter()
listing_service = EbayListingService()

@router.get("/api/listings/{item_id}")
async def get_listing_details(item_id: str) -> Dict:
    """Get full details of an eBay listing for Sell Similar"""
    details = await listing_service.get_item_details(item_id)
    if not details:
        raise HTTPException(status_code=404, detail="Listing not found")
    return details

@router.get("/api/categories/{category_id}/aspects")
async def get_category_aspects(
    category_id: str,
    marketplace_id: str = Query("EBAY_US", description="The eBay marketplace ID")
) -> Dict:
    """Get required and recommended item specifics for a category"""
    aspects = await listing_service.fetch_item_aspects(category_id, marketplace_id)
    if not aspects:
        raise HTTPException(status_code=404, detail="Category aspects not found")
    return aspects

@router.get("/api/categories/{category_id}/aspects/{aspect_name}/values")
async def get_aspect_values(
    category_id: str,
    aspect_name: str,
    marketplace_id: str = Query("EBAY_US", description="The eBay marketplace ID")
) -> List[str]:
    """Get recommended values for a specific aspect"""
    values = await listing_service.get_aspect_values(category_id, aspect_name, marketplace_id)
    return values
