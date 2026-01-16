#!/usr/bin/env bash
# exit on error
set -o errexit

echo "[render-build] Upgrading pip..."
python -m pip install --upgrade pip

echo "[render-build] Installing dependencies..."
pip install -r requirements.txt

echo "[render-build] Running database import from SQL dump..."
python import_to_render_db.py || echo "Import script failed (check logs)"

echo "[render-build] Setup complete."
