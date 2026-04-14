"""Application configuration loaded from environment variables."""

import os


class Settings:
    """Central config — reads from env vars with sensible defaults."""

    # ENV: str = os.getenv("ID", "DEFAULT")

settings = Settings()
