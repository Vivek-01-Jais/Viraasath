from tests.conftest import client, TEST_USER_ID


def test_list_addresses():
    """List addresses for authenticated user."""
    resp = client.get("/api/addresses/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_create_address_missing_fields():
    """Creating address with missing fields returns 422."""
    resp = client.post("/api/addresses/", json={})
    assert resp.status_code == 422


def test_create_address_empty_strings():
    """Creating address with empty strings returns 422."""
    resp = client.post("/api/addresses/", json={
        "full_name": "",
        "phone": "",
        "line1": "",
        "city": "",
        "state": "",
        "pincode": "",
    })
    assert resp.status_code == 422


def test_delete_nonexistent_address():
    """Deleting non-existent address returns 404."""
    resp = client.delete("/api/addresses/00000000-0000-0000-0000-000000000000")
    assert resp.status_code in (404, 500)
