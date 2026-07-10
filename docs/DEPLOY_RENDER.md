# Deploy the backend live (Render + MongoDB Atlas) — free

This makes the API reachable from anywhere over HTTPS, so the mobile app works
without being on the same Wi-Fi as your PC.

Flow: **MongoDB Atlas** (database) → **GitHub** (host the code) → **Render**
(run the API) → **point the mobile app** at the live URL.

---

## 1. MongoDB Atlas — free database

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. **Create a free cluster** → choose the **M0 (Free)** tier → any provider/region.
3. **Database Access** → *Add New Database User* → username + password (save them).
4. **Network Access** → *Add IP Address* → **Allow access from anywhere**
   (`0.0.0.0/0`) so Render can connect.
5. **Connect** → *Drivers* → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Insert your password and add the database name `chatapp` before the `?`:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
   ```
   Keep this — it becomes `MONGO_URI` on Render.

---

## 2. GitHub — push the code

The repo is already committed locally on the `main` branch. Create an **empty**
repo on GitHub (no README/.gitignore), then from `C:\Users\rijju\chat-app`:

```bash
git remote add origin https://github.com/<your-username>/pulse-chat.git
git push -u origin main
```

> If git asks for a password, use a **Personal Access Token** (GitHub → Settings
> → Developer settings → Tokens), not your account password.

---

## 3. Render — run the API (free)

1. Sign up: https://render.com → **connect your GitHub**.
2. **New + → Blueprint** → pick the `pulse-chat` repo. Render reads `render.yaml`
   and shows the `pulse-chat-api` service → **Apply**.
3. Open the service → **Environment** → set the one secret it asked for:
   - `MONGO_URI` = your Atlas connection string from step 1.
   (JWT secrets are auto-generated; everything else is pre-filled.)
4. It builds and deploys (~3–5 min). Your URL will be:
   ```
   https://pulse-chat-api.onrender.com
   ```
5. **Verify** — open in a browser:
   ```
   https://pulse-chat-api.onrender.com/api/v1/health
   ```
   You should see `{"success":true,"data":{"status":"ok",...}}`. ✅

---

## 4. Point the mobile app at the live backend

Edit `mobile/app.json` → `expo.extra`:

```json
"extra": {
  "apiUrl": "https://pulse-chat-api.onrender.com",
  "socketUrl": "https://pulse-chat-api.onrender.com",
  "eas": { "projectId": "…" }
}
```

Rebuild the app so the new URL is baked in:

```bash
cd mobile
eas build -p android --profile preview
```

Now install the new APK — the app talks to the live backend from **any network**
(Wi-Fi or mobile data). Socket.IO automatically uses secure `wss://` over HTTPS.

---

## Good to know (free tier)

- **Cold starts:** the free instance sleeps after ~15 min idle; the next request
  (and socket reconnect) takes ~30–60 s to wake it. Upgrade to the Starter plan
  ($7/mo) for always-on.
- **Uploads are ephemeral:** local file storage is wiped on each redeploy/restart.
  For permanent media, set `STORAGE_DRIVER=s3` (or `cloudinary`) and its keys.
- **OTP / reset emails:** with no SMTP configured, the codes/links are printed to
  **Render → Logs** — fine for testing. Add `SMTP_*` env vars to send real email.
- **Redis:** left empty → in-memory mode (correct for one instance). Only needed
  if you run multiple instances; then set `REDIS_URL` (e.g. a free Upstash Redis).
