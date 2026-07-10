# Socket.IO Events

Realtime communication uses Socket.IO. The server runs alongside the REST API and uses
the **Redis adapter** so events fan out correctly across multiple API replicas.

- **Endpoint:** same origin as the API (`VITE_SOCKET_URL`, e.g. `http://localhost:4000`
  in dev, or `:8080` through Nginx).
- **Authentication:** provide the access token in the handshake as `auth.token`
  (bearer), or rely on the `accessToken` cookie. Unauthenticated connections are
  rejected.
- **Transport / stickiness:** WebSocket upgrade requires the client to remain pinned to
  one replica. Nginx uses `ip_hash` sticky sessions to guarantee this (see
  [ARCHITECTURE.md](ARCHITECTURE.md) and [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## Rooms

| Room | Membership | Used for |
|------|------------|----------|
| `user:<id>` | Every socket the user opens joins automatically on connect (multi-tab / multi-device). | Notifications, presence, `user-updated`, call signaling. |
| `chat:<id>` | Joined on `join-chat`, left on `leave-chat`. | Messages, typing, activity, reactions, seen receipts. |

---

## Client → Server events

| Event | Payload | Ack | Description |
|-------|---------|:---:|-------------|
| `join-chat` | `chatId: string` | — | Join the `chat:<id>` room to receive its live events |
| `leave-chat` | `chatId: string` | — | Leave the chat room |
| `typing` | `chatId: string` | — | Broadcast that the user started typing |
| `stop-typing` | `chatId: string` | — | Broadcast that the user stopped typing |
| `activity` | `{ chatId, kind }` | — | Fine-grained activity (e.g. recording audio, uploading) |
| `send-message` | `payload` (message body) | ✅ → persisted message | Create & broadcast a message |
| `message-delivered` | `{ chatId }` | — | Mark newly received messages as delivered |
| `message-seen` | `{ chatId, upToMessageId }` | — | Mark messages seen up to a message |
| `presence-state` | `userIds: string[]` | ✅ → online subset | Query which of the given users are online |
| `call-start` | `{ chatId, calleeIds, type }` | ✅ → `{ callId }` | Initiate a voice/video call |
| `call-accept` | `{ callId, to }` | — | Accept an incoming call |
| `call-reject` | `{ callId, to }` | — | Reject an incoming call |
| `call-signal` | `{ callId, to, data }` | — | Relay WebRTC signaling (SDP / ICE) |
| `screen-share` | `{ callId, to, data }` | — | Relay screen-share signaling |
| `call-end` | `{ callId, to }` | — | End / hang up a call |

---

## Server → Client events

| Event | Payload | Room | Description |
|-------|---------|------|-------------|
| `receive-message` | message object | `chat:<id>` | A new message was sent |
| `message-edited` | message object | `chat:<id>` | A message's text was edited |
| `message-deleted` | `{ messageId, forEveryone }` | `chat:<id>` | A message was deleted |
| `message-reaction` | `{ messageId, reactions }` | `chat:<id>` | Reactions on a message changed |
| `message-seen` | `{ chatId, userId, upToMessageId }` | `chat:<id>` | Read receipt advanced |
| `online` | `{ userId }` | `user:<id>` / interested peers | A user came online |
| `offline` | `{ userId, lastSeen }` | interested peers | A user went offline |
| `chat-updated` | chat object / delta | `chat:<id>` / `user:<id>` | Chat metadata, membership, or flags changed |
| `user-updated` | user object / delta | `user:<id>` | The user's own profile changed (sync across tabs) |
| `notification` | notification object | `user:<id>` | A new notification |
| `typing` | `{ chatId, userId, displayName }` | `chat:<id>` | A user is typing |
| `stop-typing` | `{ chatId, userId }` | `chat:<id>` | A user stopped typing |
| `activity` | `{ chatId, userId, kind }` | `chat:<id>` | Fine-grained activity indicator |
| `call-start` | `{ callId, chatId, from, type, … }` | `user:<id>` | Incoming call notification |
| `call-accept` | `{ callId, from }` | `user:<id>` | Callee accepted |
| `call-reject` | `{ callId, from }` | `user:<id>` | Callee rejected |
| `call-signal` | `{ callId, from, data }` | `user:<id>` | Relayed WebRTC signaling |
| `screen-share` | `{ callId, from, data }` | `user:<id>` | Relayed screen-share signaling |
| `call-end` | `{ callId, from }` | `user:<id>` | Call ended by peer |

---

## Notes

### Acks

Events that need a result use an acknowledgement callback rather than waiting for a
separate server→client event:

- `send-message(payload, ack)` — `ack` receives the fully persisted message (id,
  timestamps, status). The same message is broadcast to other members as
  `receive-message`.
- `call-start(payload, ack)` — `ack` receives `{ callId }` so the caller can track the
  call it just created.
- `presence-state(userIds[], ack)` — `ack` receives the subset of those user ids that are
  currently online.

### Presence

Presence is backed by **Redis sets of socket ids, one set per user**. A user is online
while their set is non-empty, so opening/closing individual tabs or devices does not flip
presence incorrectly (**multi-tab safe**). When a user's last socket disconnects, the
server persists `lastSeen` and emits `offline`. Use `presence-state` to hydrate presence
for a list of users (e.g. when opening a chat list), and listen for `online` / `offline`
for live updates.

### Read receipts

Delivery and seen state progress through `sent → delivered → seen`. Clients emit
`message-delivered` when messages arrive and `message-seen` when the user views them;
peers receive `message-seen`. Whether read receipts are shared honors the sender's
`privacy.readReceipts` setting.

### Reconnection

The Socket.IO client reconnects automatically. On reconnect the client should:

1. Re-authenticate (the handshake carries the token again).
2. Re-`join-chat` for any open conversations (chat-room membership is per-connection and
   is not restored automatically).
3. Re-hydrate presence via `presence-state` and re-fetch any messages missed while
   disconnected (via the REST message history endpoint).

The `user:<id>` personal room is re-joined automatically on (re)connect, so
notifications and presence resume without extra steps.
