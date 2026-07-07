from fastapi import APIRouter, Depends
from app.core.supabase import get_async_supabase
from supabase._async.client import AsyncClient
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["site-content"])


@router.get("/site-content")
async def get_site_content(supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("site_content").select("*").execute()
        data = result.data or []
        return {item["key"]: item["value"] for item in data}
    except Exception as e:
        logger.error(f"Error fetching site content: {e}")
        return {}
