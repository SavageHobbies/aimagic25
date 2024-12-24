from fastapi import APIRouter, HTTPException
from typing import Dict, List
from services.template_service import TemplateService

router = APIRouter()
template_service = TemplateService()

@router.get("/api/templates")
async def get_available_templates() -> List[str]:
    """Get list of all available template categories"""
    return template_service.get_available_templates()

@router.get("/api/templates/{category}")
async def get_template(category: str) -> Dict:
    """Get the HTML template for a specific category"""
    template = await template_service.get_template(category)
    if template is None:
        raise HTTPException(status_code=404, detail=f"Template not found for category: {category}")
    return {"template": template}

@router.post("/api/templates/{category}/fill")
async def fill_template(category: str, data: Dict) -> Dict:
    """Fill a template with product data"""
    template = await template_service.get_template(category)
    if template is None:
        raise HTTPException(status_code=404, detail=f"Template not found for category: {category}")
        
    filled_template = template_service.fill_template(template, data)
    return {"html": filled_template}
