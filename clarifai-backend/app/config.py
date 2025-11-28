import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Google AI
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "AIzaSyCvY2kzZIWlrIvd4FqjeFV34wzgHiUJdgs")

    # Neo4j
    NEO4J_URI: str = os.getenv("NEO4J_URI", "neo4j+s://4036a5f4.databases.neo4j.io")
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "RXU29A22kMj9HaG2e9hv7lxxEcO3P5KEV2Zs7qKWKAE")
    NEO4J_DATABASE: str = os.getenv("NEO4J_DATABASE", "neo4j")

    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]


settings = Settings()
