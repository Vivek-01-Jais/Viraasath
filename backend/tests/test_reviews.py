from tests.conftest import client, TEST_USER_ID


def test_list_reviews_public():
    """Public product reviews endpoint works without auth."""
    resp = client.get("/api/reviews/product/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 200
    data = resp.json()
    assert "reviews" in data
    assert "average_rating" in data
    assert "total_reviews" in data


def test_create_review_missing_fields():
    """Creating review with missing fields returns 422."""
    resp = client.post("/api/reviews/", json={})
    assert resp.status_code == 422


def test_create_review_empty_rating():
    """Creating review with no rating returns 422."""
    resp = client.post("/api/reviews/", json={
        "product_id": "00000000-0000-0000-0000-000000000000",
    })
    assert resp.status_code == 422


def test_create_review_out_of_range_rating():
    """Creating review with rating out of 1-5 range returns 400."""
    resp = client.post("/api/reviews/", json={
        "product_id": "00000000-0000-0000-0000-000000000000",
        "rating": 10,
    })
    assert resp.status_code in (400, 422)
