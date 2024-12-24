from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.ebay_service import EbayService

router = APIRouter()
ebay_service = EbayService()

@router.get("/api/terapeak")
async def get_terapeak_data(
    upc: str = Query(..., description="UPC code of the product"),
    days: int = Query(30, description="Number of days of data to retrieve (30, 90, or 365)")
):
    """Get Terapeak sales data for a product"""
    if days not in [30, 90, 365]:
        raise HTTPException(status_code=400, detail="Days must be 30, 90, or 365")
        
    try:
        data = ebay_service.get_terapeak_data(upc, days)
        if data is None:
            raise HTTPException(status_code=404, detail="No Terapeak data found for this UPC")
            
        return {
            "success": True,
            "data": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
