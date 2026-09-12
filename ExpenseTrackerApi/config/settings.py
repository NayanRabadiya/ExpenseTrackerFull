"""Loads .env and validates every required setting at import time."""

import os
from dotenv import load_dotenv

load_dotenv()


def require_env(name: str) -> str:
    """Return the env var's value, or fail fast if it is missing/empty."""
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


MONGO_URL = require_env("MONGO_URL")
DATABASE_NAME = require_env("DATABASE_NAME")

JWT_SECRET_KEY = require_env("JWT_SECRET_KEY")

CLOUDINARY_CLOUD_NAME = require_env("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = require_env("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = require_env("CLOUDINARY_API_SECRET")

SMTP_SERVER = require_env("SMTP_SERVER")
SMTP_PORT = int(require_env("SMTP_PORT"))
SMTP_EMAIL = require_env("SMTP_EMAIL")
SMTP_PASSWORD = require_env("SMTP_PASSWORD")

CORS_ORIGIN = require_env("CORS_ORIGIN")
