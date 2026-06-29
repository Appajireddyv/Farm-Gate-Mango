"""Database configuration: PostgreSQL for local development and production."""

import os
from pathlib import Path


def _is_debug() -> bool:
    value = os.environ.get('DEBUG', 'true')
    return value.strip().lower() in ('1', 'true', 'yes', 'on')


def _use_sqlite() -> bool:
    value = os.environ.get('USE_SQLITE', '').strip().lower()
    return value in ('1', 'true', 'yes', 'on')


def get_databases(base_dir: Path) -> dict:
    conn_max_age = int(os.environ.get('DB_CONN_MAX_AGE', '600'))
    database_url = os.environ.get('DATABASE_URL', '').strip()

    if database_url:
        import dj_database_url

        config = dj_database_url.config(
            default=database_url,
            conn_max_age=conn_max_age,
            conn_health_checks=True,
            ssl_require=not _is_debug(),
        )
        if 'postgresql' in config.get('ENGINE', ''):
            options = config.setdefault('OPTIONS', {})
            options.setdefault('connect_timeout', 10)
        return {'default': config}

    if _use_sqlite():
        return {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': base_dir / 'db.sqlite3',
            }
        }

    return {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'farmgate'),
            'USER': os.environ.get('DB_USER', 'farmgate'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'farmgate'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': conn_max_age,
            'CONN_HEALTH_CHECKS': True,
            'OPTIONS': {'connect_timeout': 10},
        }
    }
