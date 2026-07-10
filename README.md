# Realtime Chat — Production-Grade Chat Platform

A WhatsApp/Telegram-style real-time chat application built with a clean, scalable
architecture: **React + Vite + TypeScript** on the frontend and **Node.js + Express +
Socket.IO + MongoDB + Redis** on the backend.

> **Scope note.** This repository delivers a fully-runnable production core: complete
> authentication (JWT + rotating refresh tokens, email/OTP verification, password reset,
> device sessions), users (profile, presence, block/mute, search), private + group chats,
> messages (text/media/replies/reactions/edit/delete), typing indicators, and read
> receipts — all wired through a hardened Socket.IO layer and Dockerized infrastructure.
> The architecture (repository → service → controller, typed Socket events, Redis
> pub/sub adapter) is designed so the remaining long-tail features (WebRTC calling,
> polls, stickers, scheduled messages, etc.) slot in without refactors. See
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

| Layer      | Technology                                                         |
|------------|--------------------------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Socket.IO client |
| Mobile     | React Native (Expo), TypeScript, NativeWind, React Navigation, TanStack Query, Zustand, Socket.IO client (see [mobile/](mobile/)) |
| Backend    | Node.js, Express, TypeScript, Socket.IO, Mongoose, Redis, Zod      |
| Auth       | bcrypt, JWT access tokens, rotating refresh tokens, device sessions|
| Storage    | Multer + S3/Cloudinary adapter interface                           |
| Infra      | Docker, Docker Compose, Nginx, GitHub Actions, PM2                 |

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
# web:  http://localhost:8080
# api:  http://localhost:4000/api/v1/health
```

## Quick start (local dev)

```bash
# 1. Start infra
docker compose up -d mongo redis

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend
cd frontend && npm install && npm run dev
```

## Documentation

- [Installation Guide](docs/INSTALL.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [API Reference](docs/API.md)
- [Socket Events](docs/SOCKET_EVENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Roadmap / Feature status](docs/ROADMAP.md)

## Project layout

```
chat-app/
├── backend/         Express + Socket.IO API
├── frontend/        React + Vite SPA
├── mobile/          React Native (Expo) app
├── nginx/           Reverse proxy config
├── docs/            Guides & reference
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## License

MIT
