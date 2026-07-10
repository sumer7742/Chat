# ─── build stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Vite inlines VITE_* env vars at build time, so they must be present
# as ENV before `npm run build` runs.
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── production stage ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
