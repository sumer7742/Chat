# Installation & Local Setup

This guide covers running the chat app with Docker (recommended) and running it locally
for development.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20.x | Required for local dev (backend & frontend) |
| **npm** | 10.x (bundled with Node 20) | Package manager |
| **Docker** | latest | For the Docker quick-start and for running Mongo/Redis locally |
| **Docker Compose** | v2 (`docker compose`) | Bundled with modern Docker Desktop |

For fully-Dockerized runs you only need Docker; for local dev you need Node 20 plus Docker
(to provide MongoDB and Redis).

---

## Option A — Docker quick-start (recommended)

Brings up MongoDB, Redis, the API, the web SPA, and the Nginx reverse proxy.

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- **Web app:** http://localhost:8080
- **API health check:** http://localhost:4000/api/v1/health

> The web app and API are both reachable through the Nginx proxy on **:8080**. Port
> **:4000** is the API's direct port (useful for the health probe and debugging).

To run in the background:

```bash
docker compose up --build -d
docker compose logs -f          # tail logs
docker compose down             # stop (add -v to also drop volumes/data)
```

---

## Option B — Local development

Run MongoDB and Redis in containers, and run the backend/frontend directly with Node for
fast hot-reload.

### 1. Start infrastructure

```bash
docker compose up -d mongo redis
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

The API starts on **http://localhost:4000** (health at `/api/v1/health`).

> Ensure a `.env` exists (`cp .env.example .env` from the repo root). For local dev the
> Mongo/Redis URLs should point at `localhost` — e.g.
> `MONGO_URI=mongodb://localhost:27017/chatapp` and `REDIS_URL=redis://localhost:6379`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts on **http://localhost:5173** and proxies API/socket calls to
the backend on `:4000` (configured via `VITE_API_URL` / `VITE_SOCKET_URL`).

---

## Running tests

Backend tests:

```bash
cd backend
npm test
```

---

## Ports at a glance

| Service | Port | Where |
|---------|------|-------|
| Nginx (web + API proxy) | 8080 | Docker quick-start |
| API (direct) | 4000 | Docker & local dev |
| Vite dev server | 5173 | Local dev only |
| MongoDB | 27017 | Container |
| Redis | 6379 | Container |

---

## Troubleshooting

- **Port already in use** — stop the conflicting process or change the mapped port in
  `docker-compose.yml` / your `.env`.
- **API can't reach Mongo/Redis in local dev** — confirm the containers are up
  (`docker compose ps`) and that your `.env` uses `localhost` (not the Docker service
  names `mongo`/`redis`, which only resolve inside the Compose network).
- **Health check fails** — inspect logs with `docker compose logs api`.
- See [ENVIRONMENT.md](ENVIRONMENT.md) for the full list of configuration variables.
