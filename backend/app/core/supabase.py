from supabase import create_client, Client
from app.core.config import settings

supabase: Client | None = None


def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return supabase
