#!/bin/bash
set -e
if [ ! -f ".venv/Scripts/uvicorn" ]; then
  echo "[admin-api] Installing dependencies..."
  [ -d .venv ] || python -m venv .venv
  .venv/Scripts/python -m pip install setuptools -q
  .venv/Scripts/python -m pip install -r requirements.txt -q
fi
exec .venv/Scripts/uvicorn main:app --reload --port 8003
