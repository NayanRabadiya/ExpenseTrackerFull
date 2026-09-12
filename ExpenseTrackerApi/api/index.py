"""Vercel serverless entrypoint.

Vercel treats every file under `api/` as a function and serves the ASGI `app`
it finds here. `main.py` and its packages sit one level up, so that directory
has to be on `sys.path` before the import.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402

__all__ = ["app"]
