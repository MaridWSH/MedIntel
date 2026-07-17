"""CLI utility to promote a user to admin.

Usage:
    python scripts/promote_admin.py --email admin@example.com
    python scripts/promote_admin.py --id 1
"""

import argparse
import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.core.database import SessionLocal
from app.db.models import User


def promote(email: str | None = None, user_id: int | None = None) -> User:
    db = SessionLocal()
    try:
        query = db.query(User)
        if user_id is not None:
            user = query.filter(User.id == user_id).first()
        elif email is not None:
            user = query.filter(User.email == email).first()
        else:
            raise ValueError("Provide either --email or --id")

        if not user:
            raise ValueError("User not found")

        user.is_admin = True
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Promote a user to admin")
    parser.add_argument("--email", type=str, help="User email")
    parser.add_argument("--id", type=int, help="User ID")
    args = parser.parse_args()

    if not args.email and not args.id:
        parser.error("Provide --email or --id")

    try:
        user = promote(email=args.email, user_id=args.id)
        print(f"User {user.id} ({user.email}) is now admin.")
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
