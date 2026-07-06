from supabase import create_client, create_async_client, Client
from supabase._async.client import AsyncClient
from app.core.config import settings

supabase: Client | None = None
async_supabase: AsyncClient | None = None


def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return supabase


async def get_async_supabase() -> AsyncClient:
    global async_supabase
    if async_supabase is None:
        async_supabase = await create_async_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return async_supabase
