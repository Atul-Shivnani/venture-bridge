@echo off
if not exist ".venv2\Scripts\python.exe" (
    echo [analyst-api] Installing dependencies...
    python -m venv .venv2
    .venv2\Scripts\python -m pip install setuptools -q
    .venv2\Scripts\python -m pip install -r requirements.txt -q
)
.venv2\Scripts\python -m uvicorn main:app --reload --port 8004
