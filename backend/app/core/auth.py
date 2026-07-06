from fastapi import Header, HTTPException, Depends
from app.core.supabase import get_async_supabase


async def get_current_user(authorization: str = Header(None)) -> str:
    """Extract and verify JWT from Authorization header, return user_id."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid Authorization format. Use: Bearer <token>")

    try:
        supabase = await get_async_supabase()
        user = await supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_admin_user(current_user_id: str = Depends(get_current_user)) -> str:
    """Verify the current user has admin role."""
    try:
        supabase = await get_async_supabase()
        profile = await supabase.table("profiles").select("role").eq("id", current_user_id).maybe_single().execute()
        if not profile.data or profile.data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return current_user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authorization check failed: {str(e)}")
