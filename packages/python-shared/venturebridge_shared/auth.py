import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """FastAPI dependency — verifies the Bearer JWT and returns its payload."""
    secret = os.environ.get("AUTH_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="Server misconfigured: AUTH_SECRET missing")

    try:
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def require_portal(portal: str):
    """Returns a dependency that also checks payload.portal == portal."""
    def _check(payload: dict = Depends(verify_token)) -> dict:
        if payload.get("portal") != portal:
            raise HTTPException(status_code=403, detail="Wrong portal")
        return payload
    return _check
