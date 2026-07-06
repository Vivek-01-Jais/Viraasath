from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    APP_NAME: str = "Viraasat API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    SENTRY_DSN: str = ""

    FREE_SHIPPING_MIN: float = 999
    SHIPPING_COST: float = 49
    TAX_RATE: float = 0.0
    ORDER_PREFIX: str = "VR"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024

    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "https://viraasath.vercel.app", "https://viraasath.onrender.com"]
    )

    model_config = {"env_file": ".env", "case_sensitive": True}

    def validate_required(self):
        missing = []
        if not self.SUPABASE_URL:
            missing.append("SUPABASE_URL")
        if not self.SUPABASE_ANON_KEY:
            missing.append("SUPABASE_ANON_KEY")
        if not self.SUPABASE_SERVICE_ROLE_KEY:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")


settings = Settings()
