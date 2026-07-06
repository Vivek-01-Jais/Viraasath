from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.supabase import get_async_supabase
from app.core.auth import get_current_user
from supabase._async.client import AsyncClient
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/addresses", tags=["addresses"])


class AddressCreate(BaseModel):
    full_name: str
    phone: str | None = None
    address_line1: str
    address_line2: str | None = None
    city: str
    state: str
    postal_code: str
    country: str = "India"
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    is_default: bool | None = None


@router.get("/")
async def list_addresses(current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("addresses").select("*").eq("user_id", current_user_id).order("created_at").execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Error listing addresses for user {current_user_id}: {e}")
        return []


@router.post("/")
async def create_address(body: AddressCreate, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        data = body.model_dump()
        data["user_id"] = current_user_id

        if body.is_default:
            await supabase.table("addresses").update({"is_default": False}).eq("user_id", current_user_id).execute()

        result = await supabase.table("addresses").insert(data).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=400, detail="Failed to create address")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating address: {e}")
        raise HTTPException(status_code=400, detail="Failed to create address")


@router.put("/{address_id}")
async def update_address(address_id: str, body: AddressUpdate, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        addr = await supabase.table("addresses").select("user_id").eq("id", address_id).maybe_single().execute()
        if not addr.data or addr.data["user_id"] != current_user_id:
            raise HTTPException(status_code=404, detail="Address not found")

        data = {k: v for k, v in body.model_dump().items() if v is not None}

        if body.is_default:
            await supabase.table("addresses").update({"is_default": False}).eq("user_id", current_user_id).execute()

        result = await supabase.table("addresses").update(data).eq("id", address_id).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=404, detail="Address not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating address {address_id}: {e}")
        raise HTTPException(status_code=404, detail="Address not found")


@router.delete("/{address_id}")
async def delete_address(address_id: str, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        addr = await supabase.table("addresses").select("user_id").eq("id", address_id).maybe_single().execute()
        if not addr.data or addr.data["user_id"] != current_user_id:
            raise HTTPException(status_code=404, detail="Address not found")
        await supabase.table("addresses").delete().eq("id", address_id).execute()
        return {"message": "Address deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting address {address_id}: {e}")
        raise HTTPException(status_code=404, detail="Address not found")
