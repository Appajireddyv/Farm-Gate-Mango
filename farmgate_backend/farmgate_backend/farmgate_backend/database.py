"""Database configuration: PostgreSQL for production, SQLite fallback for local dev."""

import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured


def _is_debug() -> bool:
    value = os.environ.get('DEBUG', 'true')
    return value.strip().lower() in ('1', 'true', 'yes', 'on')


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

    db_host = os.environ.get('DB_HOST', '').strip()
    if db_host:
        return {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('DB_NAME', 'farmgate'),
                'USER': os.environ.get('DB_USER', 'farmgate'),
                'PASSWORD': os.environ.get('DB_PASSWORD', ''),
                'HOST': db_host,
                'PORT': os.environ.get('DB_PORT', '5432'),
                'CONN_MAX_AGE': conn_max_age,
                'CONN_HEALTH_CHECKS': True,
                'OPTIONS': {'connect_timeout': 10},
            }
        }

    if not _is_debug():
        raise ImproperlyConfigured(
            'PostgreSQL is required when DEBUG=False. '
            'Set DATABASE_URL (Render/Heroku) or DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.'
        )

    return {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': base_dir / 'db.sqlite3',
        }
    }
