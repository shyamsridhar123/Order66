"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Ollama Configuration
    ollama_base_url: str = "http://localhost:11434/v1"
    ollama_api_key: str = "ollama"  # Ollama doesn't need a real key, but OpenAI client requires one
    
    # Model names (Ollama)
    llm_chat_model: str = "llama3.2:3b"  # Primary chat model
    llm_embedding_model: str = "nomic-embed-text"  # Embedding model

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/nodus.db"

    # Application
    app_env: str = "development"
    app_debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    # Agent settings
    agentflow_max_steps: int = 10
    agentflow_max_time: int = 300
    agentflow_verbose: bool = True

    # CORS (use "*" for LAN access, or add specific IPs)
    allowed_origins: list[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "*",  # Allow all origins for LAN demo access
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
