from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from services.listing_optimizer import ListingOptimizer
from services.ebay_service import EbayService

router = APIRouter(prefix="/api/listing", tags=["listing"])
optimizer = ListingOptimizer()
ebay_service = EbayService()

class OptimizationRequest(BaseModel):
    product_data: Dict
    listing_id: Optional[str] = None

@router.post("/optimize")
async def optimize_listing(request: OptimizationRequest):
    """
    Optimize a product listing using AI
    """
    try:
        # If listing_id provided, get the listing details
        top_listing = {}
        if request.listing_id:
            top_listing = await ebay_service.get_listing_details(request.listing_id)
        
        # Get optimization suggestions
        result = await optimizer.optimize_listing(request.product_data, top_listing)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
