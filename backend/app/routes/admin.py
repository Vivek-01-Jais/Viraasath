from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, Field
from app.core.supabase import get_async_supabase
from app.core.config import settings
from app.core.auth import get_admin_user
from supabase._async.client import AsyncClient
import logging
import uuid
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/verify")
async def verify_admin(current_user_id: str = Depends(get_admin_user)):
    return {"is_admin": True}


@router.get("/admins")
async def list_admins(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("profiles").select("id, full_name, created_at").eq("role", "admin").order("created_at").execute()
        admins = result.data or []
        enriched = []
        for a in admins:
            try:
                u = await supabase.auth.admin.get_user_by_id(a["id"])
                a["email"] = u.user.email if u.user else ""
            except Exception:
                a["email"] = ""
            enriched.append(a)
        return enriched
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing admins: {e}")
        raise HTTPException(status_code=500, detail="Failed to list admins")


class GrantAdminRequest(BaseModel):
    email: str = Field(..., min_length=1)


@router.post("/admins")
async def grant_admin(body: GrantAdminRequest, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        users = await supabase.auth.admin.list_users()
        target = None
        for u in users:
            if u.email == body.email.lower():
                target = u
                break
        if not target:
            raise HTTPException(status_code=404, detail="User not found. They must sign up first.")
        profile = await supabase.table("profiles").select("id, role").eq("id", target.id).maybe_single().execute()
        if profile.data and profile.data.get("role") == "admin":
            raise HTTPException(status_code=400, detail="User is already an admin")
        if not profile.data:
            await supabase.table("profiles").insert({"id": target.id, "email": target.email, "full_name": target.user_metadata.get("full_name", ""), "role": "admin"}).execute()
        else:
            await supabase.table("profiles").update({"role": "admin"}).eq("id", target.id).execute()
        return {"message": f"Admin access granted to {body.email}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error granting admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to grant admin access")


@router.delete("/admins/{user_id}")
async def revoke_admin(user_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        if user_id == current_user_id:
            raise HTTPException(status_code=400, detail="You cannot remove yourself as admin")
        await supabase.table("profiles").update({"role": "customer"}).eq("id", user_id).eq("role", "admin").execute()
        return {"message": "Admin access revoked"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to revoke admin access")


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
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = Field(None, max_length=5000)
    price: float = Field(..., gt=0)
    compare_at_price: float | None = Field(None, gt=0)
    category_id: str | None = None
    material: str | None = Field(None, max_length=100)
    care_instructions: str | None = Field(None, max_length=1000)
    is_featured: bool = False
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    slug: str | None = Field(None, min_length=1, max_length=200, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str | None = Field(None, max_length=5000)
    price: float | None = Field(None, gt=0)
    compare_at_price: float | None = Field(None, gt=0)
    category_id: str | None = None
    material: str | None = Field(None, max_length=100)
    care_instructions: str | None = Field(None, max_length=1000)
    is_featured: bool | None = None
    is_active: bool | None = None


class OrderStatusUpdate(BaseModel):
    status: str
    payment_status: str | None = None


@router.get("/dashboard")
async def dashboard(current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")


@router.get("/products")
async def list_products_admin(offset: int = 0, limit: int = 50, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("products").select("*, category:categories(*), product_variants(*), product_images(*)", count="exact").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return {"products": result.data or [], "total": result.count or 0}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        raise HTTPException(status_code=500, detail="Failed to list products")


@router.post("/products")
async def create_product(body: ProductCreate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("products").insert(body.model_dump()).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=400, detail="Failed to create product")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="Failed to create product")


@router.put("/products/{product_id}")
async def update_product(product_id: str, body: ProductUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        data = {k: v for k, v in body.model_dump().items() if v is not None}
        result = await supabase.table("products").update(data).eq("id", product_id).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=404, detail="Product not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update product")


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        await supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()
        return {"message": "Product deactivated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete product")


@router.get("/orders")
async def list_orders_admin(offset: int = 0, limit: int = 50, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("orders").select("*", count="exact").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return {"orders": result.data or [], "total": result.count or 0}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to list orders")


@router.put("/orders/{order_id}")
async def update_order_status(order_id: str, body: OrderStatusUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        VALID_TRANSITIONS = {
            "confirmed": ["shipped", "cancelled"],
            "shipped": ["delivered", "cancelled"],
            "delivered": [],
            "cancelled": [],
        }
        current = await supabase.table("orders").select("status").eq("id", order_id).maybe_single().execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Order not found")
        current_status = current.data["status"]
        allowed = VALID_TRANSITIONS.get(current_status, [])
        if body.status not in allowed:
            raise HTTPException(status_code=400, detail=f"Cannot transition from '{current_status}' to '{body.status}'")
        data = {"status": body.status}
        if body.payment_status:
            data["payment_status"] = body.payment_status
            if body.status == "cancelled" and body.payment_status != "refunded":
                data["payment_status"] = "refunded"
        result = await supabase.table("orders").update(data).eq("id", order_id).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update order")


@router.get("/customers")
async def list_customers(offset: int = 0, limit: int = 50, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("profiles").select("*", count="exact").eq("role", "customer").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return {"customers": result.data or [], "total": result.count or 0}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing customers: {e}")
        raise HTTPException(status_code=500, detail="Failed to list customers")


class ReviewUpdate(BaseModel):
    is_approved: bool


@router.get("/reviews")
async def list_reviews_admin(offset: int = 0, limit: int = 50, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("reviews").select("*, product:products(name), profile:profiles(full_name)", count="exact").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return {"reviews": result.data or [], "total": result.count or 0}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing reviews: {e}")
        raise HTTPException(status_code=500, detail="Failed to list reviews")


@router.put("/reviews/{review_id}")
async def moderate_review(review_id: str, body: ReviewUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("reviews").update({"is_approved": body.is_approved}).eq("id", review_id).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=404, detail="Review not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moderating review {review_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to moderate review")


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
    code: str = Field(..., min_length=1, max_length=20, pattern=r"^[A-Z0-9_]+$")
    discount_type: str = Field(default="percentage", pattern=r"^(percentage|fixed)$")
    discount_value: float = Field(..., gt=0)
    min_cart_value: float = Field(default=0, ge=0)
    max_discount: float | None = Field(None, gt=0)
    usage_limit: int | None = Field(None, gt=0)


class CouponUpdate(BaseModel):
    discount_type: str | None = Field(None, pattern=r"^(percentage|fixed)$")
    discount_value: float | None = Field(None, gt=0)
    min_cart_value: float | None = Field(None, ge=0)
    max_discount: float | None = Field(None, gt=0)
    usage_limit: int | None = Field(None, gt=0)
    is_active: bool | None = None


@router.get("/categories")
async def list_categories(offset: int = 0, limit: int = 100, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("categories").select("*", count="exact").order("name").range(offset, offset + limit - 1).execute()
        return {"categories": result.data or [], "total": result.count or 0}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to list categories")


@router.post("/categories")
async def create_category(body: CategoryCreate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("categories").insert(body.model_dump()).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=400, detail="Failed to create category")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating category: {e}")
        raise HTTPException(status_code=500, detail="Failed to create category")


@router.put("/categories/{category_id}")
async def update_category(category_id: str, body: CategoryUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        data = {k: v for k, v in body.model_dump().items() if v is not None}
        result = await supabase.table("categories").update(data).eq("id", category_id).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=404, detail="Category not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update category")


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        await supabase.table("categories").update({"is_active": False}).eq("id", category_id).execute()
        return {"message": "Category deactivated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting category {category_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete category")


@router.get("/coupons")
async def list_coupons(offset: int = 0, limit: int = 50, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("coupons").select("*", count="exact").order("code").range(offset, offset + limit - 1).execute()
        return {"coupons": result.data or [], "total": result.count or 0}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing coupons: {e}")
        raise HTTPException(status_code=500, detail="Failed to list coupons")


@router.post("/coupons")
async def create_coupon(body: CouponCreate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        data = body.model_dump()
        data["code"] = data["code"].upper()
        result = await supabase.table("coupons").insert(data).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=400, detail="Failed to create coupon")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating coupon: {e}")
        raise HTTPException(status_code=500, detail="Failed to create coupon")


@router.put("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, body: CouponUpdate, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        data = {k: v for k, v in body.model_dump().items() if v is not None}
        result = await supabase.table("coupons").update(data).eq("id", coupon_id).execute()
        if result.data:
            return result.data[0]
        raise HTTPException(status_code=404, detail="Coupon not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating coupon {coupon_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update coupon")


@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        await supabase.table("coupons").update({"is_active": False}).eq("id", coupon_id).execute()
        return {"message": "Coupon deactivated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting coupon {coupon_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete coupon")


@router.post("/upload-image/{product_id}")
async def upload_product_image(product_id: str, file: UploadFile = File(...), current_user_id: str = Depends(get_admin_user), supabase: AsyncClient = Depends(get_async_supabase)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed (JPEG, PNG, WebP)")

    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
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
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image {image_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete image")
