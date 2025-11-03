"""
Vercel entrypoint shim.

Vercel's Python deployment looks for a top-level ASGI app file (for example
`api/main.py`, `app.py`, or `index.py`). This file simply re-exports the
FastAPI `app` instance from the project's backend module so Vercel can detect
and run the FastAPI app without changing the existing backend code.

Do not put application logic here — this file only wires the existing app
instance into a place the platform expects.
"""
from backend.enhanced_perfect_backend import app

# Export `app` (already named correctly) for Vercel's auto-detection.
