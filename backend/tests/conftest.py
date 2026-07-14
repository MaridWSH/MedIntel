"""pytest configuration for the MedIntel backend tests."""

import os
import sys

os.environ.setdefault("MEDINTEL_SECRET_KEY", "test-only-secret-key-that-is-at-least-32-characters")

# Ensure the backend directory is on sys.path so flat imports work.
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
