# Roadmap & Feature Status

This matrix reflects the **actual** state of the codebase. Legend:

- ✅ **Implemented** — built end-to-end (API + realtime + persistence, and UI where
  applicable).
- 🚧 **Roadmap** — the underlying primitives / signaling / data model exist, but the full
  UX is pending or the specific integration is not yet bundled.

---

## ✅ Implemented

### Authentication
| Feature | Status | Notes |
|---------|:------:|-------|
| Register | ✅ | Email + username + password (bcrypt) |
| Login | ✅ | Creates a device Session |
| Email / OTP verification | ✅ | `verify-otp` / `resend-otp`, configurable TTL & length |
| Forgot / reset password | ✅ | OTP/token based |
| Change password | ✅ | Bumps `passwordChangedAt` |
| Access + refresh tokens | ✅ | JWT access (15m) + refresh (30d) |
| Refresh-token rotation | ✅ | Hashed at rest; reuse-detection revokes the session |
| Device sessions | ✅ | List / revoke individual sessions; TTL-expiry |
| Logout / logout-all | ✅ | Revoke current session / all sessions |

### Users
| Feature | Status | Notes |
|---------|:------:|-------|
| Profile view / edit | ✅ | displayName, bio, avatar, username |
| Privacy settings | ✅ | lastSeen, profilePhoto, readReceipts |
| Block / unblock | ✅ | Per-user block list |
| Mute / unmute | ✅ | Per-user mute list |
| User search | ✅ | Text index on username/displayName |
| Presence (online/offline) | ✅ | Redis-backed, multi-tab safe |
| Last-seen | ✅ | Persisted on last-socket disconnect |

### Chats
| Feature | Status | Notes |
|---------|:------:|-------|
| Private (1:1) chats | ✅ | |
| Group chats | ✅ | Roles: owner / moderator / member |
| Channels | ✅ | Chat `type=channel` |
| Broadcast lists | ✅ | Chat `type=broadcast` |
| Invite codes | ✅ | Unique sparse `inviteCode`, join by code |
| Member management | ✅ | Add/remove members, role changes, leave |
| Per-member flags | ✅ | archived, pinned, muted, draft |

### Messages
| Feature | Status | Notes |
|---------|:------:|-------|
| Text messages | ✅ | |
| Media attachments | ✅ | image/video/audio/voice/document + metadata |
| Replies | ✅ | `replyTo` |
| Forwarding | ✅ | `forward` to multiple chats; `forwardedFrom` |
| Reactions | ✅ | Emoji reactions, live broadcast |
| Edit | ✅ | `isEdited` / `editedAt` |
| Delete for everyone | ✅ | |
| Delete for me | ✅ | Per-user `deletedFor` |
| Star | ✅ | Per-user starred list + `GET /messages/starred` |
| Pin | ✅ | Chat `pinnedMessages` |
| Mentions | ✅ | `mentions[]` + mention notifications |
| Full-text search | ✅ | Per-chat text search |
| Drafts | ✅ | Per-member `draft` |
| Unread counts | ✅ | Per-member `unreadCount` |
| Archive | ✅ | Per-member `archived` flag |

### Realtime & receipts
| Feature | Status | Notes |
|---------|:------:|-------|
| Read receipts (sent/delivered/seen) | ✅ | Honors `privacy.readReceipts` |
| Typing indicators | ✅ | `typing` / `stop-typing` |
| Activity indicators | ✅ | `activity({chatId,kind})` |
| Notifications | ✅ | message/mention/reaction/invite/call/system |

### Uploads & calls
| Feature | Status | Notes |
|---------|:------:|-------|
| File uploads — local | ✅ | Multer, `STORAGE_DRIVER=local` |
| File uploads — S3 | ✅ | `STORAGE_DRIVER=s3` adapter |
| WebRTC call signaling | ✅ | start/accept/reject/signal/screen-share/end over sockets |
| Call history | ✅ | Persisted `Call` records + `GET /calls/history` |

### Infrastructure
| Feature | Status | Notes |
|---------|:------:|-------|
| Redis-backed presence | ✅ | Per-user socket-id sets |
| Horizontal scaling | ✅ | Socket.IO Redis adapter + shared Redis/Mongo |
| PM2 cluster mode | ✅ | One worker per instance |
| Docker / Docker Compose | ✅ | mongo, redis, api, web, nginx |
| Nginx reverse proxy | ✅ | `ip_hash` sticky sessions for WebSockets |
| GitHub Actions CI | ✅ | |

---

## 🚧 Roadmap

Primitives / signaling / data model are present, but full UX or the specific integration
is pending or not yet bundled.

| Feature | Status | What exists today | What's pending |
|---------|:------:|-------------------|----------------|
| Polls | 🚧 | `Message.type=poll` and `metadata` support the data shape | Poll creation/voting UI and result aggregation |
| Stickers / GIF picker | 🚧 | Media attachments pipeline handles the payloads | Sticker/GIF picker UI and provider integration |
| Scheduled messages | 🚧 | Message model + send path | A durable **job queue** to enqueue and dispatch at send time |
| Push notifications | 🚧 | In-app `Notification` model + socket `notification` events | web-push / FCM delivery and subscription management |
| Call recording | 🚧 | Call signaling + `Call` records | Media capture/storage pipeline |
| Group video call UI | 🚧 | Multi-party signaling primitives (`call-signal`, `screen-share`, participants[]) | Grid/gallery multi-party video UI |
| Message virtualization tuning | 🚧 | Message list rendering | Performance tuning for very large histories |
| Cloudinary storage driver | 🚧 | `STORAGE_DRIVER=cloudinary` config slot + `CLOUDINARY_URL` env | The Cloudinary adapter implementation |

> The layered architecture (route → service → repository, typed socket events, pluggable
> storage adapters, Redis pub/sub) is designed so these items slot in without structural
> refactors.
