#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Virtual environment not found. Run: bash setup_venv.sh"
  exit 1
fi

echo "🥭 Starting FarmGate Backend (venv)..."
./venv/bin/python manage.py runserver 0.0.0.0:8000
