#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import subprocess
from pathlib import Path


def _use_project_venv():
    """Re-run with the project venv Python when it exists."""
    base = Path(__file__).resolve().parent
    venv_python = (
        base / 'venv' / 'Scripts' / 'python.exe'
        if os.name == 'nt'
        else base / 'venv' / 'bin' / 'python'
    )
    if not venv_python.exists():
        return
    try:
        if Path(sys.executable).resolve() == venv_python.resolve():
            return
    except OSError:
        return
    raise SystemExit(subprocess.call([str(venv_python), *sys.argv]))


def main():
    """Run administrative tasks."""
    _use_project_venv()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farmgate_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
