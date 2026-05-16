from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fintelos"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database — reads DATABASE_URL from Railway environment, falls back to localhost for local dev
DATABASE_URL: str = os.getenv(
    # Database — reads DATABASE_URL from Railway environment, falls back to localhost for local dev
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://fintelos:fintelos_dev_2024@localhost:5432/fintelos",
    ).replace(
        "postgresql+psycopg2://",
        "postgresql+asyncpg://"
    ).replace(
        "postgresql://",
        "postgresql+asyncpg://"
    )

    # Redis — reads REDIS_URL from Railway environment, falls back to localhost for local dev
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Security — reads JWT_SECRET_KEY from Railway environment, falls back to dev default
    SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "fintelos-dev-secret-key-change-in-production",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://fintelos.vercel.app",
    ]

    # AI Providers — reads OPENAI_API_KEY from Railway environment
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    # Primary AI Model
    PRIMARY_AI_MODEL: str = "mimo-v2.5-pro"
    PRIMARY_AI_PROVIDER: str = "openrouter"

    # Embedding
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
