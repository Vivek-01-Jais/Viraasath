from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from app.core.supabase import get_async_supabase
from app.core.rate_limit import limiter
from app.core.auth import get_current_user
from supabase._async.client import AsyncClient

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
@limiter.limit("5/hour")
async def signup(body: SignupRequest, request: Request, supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {"data": {"full_name": body.full_name}},
    })
    if result.user:
        return {"message": "User created. Check email for confirmation.", "user_id": result.user.id}
    raise HTTPException(status_code=400, detail=result.error or "Signup failed")


@router.post("/login")
@limiter.limit("20/minute")
async def login(body: LoginRequest, request: Request, supabase: AsyncClient = Depends(get_async_supabase)):
    result = await supabase.auth.sign_in_with_password({
        "email": body.email,
        "password": body.password,
    })
    if result.session:
        return {
            "access_token": result.session.access_token,
            "user_id": result.user.id,
            "email": result.user.email,
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/profile")
async def get_profile(current_user_id: str = Depends(get_current_user), supabase: AsyncClient = Depends(get_async_supabase)):
    try:
        result = await supabase.table("profiles").select("*").eq("id", current_user_id).single().execute()
        if result.data:
            return result.data
    except Exception:
        pass
    raise HTTPException(status_code=404, detail="Profile not found")
