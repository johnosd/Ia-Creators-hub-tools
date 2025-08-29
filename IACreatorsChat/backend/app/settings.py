from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    SECRET_KEY: str = Field(...)
    ACCESS_TOKEN_MINUTES: int = 15
    REFRESH_TOKEN_DAYS: int = 30
    CORS_ORIGINS: str = "http://localhost:3000"
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    OPENAI_API_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
