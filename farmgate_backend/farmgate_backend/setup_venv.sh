#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

echo "Installing dependencies..."
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "Running migrations..."
./venv/bin/python manage.py migrate

echo ""
echo "Setup complete. To start the backend:"
echo "  bash run_dev.sh"
