"""Load the project .env file into os.environ before any backend module imports.

Import this module FIRST (before database/core/routers) so settings read at
import time — like DATABASE_URL and MEDINTEL_SECRET_KEY — see the .env values.

Variables already present in the real environment take precedence and are not
overwritten, so production orchestration (Docker, systemd) keeps working.
"""

from __future__ import annotations

import os
from pathlib import Path

# Project root .env (backend/ -> project root is one level up).
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


# Variables that select the persistence layer are excluded here: the running
# local backend uses SQLite while the committed .env points at Docker Postgres.
# Export DATABASE_URL explicitly if you want the backend to target another DB.
_EXCLUDED_KEYS = {"DATABASE_URL"}


def load_env(path: Path = _ENV_PATH) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if key in _EXCLUDED_KEYS:
            continue
        value = value.strip().strip('"').strip("'")
        # Do not override real env vars already set by the environment.
        os.environ.setdefault(key, value)


load_env()
