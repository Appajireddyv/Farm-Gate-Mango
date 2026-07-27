"""Gunicorn settings for production (thousands of concurrent users)."""

import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get('WEB_CONCURRENCY', min(multiprocessing.cpu_count() * 2 + 1, 8)))
threads = int(os.environ.get('GUNICORN_THREADS', '4'))
worker_class = 'gthread'
timeout = int(os.environ.get('GUNICORN_TIMEOUT', '180'))
keepalive = 10
max_requests = int(os.environ.get('GUNICORN_MAX_REQUESTS', '2000'))
max_requests_jitter = 100
preload_app = True
