@echo off
if not exist ".venv2\Scripts\uvicorn.exe" (
    echo [startup-api] Installing dependencies...
    if not exist ".venv2" python -m venv .venv2
    .venv2\Scripts\python -m pip install setuptools -q
    .venv2\Scripts\python -m pip install -r requirements.txt -q
)
.venv2\Scripts\uvicorn main:app --reload --port 8002
