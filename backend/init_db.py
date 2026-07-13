"""Reset the PostgreSQL database and initialize the schema.

This script drops the configured application database (if it exists), recreates it,
and runs SQLAlchemy's create_all() to build tables from the ORM models.

Usage:
    backend\.venv\Scripts\python.exe backend\init_db.py

Ensure the PostgreSQL container is running before executing this script:
    docker compose up -d postgres
"""

import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, make_url, text
from sqlalchemy.exc import ProgrammingError

# ---------------------------------------------------------------------------
# Load .env from the project root
# ---------------------------------------------------------------------------

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set in the environment or .env file.")
    sys.exit(1)

if DATABASE_URL.startswith("sqlite"):
    print("ERROR: DATABASE_URL points to SQLite. This script is for PostgreSQL only.")
    sys.exit(1)

# Build a temporary URL that connects to the default 'postgres' maintenance database
# so we can drop and recreate the target database.
url = make_url(DATABASE_URL)
maintenance_url = url.set(database="postgres")

target_database = url.database

# ---------------------------------------------------------------------------
# Drop and recreate the target database
# ---------------------------------------------------------------------------

def reset_database():
    """Drop the application database if it exists, then recreate it."""
    maintenance_engine = create_engine(maintenance_url, isolation_level="AUTOCOMMIT")
    with maintenance_engine.connect() as conn:
        # Terminate existing connections to the target database
        try:
            conn.execute(
                text(
                    "SELECT pg_terminate_backend(pid) "
                    "FROM pg_stat_activity "
                    "WHERE datname = :db_name AND pid <> pg_backend_pid()"
                ),
                {"db_name": target_database},
            )
        except ProgrammingError as exc:
            print(f"Warning: could not terminate existing connections: {exc}")

        # Drop the database if it exists
        conn.execute(text(f"DROP DATABASE IF EXISTS {target_database}"))
        print(f"Dropped database '{target_database}' if it existed.")

        # Create the database
        conn.execute(text(f"CREATE DATABASE {target_database}"))
        print(f"Created database '{target_database}'.")

    maintenance_engine.dispose()

# ---------------------------------------------------------------------------
# Create tables from SQLAlchemy models
# ---------------------------------------------------------------------------

def create_schema():
    """Create all tables from the SQLAlchemy ORM models."""
    import models  # noqa: F401 - registers ORM classes with Base.metadata
    from database import Base, engine

    Base.metadata.create_all(bind=engine)
    print("Created tables from SQLAlchemy models.")


def install_fts_trigger_for_db():
    """Install the FTS trigger via the shared helper."""
    from services.fts_service import install_fts_trigger

    install_fts_trigger()
    print("Installed FTS trigger on papers.search_vector.")


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"Resetting database: {target_database}")
    reset_database()
    create_schema()
    install_fts_trigger_for_db()
    print("Database reset complete.")
