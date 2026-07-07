from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from app.core.supabase import get_async_supabase
from app.core.auth import get_current_user
from app.core.rate_limit import limiter
from supabase._async.client import AsyncClient
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/coupons", tags=["coupons"])


@router.get("/validate/{code}")
@limiter.limit("30/minute")
async def validate_coupon(code: str, request: Request, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        coupon = await supabase.table("coupons").select("*").eq("code", code.upper()).maybe_single().execute()
        if not coupon.data:
            raise HTTPException(status_code=404, detail="Invalid coupon code")

        c = coupon.data
        if not c.get("is_active"):
            raise HTTPException(status_code=400, detail="This coupon is no longer active")

        if c.get("expires_at"):
            try:
                expires = datetime.fromisoformat(c["expires_at"].replace("Z", "+00:00"))
                if expires < datetime.now(expires.tzinfo):
                    raise HTTPException(status_code=400, detail="This coupon has expired")
            except (ValueError, TypeError):
                pass  # ignore unparseable dates

        if c.get("usage_limit") and c.get("used_count", 0) >= c["usage_limit"]:
            raise HTTPException(status_code=400, detail="This coupon has reached its usage limit")

        try:
            discount_value = float(c.get("discount_value", 0) or 0)
        except (ValueError, TypeError):
            discount_value = 0

        try:
            max_discount = float(c["max_discount"]) if c.get("max_discount") else None
        except (ValueError, TypeError):
            max_discount = None

        min_cart_value = float(c.get("min_cart_value", 0) or 0)

        return {
            "code": c.get("code", ""),
            "discount_type": c.get("discount_type", "percentage"),
            "discount_value": discount_value,
            "max_discount": max_discount,
            "min_cart_value": min_cart_value,
        }
    except HTTPException:
        raise
    except Exception as e:
        err_type = type(e).__name__
        logger.error(f"Error validating coupon {code}: {err_type}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to validate coupon ({err_type})")
