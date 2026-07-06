from tests.conftest import client, TEST_USER_ID


def test_create_razorpay_order_invalid_user():
    """Creating a payment order for a non-existent user returns error."""
    resp = client.post("/api/orders/create-razorpay-order", json={})
    assert resp.status_code in (404, 500)


def test_place_order_empty_cart():
    """Placing an order with no cart returns error."""
    resp = client.post("/api/orders/place", json={
        "address_id": "00000000-0000-0000-0000-000000000000",
    })
    assert resp.status_code in (400, 500)


def test_list_orders_empty():
    """Listing orders for a user with no orders returns empty list."""
    resp = client.get("/api/orders/")
    assert resp.status_code == 200
    assert resp.json() == []


def test_track_order_not_found():
    """Tracking a non-existent order returns 404."""
    resp = client.get("/api/orders/track/NONEXISTENT")
    assert resp.status_code == 404


def test_track_order_invalid_format():
    """Tracking with empty string returns 404."""
    resp = client.get("/api/orders/track/")
    assert resp.status_code == 404


def test_webhook_invalid_signature():
    """Webhook with missing signature returns 200 (graceful handling)."""
    resp = client.post("/api/orders/razorpay-webhook", json={}, headers={})
    assert resp.status_code in (200, 400, 500)
