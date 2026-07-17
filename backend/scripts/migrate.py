"""One-off migration to add metadata columns missing from older SQLite DBs.

Run with: python scripts/migrate.py
"""

import os
import sqlite3
import sys

# Allow imports from the app package when running from scripts/
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

DB_PATH = os.path.join(project_root, "medintel.db")

PAPER_COLUMNS = [
    ("journal", "TEXT", "''"),
    ("doi", "VARCHAR(255)", "''"),
    ("author_list", "TEXT", "''"),
    ("authors_count", "INTEGER", "0"),
    ("centers", "TEXT", "''"),
    ("centers_count", "INTEGER", "0"),
    ("citation", "TEXT", "''"),
    ("sections", "TEXT", "''"),
    ("excerpt", "TEXT", "''"),
    ("reviewer", "TEXT", "''"),
]

USER_COLUMNS = [
    ("is_admin", "BOOLEAN", "0"),
]


def _add_columns(conn, table, columns):
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    existing = {row[1] for row in cur.fetchall()}

    for name, col_type, default in columns:
        if name in existing:
            print(f"Column '{name}' already exists in '{table}', skipping.")
            continue
        sql = f"ALTER TABLE {table} ADD COLUMN {name} {col_type} NOT NULL DEFAULT {default}"
        print(f"Executing: {sql}")
        cur.execute(sql)


def migrate():
    conn = sqlite3.connect(DB_PATH)
    _add_columns(conn, "papers", PAPER_COLUMNS)
    _add_columns(conn, "users", USER_COLUMNS)
    conn.commit()
    conn.close()
    print("Migration complete.")


if __name__ == "__main__":
    migrate()
