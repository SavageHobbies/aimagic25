from fastapi import APIRouter, HTTPException
from ebaysdk.finding import Connection as Finding
from ebaysdk.exception import ConnectionError
from services.ebay_service import EbayService
import os

router = APIRouter(prefix="/api/ebay", tags=["ebay"])
ebay_service = EbayService()

def get_ebay_client():
    return Finding(
        appid=os.getenv("APP_ID"),
        config_file=None
    )

@router.get("/search/{upc}")
async def search_by_upc(upc: str):
    try:
        api = get_ebay_client()
        response = api.execute('findItemsByProduct', {
            'productId': upc,
            'productIdType': 'UPC'
        })
        return response.dict()
    except ConnectionError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error searching eBay")

@router.get("/category/{category_id}/aspects")
async def get_category_aspects(category_id: str):
    """
    Get item aspects for a specific eBay category
    """
    try:
        aspects = await ebay_service.get_category_aspects(category_id)
        return aspects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
