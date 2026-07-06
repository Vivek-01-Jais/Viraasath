from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.core.supabase import get_async_supabase
from app.core.auth import get_current_user
from supabase._async.client import AsyncClient
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(None, max_length=2000)


@router.get("/product/{product_id}")
async def get_product_reviews(product_id: str, supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("reviews") \
            .select("*, profile:profiles(full_name)") \
            .eq("product_id", product_id) \
            .eq("is_approved", True) \
            .order("created_at", desc=True) \
            .execute()

        avg = await supabase.table("reviews") \
            .select("rating") \
            .eq("product_id", product_id) \
            .eq("is_approved", True) \
            .execute()

        avg_rating = 0
        if avg.data and len(avg.data) > 0:
            avg_rating = sum(r["rating"] for r in avg.data) / len(avg.data)

        return {
            "reviews": result.data or [],
            "average_rating": round(avg_rating, 1),
            "total_reviews": len(result.data or []),
        }
    except Exception as e:
        logger.error(f"Error fetching reviews for product {product_id}: {e}")
        return {"reviews": [], "average_rating": 0, "total_reviews": 0}


@router.post("/")
async def create_review(body: ReviewCreate, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        existing = await supabase.table("reviews") \
            .select("id") \
            .eq("product_id", body.product_id) \
            .eq("user_id", current_user_id) \
            .maybe_single() \
            .execute()

        if existing.data:
            raise HTTPException(status_code=400, detail="You have already reviewed this product")

        review_data = body.model_dump()
        review_data["user_id"] = current_user_id
        result = await supabase.table("reviews").insert(review_data).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=400, detail="Failed to submit review")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating review: {e}")
        raise HTTPException(status_code=400, detail="Failed to submit review")
