# Environment Variables

All configuration is supplied through environment variables. Copy the template and edit:

```bash
cp .env.example .env
```

The same `.env` file is consumed by Docker Compose, the backend, and (for `VITE_*`
variables) the frontend build. Legend: **Required** variables must be set for the app to
start correctly; **Optional** ones have safe defaults or are only needed for a specific
feature/driver.

---

## Core / Compose

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `NODE_ENV` | Runtime mode (`development` / `production`) | `development` | Optional |
| `TZ` | Container/process timezone | `UTC` | Optional |
| `API_PORT` | Port the API listens on | `4000` | Required |
| `API_HOST` | Bind address for the API | `0.0.0.0` | Optional |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:8080` | Required |

---

## MongoDB / Redis

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/chatapp` | Required |
| `REDIS_URL` | Redis connection URL (adapter, presence, rate limit) | `redis://redis:6379` | Required |

> In local dev (Node running on the host), point these at `localhost`:
> `mongodb://localhost:27017/chatapp` and `redis://localhost:6379`.

---

## JWT

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | `openssl rand -hex 48` output | Required |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | `openssl rand -hex 48` output | Required |
| `JWT_ACCESS_TTL` | Access-token lifetime | `15m` | Optional (default 15m) |
| `JWT_REFRESH_TTL` | Refresh-token lifetime | `30d` | Optional (default 30d) |

> Generate strong secrets with `openssl rand -hex 48`. Never commit real secrets.

---

## Cookies

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `COOKIE_DOMAIN` | Domain for auth cookies | `localhost` | Optional |
| `COOKIE_SECURE` | Set `Secure` flag (use `true` behind HTTPS) | `false` | Optional |

---

## SMTP (email — verification & password reset)

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `SMTP_HOST` | SMTP server host | `smtp.mailtrap.io` | Optional* |
| `SMTP_PORT` | SMTP server port | `2525` | Optional* |
| `SMTP_USER` | SMTP username | `""` | Optional* |
| `SMTP_PASS` | SMTP password | `""` | Optional* |
| `SMTP_FROM` | From header for outgoing mail | `"Chat App <no-reply@chatapp.local>"` | Optional* |

\* Required if you want real email delivery for OTP verification and password reset.

---

## OTP

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `OTP_TTL_SECONDS` | OTP validity window (seconds) | `300` | Optional (default 300) |
| `OTP_LENGTH` | Number of digits in the OTP | `6` | Optional (default 6) |

---

## Rate limiting

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `RATE_LIMIT_WINDOW_MS` | Rolling window size (ms) | `60000` | Optional |
| `RATE_LIMIT_MAX` | Max requests per window per client | `120` | Optional |

> Auth-sensitive routes (register / login / OTP / reset) apply a stricter limit
> (20 requests / 15 minutes) in addition to the global limiter. Counters are shared
> across replicas via Redis (`rate-limit-redis`).

---

## Storage

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `STORAGE_DRIVER` | Upload backend: `local` \| `s3` \| `cloudinary` | `local` | Required |
| `UPLOAD_DIR` | Local upload directory (when driver=local) | `uploads` | Optional |
| `MAX_UPLOAD_MB` | Max upload size in MB | `25` | Optional |

---

## AWS S3 (when `STORAGE_DRIVER=s3`)

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `AWS_REGION` | S3 bucket region | `us-east-1` | Required for s3 |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA…` | Required for s3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `""` | Required for s3 |
| `AWS_S3_BUCKET` | Target bucket name | `chatapp-uploads` | Required for s3 |

---

## Cloudinary (when `STORAGE_DRIVER=cloudinary`)

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `CLOUDINARY_URL` | Cloudinary connection URL | `cloudinary://key:secret@cloud` | Required for cloudinary |

> The Cloudinary driver is on the roadmap — see [ROADMAP.md](ROADMAP.md).

---

## Frontend (Vite)

These are baked into the frontend build (available at build time, prefixed `VITE_`).

| Variable | Description | Example | Required |
|----------|-------------|---------|:--------:|
| `VITE_API_URL` | Base URL the SPA uses for REST calls | `http://localhost:4000` | Required |
| `VITE_SOCKET_URL` | Base URL the SPA uses for Socket.IO | `http://localhost:4000` | Required |

> In the Docker Compose build, these default to `http://localhost:8080` (through Nginx)
> unless overridden.
