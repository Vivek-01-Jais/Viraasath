from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import sentry_sdk

from app.core.config import settings
from app.core.supabase import get_supabase
from app.core.rate_limit import limiter
from app.routes.auth import router as auth_router
from app.routes.addresses import router as addresses_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.admin import router as admin_router
from app.routes.coupons import router as coupons_router
from app.routes.site_content import router as site_content_router

import logging
import traceback

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.validate_required()
    get_supabase()
    logger.info("Supabase client initialized, starting server")

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,
        enable_tracing=True,
        environment="production" if not settings.DEBUG else "development",
    )
    logger.info("Sentry initialized" if settings.SENTRY_DSN else "Sentry not configured (no DSN)")

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}\n{traceback.format_exc()}")
    sentry_sdk.capture_exception(exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

app.include_router(auth_router)
app.include_router(addresses_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(admin_router)
app.include_router(coupons_router)
app.include_router(site_content_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}
