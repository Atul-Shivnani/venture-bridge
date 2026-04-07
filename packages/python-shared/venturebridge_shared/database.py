import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()


def _clean_url(url: str) -> str:
    """Strip parameters psycopg2 doesn't understand (e.g. channel_binding)."""
    url = re.sub(r"[&?]channel_binding=[^&]*", "", url)
    url = re.sub(r"\?$|&$", "", url)
    return url


def make_engine():
    raw_url = os.environ.get("DATABASE_URL", "")
    if not raw_url:
        raise RuntimeError("DATABASE_URL is not set")
    url = _clean_url(raw_url)
    return create_engine(url, pool_pre_ping=True, pool_size=5, max_overflow=10)


engine = make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
