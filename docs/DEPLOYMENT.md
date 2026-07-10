# Deployment Guide

This guide covers deploying the chat platform to production: building and running with
Docker Compose, the role of the Nginx reverse proxy, PM2 cluster mode, horizontal
scaling, secrets management, health checks, and switching the storage driver to S3.

---

## 1. Topology

```
                      Internet
                         │  (TLS terminated at your edge / LB)
                         ▼
               ┌───────────────────┐
               │       Nginx       │  :8080 → :80
               │  reverse proxy    │  ip_hash sticky sessions
               │  / → web  /api → api
               └─────────┬─────────┘
             ┌───────────┴────────────┐
             ▼                        ▼
      ┌────────────┐           ┌────────────┐
      │  api (×N)  │  ......    │    web     │  (static SPA)
      │ PM2 cluster│           │            │
      └─────┬──────┘           └────────────┘
            │
      ┌─────┴───────────────┐
      ▼                     ▼
 ┌─────────┐          ┌──────────┐
 │  Redis  │          │  MongoDB │
 └─────────┘          └──────────┘
```

---

## 2. Build & run with Docker Compose

The provided `docker-compose.yml` defines five services — `mongo`, `redis`, `api`, `web`,
and `nginx` — on a shared bridge network, with named volumes for Mongo data, Redis data,
and uploads.

```bash
# 1. Configure
cp .env.example .env
#    → set production secrets, real SMTP, COOKIE_SECURE=true, NODE_ENV=production, etc.

# 2. Build and start
docker compose up --build -d

# 3. Verify
docker compose ps
curl -f http://localhost:4000/api/v1/health
```

Public traffic enters through Nginx on **:8080** (map it behind your TLS-terminating
load balancer or set up TLS on the edge). The `api` service is only `expose`d internally
(port 4000) and is reached via the proxy.

For production hardening you typically set: `NODE_ENV=production`, `COOKIE_SECURE=true`,
a real `CORS_ORIGIN`, real `SMTP_*`, and strong `JWT_*` secrets.

---

## 3. Nginx reverse proxy & sticky sessions

Nginx (`nginx/nginx.conf` + `nginx/conf.d`) fronts both the SPA and the API:

- Routes `/` to the `web` service and `/api` (plus the Socket.IO path) to the `api`
  service.
- Serves `/uploads` from the shared uploads volume (mounted read-only) when
  `STORAGE_DRIVER=local`.
- **Sticky sessions via `ip_hash`.** WebSocket connections are long-lived and must stay
  pinned to the same API replica for their entire lifetime. `ip_hash` deterministically
  maps each client to one upstream so the Socket.IO upgrade and its subsequent frames all
  land on the same process. Cross-replica message fan-out is still handled by the
  Socket.IO **Redis adapter** — stickiness is about connection affinity, not broadcast
  correctness.
- Proxies the WebSocket upgrade headers (`Upgrade` / `Connection`) so Socket.IO can
  establish a real WebSocket.

---

## 4. PM2 cluster mode

Inside each `api` container, the Node process is managed by **PM2 in cluster mode**. PM2
forks one worker per instance (`PM2_INSTANCES`, set to `2` in the compose file — set it to
the number of vCPUs available, or `max`), and load-balances incoming connections across
the workers of that container. All workers share the same Redis and MongoDB, so together
with the Redis adapter they behave as a single logical server. PM2 also restarts crashed
workers automatically (zero-downtime within the container).

---

## 5. Horizontal scaling

The app scales out by adding **more `api` replicas** behind Nginx, all pointed at the
**same shared Redis and MongoDB**:

```bash
docker compose up -d --scale api=4
```

What makes this safe:

| Concern | Mechanism |
|---------|-----------|
| Cross-replica broadcast | Socket.IO **Redis adapter** (pub/sub) |
| WebSocket affinity | Nginx **`ip_hash`** sticky sessions |
| Presence across replicas | **Redis** per-user socket-id sets |
| Shared rate-limit counters | **`rate-limit-redis`** |
| Durable state | **MongoDB** (nothing durable in process memory) |

Because no durable state lives in a single process, replicas are interchangeable and can
be added or removed freely. Scale Redis/Mongo vertically or via managed clusters as load
grows.

---

## 6. Secrets management

- **Never commit real secrets.** `.env` is git-ignored; `.env.example` holds only
  placeholders.
- Generate strong JWT secrets: `openssl rand -hex 48` for both `JWT_ACCESS_SECRET` and
  `JWT_REFRESH_SECRET`.
- In production prefer an external secrets store (Docker/Swarm secrets, Kubernetes
  Secrets, AWS Secrets Manager, SSM Parameter Store, Vault) injected as environment
  variables rather than a plaintext `.env` on disk.
- Set `COOKIE_SECURE=true` and serve over HTTPS so auth cookies are only sent over TLS.
- Rotate secrets periodically; rotating `JWT_*` secrets invalidates existing tokens and
  forces re-authentication.

---

## 7. Health checks

- **API liveness/readiness:** `GET /api/v1/health` → `{ "success": true, "data": { "status": "ok" } }`.
- **Compose service health checks** are defined for infrastructure: `mongo` uses
  `mongosh ... ping`, `redis` uses `redis-cli ping`. The `api` service `depends_on` both
  with `condition: service_healthy`, so it only starts once the datastores are ready.
- Wire `GET /api/v1/health` into your orchestrator/load-balancer health probe to gate
  traffic and drive rolling restarts.

---

## 8. Switching the storage driver to S3

Uploads go through a pluggable storage adapter selected by `STORAGE_DRIVER`. To move from
local disk to S3:

1. Set `STORAGE_DRIVER=s3`.
2. Provide `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and
   `AWS_S3_BUCKET`.
3. Restart the `api` service.

With `s3`, uploaded files are stored in the bucket and the upload response returns the
object URL/key — no shared local `uploads` volume is required, which is preferable for
multi-replica deployments (local disk is per-container and not shared across replicas).
The `cloudinary` driver is on the roadmap; see [ROADMAP.md](ROADMAP.md).

> Note: when using `local` storage across multiple replicas, the uploads volume must be a
> shared/network volume for files to be readable by all replicas and by Nginx. `s3` (or
> Cloudinary, once available) avoids this constraint entirely and is the recommended
> production choice.
