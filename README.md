# FarmGate Mango

FarmGate Mango is a farm-to-customer marketplace for mango products. Customers can browse products, create orders, and manage their profiles. Farmers can publish products and manage incoming orders. The application is split into a React frontend and a Django REST API backend.

## Project Structure

```text
farmgate_mango project/
|-- farmgate_backend/
|   `-- farmgate_backend/       Django project, apps, migrations, and backend scripts
|-- farmgate_frontend/
|   `-- farmgate_frontend/      React application built with Vite
`-- README.md
```

## Technology

- Frontend: React, Vite, React Router, Axios
- Backend: Python, Django, Django REST Framework, Simple JWT
- Database: PostgreSQL (SQLite can be selected for local-only testing)
- Shared cache and throttling: Redis (optional locally; recommended for multi-worker deployments)
- Production WSGI server: Gunicorn

## Requirements

- Python 3.10 or later
- Node.js and npm (use a current LTS release compatible with the installed Vite version)
- Docker Desktop for the bundled PostgreSQL and Redis services, or an available PostgreSQL instance

## Local Development

Run the backend and frontend in separate terminals.

### 1. Start PostgreSQL and Redis

From the backend project directory:

```powershell
cd farmgate_backend/farmgate_backend
docker compose up -d
```

On macOS/Linux, use the same `docker compose up -d` command from that directory.

### 2. Configure and run the backend

The backend reads environment settings from `farmgate_backend/farmgate_backend/.env`. The setup scripts create it from `.env.example` if it does not exist.

Windows PowerShell:

```powershell
cd farmgate_backend/farmgate_backend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup_venv.ps1
.\run_dev.ps1
```

macOS/Linux:

```bash
cd farmgate_backend/farmgate_backend
bash setup_venv.sh
bash run_dev.sh
```

The API will be available at `http://localhost:8000`. The development database settings expect PostgreSQL on `localhost:5432`, as provided by Docker Compose. To use SQLite for local testing instead, set `USE_SQLITE=True` in the backend `.env`, activate the backend virtual environment, then run:

```powershell
python manage.py migrate
```

On Windows, activate with `.\venv\Scripts\Activate.ps1`; on macOS/Linux, use `source venv/bin/activate`.

### 3. Configure and run the frontend

In a second terminal:

```powershell
cd farmgate_frontend/farmgate_frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

On macOS/Linux:

```bash
cd farmgate_frontend/farmgate_frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend is served at `http://localhost:5173`. Its `.env.local` file should set `VITE_API_URL=http://localhost:8000/api`. Set `VITE_GOOGLE_CLIENT_ID` if Google sign-in is being used. Restart Vite after changing environment variables.

## Configuration

Backend configuration is documented by the comments in `farmgate_backend/farmgate_backend/.env.example`. Common settings include:

- `SECRET_KEY`: Django secret; replace the example value outside local development.
- `DEBUG`: set to `False` in production.
- `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`: configure for the deployment domains.
- `DATABASE_URL` or `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`: PostgreSQL connection.
- `REDIS_URL`: shared Redis connection; recommended when running multiple backend workers.
- `GOOGLE_OAUTH_CLIENT_ID`: OAuth client identifier used by the backend.
- `THROTTLE_ANON`, `THROTTLE_USER`, `THROTTLE_AUTH`: API request rate limits.

Frontend settings are prefixed with `VITE_` and are bundled into the browser application. Never place passwords, private API keys, or other secrets in frontend environment variables.

## API Overview

All API routes use the `/api/` prefix. Authentication uses JWT access tokens.

| Area | Routes |
| --- | --- |
| Authentication | `/api/auth/register/`, `/api/auth/login/`, `/api/auth/google/`, `/api/auth/profile/`, `/api/auth/farmers/` |
| Farmer registration | `/api/auth/farmer/send-otp/`, `/api/auth/farmer/verify-otp/` |
| Products | `/api/products/`, `/api/products/<id>/`, `/api/products/my/`, `/api/products/<id>/review/` |
| Orders | `/api/orders/place/`, `/api/orders/my/`, `/api/orders/farmer/`, `/api/orders/<id>/` |
| Django admin | `/admin/` |

Product listing supports optional `category` and `farmer` query parameters. Authenticated requests should send `Authorization: Bearer <access-token>`.

## Tests and Quality Checks

Run backend checks from `farmgate_backend/farmgate_backend` after activating the virtual environment:

```powershell
python manage.py check
python manage.py test
```

On Windows, activate with `.\venv\Scripts\Activate.ps1`; on macOS/Linux, use `source venv/bin/activate`.

Run frontend lint and production build from `farmgate_frontend/farmgate_frontend`:

```bash
npm run lint
npm run build
```

## Production and Capacity Testing

Do not use Django's development server in production. The backend includes `gunicorn.conf.py`; a typical Linux deployment command is:

```bash
gunicorn -c gunicorn.conf.py farmgate_backend.wsgi:application
```

Set `DEBUG=False`, a unique secret key, production database and Redis URLs, host/origin allowlists, and worker/thread settings for the deployment. Tune Gunicorn worker counts against the instance's CPU, memory, and database connection limits; a worker setting alone cannot guarantee a user capacity or response time.

For a repeatable 500-virtual-user staging test, follow [the backend load-testing guide](farmgate_backend/farmgate_backend/LOAD_TESTING.md). Use a production-like staging environment and evaluate latency percentiles, errors, CPU/memory, database connections, and Redis. The development setup and unit tests do not certify a sub-second response time or 500-user production capacity.

## Useful Links

- [Backend load-testing guide](farmgate_backend/farmgate_backend/LOAD_TESTING.md)
- [Backend environment template](farmgate_backend/farmgate_backend/.env.example)
- [Frontend environment template](farmgate_frontend/farmgate_frontend/.env.example)