# Docker deployment (e.g. Hostinger VPS)

This stack runs **MongoDB**, the **Spring Boot** API, and the **Angular** app behind **nginx** on one machine. The Docker build uses `environment.docker.ts`: the browser calls the API at **same-origin** paths **`/api/...`** (no port in the URL). The **web** container’s nginx **proxies** `/api` to the **backend** service on port **9000** inside the compose network. The API still has **permissive CORS** in `SpringConfiguration`; same-origin requests do not rely on it.

**Default published ports**

| Service   | Host port | Use |
|-----------|-----------|-----|
| **web** (nginx + Angular) | **4001** | Open the app at `http://YOUR_SERVER:4001` — API is `http://YOUR_SERVER:4001/api/...` |
| **backend** (Spring Boot) | **9000** | Optional direct access (e.g. debugging); the SPA uses `/api` via nginx |

Set `HTTP_PORT` and `BACKEND_PORT` in `.env` if you need different **host** ports. The backend still listens on **9000 inside the container**; nginx proxies to `backend:9000`. Only if you change Spring’s **`server.port`** inside the image should you update **`proxy_pass`** in `inventar-frontend/nginx.conf` and rebuild **web**.

## Requirements

- A **VPS** (or similar) where you can install Docker—not shared hosting without root.
- On **Hostinger**, use a plan that includes **KVM VPS** (or another product that supports Docker). Install Docker Engine and the Compose plugin using Hostinger’s docs or [Docker’s install guide](https://docs.docker.com/engine/install/).

## Quick start

1. On the server, clone this repository and `cd` into it.
2. Optionally `cp .env.example .env` to set **`HTTP_PORT`** / **`BACKEND_PORT`**. The **backend** container does **not** load `.env` (so stray `SPRING_DATA_MONGODB_URI=` or `CORS_*` lines cannot override Mongo). Mongo uses **`SPRING_PROFILES_ACTIVE=docker`** and `docker-compose.yml` / `application-docker.properties`.
3. Build and run:

   ```bash
   docker compose build
   docker compose up -d
   ```

4. Open `http://YOUR_SERVER_IP:4001` (or `http://YOUR_DOMAIN:4001`). Open firewall rules for **4001** (and **9000** only if you need direct API access from outside Docker).

Data is stored in the **`mongo_data`** Docker volume. Back it up with your provider’s snapshot tools or `docker run` backup procedures.

## HTTPS

Compose publishes **HTTP on port 4001** (web) and **9000** (backend). For HTTPS (e.g. `https://www.example.com` with paths like `/api/...` on the same host), terminate TLS in front of the stack and proxy to **`127.0.0.1:4001`** only — `/api` is already handled by the **web** container’s nginx. Alternatively install **Caddy** / **Traefik** / **Certbot** on the VPS, or publish **443** from a custom nginx image with certificates.

## Useful commands

```bash
docker compose logs -f web backend
docker compose down
docker compose pull && docker compose build --no-cache && docker compose up -d
```

## `npm ci` / lock file errors in Docker

If you switch the frontend Dockerfile back to `npm ci`, the lock file must match what Linux resolves (optional native deps). Regenerate it on your machine with `npm install` in `inventar-frontend`, commit the updated `package-lock.json`, or leave the Dockerfile using `npm install`, which is more tolerant when the lock was created on macOS or Windows.
