#!/usr/bin/env python3
"""
ClarifAI Backend Server

Run with: python run.py
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("=" * 50)
    print("  ClarifAI Backend API")
    print("=" * 50)
    print(f"  Starting server at http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"  API Docs: http://localhost:{settings.API_PORT}/docs")
    print("=" * 50)

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
