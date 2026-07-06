from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from app.core.supabase import get_async_supabase
from app.core.config import settings
from app.core.auth import get_admin_user
from supabase._async.client import AsyncClient
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/verify")
async def verify_admin(current_user_id: str = Depends(get_admin_user)):
    return {"is_admin": True}


@router.post("/bootstrap")
async def bootstrap_admin(supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        existing_admins = await supabase.table("profiles").select("id").eq("role", "admin").execute()
        if existing_admins.data and len(existing_admins.data) > 0:
            raise HTTPException(status_code=400, detail="Admin already exists")
        raise HTTPException(status_code=400, detail="Use Supabase dashboard to set admin role manually")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to grant admin access")


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    price: float
    compare_at_price: float | None = None
    category_id: str | None = None
    material: str | None = None
    care_instructions: str | None = None
    is_featured: bool = False
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    price: float | None = None
    compare_at_price: float | None = None
    category_id: str | None = None
    material: str | None = None
    care_instructions: str | None = None
    is_featured: bool | None = None
    is_active: bool | None = None


class OrderStatusUpdate(BaseModel):
    status: str
    payment_status: str | None = None


@router.get("/dashboard")
async def dashboard(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    total_products = await supabase.table("products").select("id", count="exact").execute()
    total_orders = await supabase.table("orders").select("id", count="exact").execute()
    total_customers = await supabase.table("profiles").select("id", count="exact").eq("role", "customer").execute()
    total_revenue = await supabase.table("orders").select("total").eq("payment_status", "paid").execute()

    revenue = sum(float(o["total"]) for o in (total_revenue.data or []))

    recent_orders = await supabase.table("orders").select("*").order("created_at", desc=True).limit(5).execute()

    return {
        "total_products": total_products.count or 0,
        "total_orders": total_orders.count or 0,
        "total_customers": total_customers.count or 0,
        "total_revenue": revenue,
        "recent_orders": recent_orders.data or [],
    }


@router.get("/products")
async def list_products_admin(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    page = 1
    page_size = 50
    from_ = (page - 1) * page_size
    to_ = from_ + page_size - 1
    result = await supabase.table("products").select("*, category:categories(*), product_variants(*), product_images(*)", count="exact").order("created_at", desc=True).range(from_, to_).execute()
    return {"products": result.data or [], "total": result.count or 0}


@router.post("/products")
async def create_product(body: ProductCreate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.table("products").insert(body.model_dump()).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=400, detail="Failed to create product")


@router.put("/products/{product_id}")
async def update_product(product_id: str, body: ProductUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await supabase.table("products").update(data).eq("id", product_id).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    await supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()
    return {"message": "Product deactivated"}


@router.get("/orders")
async def list_orders_admin(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    page = 1
    page_size = 50
    from_ = (page - 1) * page_size
    to_ = from_ + page_size - 1
    result = await supabase.table("orders").select("*", count="exact").order("created_at", desc=True).range(from_, to_).execute()
    return {"orders": result.data or [], "total": result.count or 0}


@router.put("/orders/{order_id}")
async def update_order_status(order_id: str, body: OrderStatusUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    data = {"status": body.status}
    if body.payment_status:
        data["payment_status"] = body.payment_status
    result = await supabase.table("orders").update(data).eq("id", order_id).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Order not found")


@router.get("/customers")
async def list_customers(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    page = 1
    page_size = 50
    from_ = (page - 1) * page_size
    to_ = from_ + page_size - 1
    result = await supabase.table("profiles").select("*", count="exact").eq("role", "customer").order("created_at", desc=True).range(from_, to_).execute()
    return {"customers": result.data or [], "total": result.count or 0}


class ReviewUpdate(BaseModel):
    is_approved: bool


@router.get("/reviews")
async def list_reviews_admin(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    page = 1
    page_size = 50
    from_ = (page - 1) * page_size
    to_ = from_ + page_size - 1
    result = await supabase.table("reviews").select("*, product:products(name), profile:profiles(full_name)", count="exact").order("created_at", desc=True).range(from_, to_).execute()
    return {"reviews": result.data or [], "total": result.count or 0}


@router.put("/reviews/{review_id}")
async def moderate_review(review_id: str, body: ReviewUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.table("reviews").update({"is_approved": body.is_approved}).eq("id", review_id).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Review not found")


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    is_active: bool | None = None


class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percentage"
    discount_value: float
    min_cart_value: float = 0
    max_discount: float | None = None
    usage_limit: int | None = None


class CouponUpdate(BaseModel):
    discount_type: str | None = None
    discount_value: float | None = None
    min_cart_value: float | None = None
    max_discount: float | None = None
    usage_limit: int | None = None
    is_active: bool | None = None


@router.get("/categories")
async def list_categories(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.table("categories").select("*").order("name").execute()
    return result.data or []


@router.post("/categories")
async def create_category(body: CategoryCreate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.table("categories").insert(body.model_dump()).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=400, detail="Failed to create category")


@router.put("/categories/{category_id}")
async def update_category(category_id: str, body: CategoryUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await supabase.table("categories").update(data).eq("id", category_id).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Category not found")


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    await supabase.table("categories").update({"is_active": False}).eq("id", category_id).execute()
    return {"message": "Category deactivated"}


@router.get("/coupons")
async def list_coupons(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.table("coupons").select("*").order("code").execute()
    return result.data or []


@router.post("/coupons")
async def create_coupon(body: CouponCreate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    data = body.model_dump()
    data["code"] = data["code"].upper()
    result = await supabase.table("coupons").insert(data).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=400, detail="Failed to create coupon")


@router.put("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, body: CouponUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await supabase.table("coupons").update(data).eq("id", coupon_id).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Coupon not found")


@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    await supabase.table("coupons").update({"is_active": False}).eq("id", coupon_id).execute()
    return {"message": "Coupon deactivated"}


MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/upload-image/{product_id}")
async def upload_product_image(product_id: str, file: UploadFile = File(...), current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed (JPEG, PNG, WebP)")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB.")

    ext = file.filename.rsplit(".", 1)[-1] if file.filename else "jpg"
    file_name = f"{product_id}/{uuid.uuid4().hex}.{ext}"

    try:
        headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": file.content_type,
        }
        upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/product-images/{file_name}"
        async with httpx.AsyncClient() as hclient:
            resp = await hclient.put(upload_url, headers=headers, content=contents)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=500, detail="Failed to upload image")

        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/product-images/{file_name}"

        img_result = await supabase.table("product_images").insert({
            "product_id": product_id,
            "url": public_url,
            "alt_text": file.filename or "Product image",
            "position": 0,
        }).execute()

        if not img_result.data:
            raise HTTPException(status_code=500, detail="Failed to save image record")

        return img_result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")


@router.delete("/images/{image_id}")
async def delete_product_image(image_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    img = await supabase.table("product_images").select("url").eq("id", image_id).maybe_single().execute()
    await supabase.table("product_images").delete().eq("id", image_id).execute()

    if img.data:
        try:
            from urllib.parse import urlparse
            path = urlparse(img.data["url"]).path
            file_path = path.replace("/storage/v1/object/public/product-images/", "")
            headers = {"Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"}
            async with httpx.AsyncClient() as hclient:
                await hclient.delete(f"{settings.SUPABASE_URL}/storage/v1/object/product-images/{file_path}", headers=headers)
        except Exception as e:
            logger.warning(f"Failed to delete storage file: {e}")

    return {"message": "Image deleted"}
