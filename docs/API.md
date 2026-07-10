# REST API Reference

Base URL: **`/api/v1`** (e.g. `http://localhost:4000/api/v1`, or `http://localhost:8080/api/v1`
behind Nginx).

All requests and responses are JSON.

---

## Response envelope

Every endpoint returns a consistent envelope.

**Success**

```json
{
  "success": true,
  "data": { }
}
```

**Error**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Human-readable summary",
    "details": [
      { "path": "body.email", "message": "Invalid email" }
    ]
  }
}
```

`details` is optional and is populated primarily by Zod validation failures.

### Error codes

| Code | HTTP status | Meaning |
|------|-------------|---------|
| `BAD_REQUEST` | 400 | Validation failed or malformed input |
| `UNAUTHORIZED` | 401 | Missing / invalid / expired access token |
| `FORBIDDEN` | 403 | Authenticated but not allowed (e.g. not a chat member/admin) |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (e.g. email/username taken) |
| `RATE_LIMITED` | 429 | Too many requests within the window |
| `INTERNAL` | 500 | Unexpected server error |

### Authentication

Protected endpoints require a valid access token, sent either as:

- `Authorization: Bearer <accessToken>` header, or
- the `accessToken` cookie.

In the tables below, **Auth** = ✅ means a valid access token is required.

### Pagination

List endpoints accept `page` and `limit` (offset pagination) or, for message history,
cursor-style `before` + `limit`. Responses include the items and, where applicable,
pagination metadata inside `data`.

---

## Auth — `/auth`

Register, login, OTP, and password-reset routes are **rate-limited to 20 requests / 15
minutes** per client.

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| POST | `/auth/register` | — | `{ email, username, password, displayName }` | Create account; sends verification OTP |
| POST | `/auth/login` | — | `{ email, password }` | Authenticate; returns tokens + creates a Session |
| POST | `/auth/refresh` | — | `{ refreshToken }` (or cookie) | Rotate tokens; reuse-detection revokes session |
| POST | `/auth/logout` | ✅ | — | Revoke the current session |
| POST | `/auth/logout-all` | ✅ | — | Revoke all sessions for the user |
| POST | `/auth/verify-otp` | — | `{ email, code }` | Verify email with OTP |
| POST | `/auth/resend-otp` | — | `{ email }` | Re-send verification OTP |
| POST | `/auth/forgot-password` | — | `{ email }` | Send password-reset OTP/token |
| POST | `/auth/reset-password` | — | `{ email, code, newPassword }` | Reset password with OTP/token |
| POST | `/auth/change-password` | ✅ | `{ currentPassword, newPassword }` | Change password (bumps `passwordChangedAt`) |
| GET | `/auth/me` | ✅ | — | Current authenticated user |

**Example — `POST /auth/login`**

```json
{
  "success": true,
  "data": {
    "user": { "id": "665f…", "username": "ada", "displayName": "Ada L." },
    "accessToken": "eyJhbGci…",
    "refreshToken": "eyJhbGci…"
  }
}
```

---

## Users — `/users`

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| GET | `/users/me` | ✅ | — | Own profile |
| PATCH | `/users/me` | ✅ | `{ displayName?, bio?, avatarUrl?, username? }` | Update profile |
| PATCH | `/users/me/privacy` | ✅ | `{ lastSeen?, profilePhoto?, readReceipts? }` | Update privacy settings |
| GET | `/users/search` | ✅ | `?q=` | Text search users by username/displayName |
| GET | `/users/sessions` | ✅ | — | List active device sessions |
| DELETE | `/users/sessions/:sessionId` | ✅ | — | Revoke a specific session |
| GET | `/users/:userId` | ✅ | — | Public profile of a user |
| POST | `/users/:userId/block` | ✅ | — | Block a user |
| DELETE | `/users/:userId/block` | ✅ | — | Unblock a user |
| POST | `/users/:userId/mute` | ✅ | — | Mute a user |
| DELETE | `/users/:userId/mute` | ✅ | — | Unmute a user |

**Example — `GET /users/me`**

```json
{
  "success": true,
  "data": {
    "id": "665f…",
    "email": "ada@example.com",
    "username": "ada",
    "displayName": "Ada L.",
    "avatarUrl": null,
    "isOnline": true,
    "lastSeen": "2026-07-09T10:00:00.000Z",
    "privacy": { "lastSeen": "everyone", "profilePhoto": "everyone", "readReceipts": true }
  }
}
```

---

## Chats — `/chats`

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| GET | `/chats` | ✅ | `?page&limit&archived` | List the user's chats |
| POST | `/chats/private` | ✅ | `{ userId }` | Open/create a 1:1 chat |
| POST | `/chats/group` | ✅ | `{ name, description?, memberIds, type }` | Create a group/channel/broadcast |
| POST | `/chats/join` | ✅ | `{ code }` | Join via invite code |
| GET | `/chats/:id` | ✅ | — | Get a chat |
| PATCH | `/chats/:id` | ✅ | `{ name?, description?, avatarUrl? }` | Update chat metadata (admin) |
| POST | `/chats/:id/members` | ✅ | `{ memberIds }` | Add members (admin) |
| DELETE | `/chats/:id/members/:userId` | ✅ | — | Remove a member (admin) |
| PATCH | `/chats/:id/members/:userId/role` | ✅ | `{ role }` | Set member role `owner\|moderator\|member` |
| PATCH | `/chats/:id/flags` | ✅ | `{ archived?, pinned?, muted?, draft? }` | Update per-member chat flags/draft |
| POST | `/chats/:id/pin` | ✅ | `{ messageId, pin }` | Pin / unpin a message |
| POST | `/chats/:id/leave` | ✅ | — | Leave the chat |

### Messages (nested under a chat)

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| GET | `/chats/:id/messages` | ✅ | `?limit&before` | Paginated message history (cursor) |
| POST | `/chats/:id/messages` | ✅ | `{ type, text?, attachments?, replyTo?, mentions?, metadata? }` | Send a message |
| POST | `/chats/:id/messages/seen` | ✅ | `{ upToMessageId }` | Mark messages seen up to a point |
| GET | `/chats/:id/messages/search` | ✅ | `?q=` | Full-text search within the chat |

**Example — `POST /chats/:id/messages`**

```json
{
  "success": true,
  "data": {
    "id": "6670…",
    "chat": "665f…",
    "sender": "665a…",
    "type": "text",
    "text": "Hello!",
    "status": "sent",
    "reactions": [],
    "createdAt": "2026-07-09T10:05:00.000Z"
  }
}
```

---

## Messages — `/messages`

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| GET | `/messages/starred` | ✅ | — | List messages the user has starred |
| PATCH | `/messages/:id` | ✅ | `{ text }` | Edit a message (sets `isEdited`, `editedAt`) |
| DELETE | `/messages/:id` | ✅ | — | Delete for everyone |
| DELETE | `/messages/:id/me` | ✅ | — | Delete for me only |
| POST | `/messages/:id/react` | ✅ | `{ emoji }` | Toggle a reaction |
| POST | `/messages/:id/star` | ✅ | — | Toggle star for the current user |
| POST | `/messages/:id/forward` | ✅ | `{ chatIds }` | Forward the message to one or more chats |

**Example — `POST /messages/:id/react`**

```json
{
  "success": true,
  "data": {
    "messageId": "6670…",
    "reactions": [{ "user": "665a…", "emoji": "👍", "createdAt": "2026-07-09T10:06:00.000Z" }]
  }
}
```

---

## Notifications — `/notifications`

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| GET | `/notifications` | ✅ | `?page&limit` | List notifications |
| GET | `/notifications/unread-count` | ✅ | — | Count of unread notifications |
| POST | `/notifications/read-all` | ✅ | — | Mark all as read |

**Example — `GET /notifications/unread-count`**

```json
{ "success": true, "data": { "count": 3 } }
```

---

## Uploads — `/uploads`

| Method | Path | Auth | Body | Description |
|--------|------|:----:|------|-------------|
| POST | `/uploads` | ✅ | `multipart/form-data`, field **`file`** | Upload a file via the active storage driver |

**Example response**

```json
{
  "success": true,
  "data": {
    "file": {
      "url": "https://…/uploads/abc123.png",
      "key": "abc123.png",
      "mimeType": "image/png",
      "fileName": "avatar.png",
      "size": 20481
    }
  }
}
```

Max size is controlled by `MAX_UPLOAD_MB`. The active backend is set by `STORAGE_DRIVER`
(`local` / `s3` / `cloudinary`).

---

## Calls — `/calls`

| Method | Path | Auth | Body / Query | Description |
|--------|------|:----:|--------------|-------------|
| GET | `/calls/history` | ✅ | `?page&limit` | Call history for the current user |

Live call setup (ringing, accept/reject, WebRTC signaling) happens over Socket.IO — see
[SOCKET_EVENTS.md](SOCKET_EVENTS.md). This endpoint returns the persisted `Call` records.

**Example — `GET /calls/history`**

```json
{
  "success": true,
  "data": [
    {
      "id": "668a…",
      "chat": "665f…",
      "type": "video",
      "status": "ended",
      "initiator": "665a…",
      "startedAt": "2026-07-09T09:00:00.000Z",
      "endedAt": "2026-07-09T09:07:30.000Z",
      "durationSec": 450
    }
  ]
}
```

---

## Health — `/health`

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/api/v1/health` | — | Liveness / readiness probe |

```json
{ "success": true, "data": { "status": "ok" } }
```
