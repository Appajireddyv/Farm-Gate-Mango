$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Installing dependencies..."
& ".\venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\venv\Scripts\pip.exe" install -r requirements.txt

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

Write-Host "Running migrations..."
& ".\venv\Scripts\python.exe" manage.py migrate

Write-Host ""
Write-Host "Setup complete. To start the backend:"
Write-Host "  .\run_dev.ps1"
Write-Host ""
Write-Host "Or manually:"
Write-Host "  .\venv\Scripts\Activate.ps1"
Write-Host "  python manage.py runserver"
