from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List
from services.gemini_service import GeminiService
from services.ebay_listing_service import EbayListingService

router = APIRouter()
gemini_service = GeminiService()
ebay_service = EbayListingService()

@router.post("/api/ai/item-specifics")
async def get_ai_item_specifics(
    category_id: str = Body(...),
    marketplace_id: str = Body("EBAY_US"),
    context: Dict = Body(...)
) -> Dict[str, str]:
    """Get AI-suggested values for item specifics"""
    try:
        # Get category aspects
        aspects = await ebay_service.fetch_item_aspects(category_id, marketplace_id)
        if not aspects:
            raise HTTPException(status_code=404, detail="Category aspects not found")
            
        # Get AI suggestions for all aspects
        all_aspects = (
            aspects["required"] +
            aspects["recommended"] +
            aspects["upcoming_required"]
        )
        
        suggestions = await gemini_service.get_multiple_item_specifics(all_aspects, context)
        
        # Validate suggestions
        validated_suggestions = {}
        for aspect in all_aspects:
            value = suggestions.get(aspect["name"], "")
            if gemini_service.validate_aspect_value(value, aspect):
                validated_suggestions[aspect["name"]] = value
                
        return validated_suggestions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ai/item-specific/{aspect_name}")
async def get_ai_item_specific(
    aspect_name: str,
    category_id: str = Body(...),
    marketplace_id: str = Body("EBAY_US"),
    context: Dict = Body(...)
) -> Dict[str, str]:
    """Get AI-suggested value for a single item specific"""
    try:
        # Get category aspects to validate the aspect
        aspects = await ebay_service.fetch_item_aspects(category_id, marketplace_id)
        if not aspects:
            raise HTTPException(status_code=404, detail="Category aspects not found")
            
        # Find the aspect details
        all_aspects = (
            aspects["required"] +
            aspects["recommended"] +
            aspects["upcoming_required"]
        )
        
        aspect = next((a for a in all_aspects if a["name"] == aspect_name), None)
        if not aspect:
            raise HTTPException(status_code=404, detail=f"Aspect '{aspect_name}' not found")
            
        # Get AI suggestion
        value = await gemini_service.get_item_specific_value(aspect_name, context)
        
        # Validate suggestion
        if gemini_service.validate_aspect_value(value, aspect):
            return {aspect_name: value}
        else:
            return {aspect_name: ""}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
