# Backend load test

Run this against an isolated staging deployment that uses the same database,
instance size, and Gunicorn settings as production. Do not run it against the
development server or a production service receiving real traffic.

Install Locust from the backend directory:

```powershell
python -m pip install -r requirements-loadtest.txt
```

For staging only, set `THROTTLE_ANON` high enough that the IP-based API rate
limit does not dominate the test (for example, `100000/hour`), then restart the
backend. Keep normal rate limits enabled in production. Ensure `DATABASE_URL`
points to PostgreSQL and `REDIS_URL` points to shared Redis when testing a
multi-worker deployment.

Run 500 virtual users, ramping up by 25 users per second for five minutes:

```powershell
locust -f locustfile.py --host https://YOUR-STAGING-HOST --headless -u 500 -r 25 --run-time 5m --html farmgate-load-report.html
```

Review the report for `/api/products/`. A useful initial acceptance target is
zero failed requests and p95 response time below 1 second for the full run.
Also inspect host CPU/memory, database connections/CPU, and Redis metrics. The
500 users here are active virtual users with a 1-3 second think time, not 500
requests guaranteed to arrive in the exact same instant. Increase the request
rate separately if that is the traffic pattern you need to support.

Gunicorn worker and thread counts are controlled by `WEB_CONCURRENCY` and
`GUNICORN_THREADS` in `gunicorn.conf.py`; tune them against measured CPU,
memory, and database connection limits rather than setting them from user count
alone.