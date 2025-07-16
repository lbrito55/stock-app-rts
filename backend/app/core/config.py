from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True
    )
    
    DATABASE_URL: str
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    FINNHUB_API_KEY: str
    FINNHUB_BASE_URL: str = "https://finnhub.io/api/v1"
    
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()