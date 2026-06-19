from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.core.supabase import get_supabase
from supabase import Client

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
async def signup(body: SignupRequest, supabase: Client = Depends(get_supabase)):
    result = supabase.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {"data": {"full_name": body.full_name}},
    })
    if result.user:
        return {"message": "User created. Check email for confirmation.", "user_id": result.user.id}
    raise HTTPException(status_code=400, detail=result.error or "Signup failed")


@router.post("/login")
async def login(body: LoginRequest, supabase: Client = Depends(get_supabase)):
    result = supabase.auth.sign_in_with_password({
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


@router.get("/profile/{user_id}")
async def get_profile(user_id: str, supabase: Client = Depends(get_supabase)):
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if result.data:
        return result.data
    raise HTTPException(status_code=404, detail="Profile not found")
