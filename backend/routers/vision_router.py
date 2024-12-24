from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict
import aiohttp
from services.vision_service import VisionService
from services.ebay_service import EbayService

router = APIRouter(prefix="/api/vision", tags=["vision"])
vision_service = VisionService()
ebay_service = EbayService()

@router.post("/analyze")
async def analyze_product(image: UploadFile = File(...)):
    """
    Analyze a product image and return detailed information
    """
    try:
        # Read image content
        contents = await image.read()
        
        # Analyze image with Google Vision API
        vision_results = await vision_service.analyze_image(contents)
        
        # Extract product details
        product_details = vision_service.extract_product_details(vision_results)
        
        # Search eBay for similar items
        market_data = await ebay_service.search_completed_items(product_details['main_object'])
        
        # Combine all information
        response = {
            'product_details': product_details,
            'market_data': market_data,
            'suggested_title': f"{product_details['main_object']} {' '.join(product_details['attributes'][:3])}",
            'suggested_price': market_data['price_analysis']['median'] if market_data['success'] else None,
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-listing")
async def create_listing(listing_data: Dict):
    """
    Create an eBay listing with the analyzed data
    """
    try:
        result = await ebay_service.create_draft_listing(listing_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
