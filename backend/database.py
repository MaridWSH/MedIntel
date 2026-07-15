"""Database setup — PostgreSQL with SQLAlchemy 2.0.

The database engine is selected via the DATABASE_URL environment variable.
PostgreSQL is required; SQLite is not supported.
"""

import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("TEST_DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    print("Set it to a PostgreSQL connection URL, e.g.:")
    print("  DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/dbname")
    sys.exit(1)

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    print("ERROR: SQLite is not supported. Use PostgreSQL.")
    sys.exit(1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    """FastAPI dependency — yields a DB session, ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
