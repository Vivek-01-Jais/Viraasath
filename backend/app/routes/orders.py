import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from pydantic import BaseModel
from app.core.supabase import get_async_supabase, get_supabase
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.auth import get_current_user
from supabase._async.client import AsyncClient
import logging
import hashlib
import hmac
import httpx

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/orders", tags=["orders"])


class PlaceOrderRequest(BaseModel):
    address_id: str
    coupon_code: str | None = None
    razorpay_payment_id: str | None = None
    razorpay_order_id: str | None = None
    razorpay_signature: str | None = None


class RazorpayOrderRequest(BaseModel):
    coupon_code: str | None = None


def get_razorpay_client():
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        import razorpay
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    return None


def verify_razorpay_payment(order_id: str, payment_id: str, signature: str) -> bool:
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)


async def apply_coupon(coupon_code: str | None, subtotal: float, supabase: AsyncClient) -> tuple[float, str | None]:
    if not coupon_code:
        return 0, None
    coupon = await supabase.table("coupons").select("*").eq("code", coupon_code.upper()).maybe_single().execute()
    if not coupon.data:
        return 0, None
    c = coupon.data
    if not c.get("is_active"):
        return 0, None
    if c.get("min_cart_value", 0) > subtotal:
        return 0, None
    raw_discount = subtotal * float(c["discount_value"]) / 100 if c["discount_type"] == "percentage" else float(c["discount_value"])
    max_discount = c.get("max_discount")
    if max_discount:
        raw_discount = min(raw_discount, float(max_discount))
    return round(raw_discount, 2), coupon_code.upper()


async def increment_coupon_usage(code: str, supabase: AsyncClient):
    current = await supabase.table("coupons").select("used_count").eq("code", code).maybe_single().execute()
    new_count = (current.data.get("used_count") or 0) + 1 if current.data else 1
    await supabase.table("coupons").update({"used_count": new_count}).eq("code", code).execute()


async def send_order_confirmation_email(order_id: str, user_id: str):
    supabase = get_supabase()
    try:
        user = supabase.auth.admin.get_user_by_id(user_id)
        user_email = user.user.email if user.user else None
        if not user_email:
            logger.warning(f"No email for user {user_id}, skipping confirmation")
            return

        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            logger.warning(f"Order {order_id} not found, skipping email")
            return

        items = supabase.table("order_items").select("*").eq("order_id", order_id).execute()
        if not items.data:
            logger.warning(f"Order items not found for {order_id}, skipping email")
            return

        edge_function_url = f"{settings.SUPABASE_URL.rstrip('/')}/functions/v1/send-order-confirmation"
        payload = {
            "to": user_email,
            "order_id": order_id,
            "items": [
                {"name": i["product_name"], "quantity": i["quantity"], "price": float(i["unit_price"])}
                for i in items.data
            ],
            "total": float(order.data["total"]),
            "shipping": float(order.data["shipping_cost"]),
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                edge_function_url,
                json=payload,
                headers={"Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"},
                timeout=15,
            )
            if resp.status_code != 200:
                logger.warning(f"Order confirmation email API returned {resp.status_code}: {resp.text}")
            else:
                logger.info(f"Order confirmation email sent for order {order_id}")
    except Exception as e:
        logger.error(f"Failed to send order confirmation email: {e}")


@router.post("/create-razorpay-order")
@limiter.limit("10/minute")
async def create_razorpay_order(body: RazorpayOrderRequest, request: Request, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        cart = await supabase.table("carts").select("id").eq("user_id", current_user_id).maybe_single().execute()
        if not cart.data:
            raise HTTPException(status_code=404, detail="Cart not found")

        items = await supabase.table("cart_items").select("*, product:products(*)").eq("cart_id", cart.data["id"]).execute()
        if not items.data or len(items.data) == 0:
            raise HTTPException(status_code=400, detail="Cart is empty")

        subtotal = sum(float(item["product"]["price"]) * item["quantity"] for item in items.data if item.get("product"))
        discount, applied_code = await apply_coupon(body.coupon_code, subtotal, supabase)
        shipping = 0 if subtotal >= settings.FREE_SHIPPING_MIN else settings.SHIPPING_COST
        total = subtotal + shipping - discount
        amount_paise = int(round(total * 100))

        client = get_razorpay_client()
        if client:
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"receipt_{uuid.uuid4().hex[:12]}",
                "payment_capture": 1,
            })
            return {
                "id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"],
                "key_id": settings.RAZORPAY_KEY_ID,
            }
        else:
            return {
                "id": None,
                "amount": amount_paise,
                "currency": "INR",
                "key_id": None,
                "mock": True,
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")


@router.post("/place")
@limiter.limit("10/minute")
async def place_order(body: PlaceOrderRequest, request: Request, background_tasks: BackgroundTasks, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        cart = await supabase.table("carts").select("id").eq("user_id", current_user_id).maybe_single().execute()
        if not cart.data:
            raise HTTPException(status_code=404, detail="Cart not found")

        items = await supabase.table("cart_items").select("*, product:products(*)").eq("cart_id", cart.data["id"]).execute()
        if not items.data or len(items.data) == 0:
            raise HTTPException(status_code=400, detail="Cart is empty")

        for item in items.data:
            if item.get("variant_id"):
                variant = await supabase.table("product_variants").select("id, stock_quantity, size, color").eq("id", item["variant_id"]).maybe_single().execute()
                if not variant.data:
                    raise HTTPException(status_code=400, detail=f"Variant not found for {item.get('product', {}).get('name', 'unknown')}")
                if variant.data.get("stock_quantity", 0) < item["quantity"]:
                    name = item.get("product", {}).get("name", "unknown")
                    size = variant.data.get("size", "")
                    stock = variant.data["stock_quantity"]
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {name} ({size}): only {stock} left")

        subtotal = sum(float(item["product"]["price"]) * item["quantity"] for item in items.data if item.get("product"))
        discount, applied_code = await apply_coupon(body.coupon_code, subtotal, supabase)
        shipping = 0 if subtotal >= settings.FREE_SHIPPING_MIN else settings.SHIPPING_COST
        total = subtotal + shipping - discount

        order_number = f"{settings.ORDER_PREFIX}{datetime.utcnow().strftime('%y%m%d')}{uuid.uuid4().hex[:6].upper()}"

        is_razorpay = bool(body.razorpay_payment_id and body.razorpay_order_id and body.razorpay_signature)
        payment_verified = False

        if is_razorpay:
            payment_verified = verify_razorpay_payment(
                body.razorpay_order_id,
                body.razorpay_payment_id,
                body.razorpay_signature,
            )
            if not payment_verified:
                raise HTTPException(status_code=400, detail="Payment verification failed")

        tax_amount = round(subtotal * settings.TAX_RATE, 2)

        order_data = {
            "user_id": current_user_id,
            "order_number": order_number,
            "status": "confirmed",
            "payment_status": "paid" if (is_razorpay and payment_verified) or not is_razorpay else "failed",
            "payment_method": "razorpay" if is_razorpay else "mock",
            "razorpay_order_id": body.razorpay_order_id if is_razorpay else None,
            "razorpay_payment_id": body.razorpay_payment_id if is_razorpay else None,
            "subtotal": subtotal,
            "shipping_cost": shipping,
            "tax": tax_amount,
            "total": total,
            "discount_amount": discount,
            "coupon_code": applied_code,
            "shipping_address_id": body.address_id,
        }

        order = await supabase.table("orders").insert(order_data).execute()
        if not order.data:
            raise HTTPException(status_code=500, detail="Failed to create order")

        order_id = order.data[0]["id"]

        order_items_data = []
        for item in items.data or []:
            p = item.get("product")
            if not p:
                continue
            variant = None
            if item.get("variant_id"):
                variant = await supabase.table("product_variants").select("id, size, color").eq("id", item["variant_id"]).maybe_single().execute()
            v_data = variant.data if variant and variant.data else {}

            order_items_data.append({
                "order_id": order_id,
                "product_id": item["product_id"],
                "variant_id": item.get("variant_id"),
                "quantity": item["quantity"],
                "unit_price": float(p["price"]),
                "total_price": float(p["price"]) * item["quantity"],
                "product_name": p["name"],
                "variant_size": v_data.get("size"),
                "variant_color": v_data.get("color"),
            })

        if order_items_data:
            await supabase.table("order_items").insert(order_items_data).execute()

        for item in items.data:
            if item.get("variant_id"):
                result = await supabase.rpc("atomic_decrement_stock", {"variant_id": item["variant_id"], "qty": item["quantity"]}).execute()
                if result.data == -1:
                    pname = next((i.get("product", {}).get("name", "unknown") for i in items.data if i["variant_id"] == item["variant_id"]), "unknown")
                    raise HTTPException(status_code=400, detail=f"Sorry, {pname} just went out of stock!")

        if is_razorpay and payment_verified:
            try:
                client = get_razorpay_client()
                if client:
                    client.payment.capture(body.razorpay_payment_id, int(round(total * 100)), {"currency": "INR"})
            except Exception as cap_err:
                logger.warning(f"Payment auto-capture failed (may already be captured): {cap_err}")

        await supabase.table("cart_items").delete().eq("cart_id", cart.data["id"]).execute()
        await supabase.table("carts").delete().eq("id", cart.data["id"]).execute()

        if applied_code:
            await increment_coupon_usage(applied_code, supabase)

        background_tasks.add_task(send_order_confirmation_email, order_id, current_user_id)

        return {
            "message": "Order placed successfully",
            "order_id": order_id,
            "order_number": order_number,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error placing order: {e}")
        raise HTTPException(status_code=500, detail="Failed to place order")


@router.post("/razorpay-webhook")
async def razorpay_webhook(request: Request, supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        payload = await request.body()
        signature = request.headers.get("x-razorpay-signature", "")

        if settings.RAZORPAY_WEBHOOK_SECRET:
            expected = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                payload,
                hashlib.sha256,
            ).hexdigest()
            if not hmac.compare_digest(expected, signature):
                raise HTTPException(status_code=400, detail="Invalid webhook signature")

        event = await request.json()
        event_type = event.get("event", "")

        if event_type == "payment.captured":
            payment = event.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment.get("order_id")
            payment_id = payment.get("id")
            status = payment.get("status")

            if order_id:
                await supabase.table("orders").update({
                    "payment_status": "paid" if status == "captured" else status,
                    "razorpay_payment_id": payment_id,
                }).eq("razorpay_order_id", order_id).execute()

        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/")
async def list_orders(current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("orders").select("*").eq("user_id", current_user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Error listing orders for user {current_user_id}: {e}")
        return []


@router.get("/{order_id}")
async def get_order(order_id: str, current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        order = await supabase.table("orders").select("*").eq("id", order_id).eq("user_id", current_user_id).maybe_single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found")

        items = await supabase.table("order_items").select("*").eq("order_id", order_id).execute()
        address_id = order.data.get("shipping_address_id")
        address = await supabase.table("addresses").select("*").eq("id", address_id).maybe_single().execute() if address_id else None

        return {
            **order.data,
            "items": items.data or [],
            "shipping_address": address.data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order {order_id}: {e}")
        raise HTTPException(status_code=404, detail="Order not found")


ORDER_PUBLIC_FIELDS = {
    "order_number", "status", "payment_status", "payment_method",
    "subtotal", "shipping_cost", "tax", "total", "discount_amount", "coupon_code",
    "created_at", "updated_at",
}


@router.get("/track/{order_number}")
async def track_order(order_number: str, supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        order = await supabase.table("orders").select(",".join(ORDER_PUBLIC_FIELDS)).eq("order_number", order_number).maybe_single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found")

        items = await supabase.table("order_items").select("product_name, quantity, unit_price, total_price, variant_size, variant_color").eq("order_id", order.data["id"]).execute()
        return {**order.data, "items": items.data or []}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking order {order_number}: {e}")
        raise HTTPException(status_code=404, detail="Order not found")
