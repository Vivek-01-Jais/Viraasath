from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user

# Override auth dependency — use a fixed test user ID for all tests
TEST_USER_ID = "00000000-0000-0000-0000-000000000000"
TEST_ADMIN_ID = "00000000-0000-0000-0000-000000000000"

async def mock_get_current_user():
    return TEST_USER_ID

async def mock_get_admin_user():
    return TEST_ADMIN_ID

app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)
