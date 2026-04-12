# Docker deployment (e.g. Hostinger VPS)

This stack runs **MongoDB**, the **Spring Boot** API, and the **Angular** app behind **nginx** on one machine. The Docker build uses `environment.docker.ts`: the browser calls the API on **the same host as the page, port `9000`** (e.g. `http://YOUR_IP:9000/api/...`), while the SPA is served on **port `4001`**. That is cross-origin, so you **must** set **`CORS_ORIGIN`** in `.env` to your SPA URL (see below).

**Default published ports**

| Service   | Host port | Use |
|-----------|-----------|-----|
| **web** (nginx + Angular) | **4001** | Open the app at `http://YOUR_SERVER:4001` |
| **backend** (Spring Boot) | **9000** | API base the SPA uses: `http://YOUR_SERVER:9000/api/...` |

Set `HTTP_PORT` and `BACKEND_PORT` in `.env` if you need different host ports. If you change **`BACKEND_PORT`**, also change **`DOCKER_API_PORT`** in `inventar-frontend/src/environments/environment.docker.ts` to match, then rebuild the **web** image.

## Requirements

- A **VPS** (or similar) where you can install Docker—not shared hosting without root.
- On **Hostinger**, use a plan that includes **KVM VPS** (or another product that supports Docker). Install Docker Engine and the Compose plugin using Hostinger’s docs or [Docker’s install guide](https://docs.docker.com/engine/install/).

## Quick start

1. On the server, clone this repository and `cd` into it.
2. `cp .env.example .env` and set **`CORS_ORIGIN`** to your SPA origin (same URL you type in the browser), for example `http://31.97.79.96:4001`. Without this, the browser will block calls from port **4001** to port **9000**.
3. Build and run:

   ```bash
   docker compose build
   docker compose up -d
   ```

4. Open `http://YOUR_SERVER_IP:4001` (or `http://YOUR_DOMAIN:4001`). Open firewall rules for **4001** and **9000** (the SPA talks to the API on **9000** from the browser).

Data is stored in the **`mongo_data`** Docker volume. Back it up with your provider’s snapshot tools or `docker run` backup procedures.

## HTTPS

Compose publishes **HTTP on port 4001** (web) and **9000** (backend). For HTTPS you can:

- Terminate TLS on **Hostinger** (if they offer a reverse proxy in front of your VPS), or  
- Install **Caddy** / **Traefik** / **Certbot** on the VPS and proxy to `127.0.0.1:4001` (and optionally `127.0.0.1:9000` if you expose the API under TLS), or  
- Change the `web` service to publish `443:443` and use a custom nginx image with TLS certificates mounted as files.

## Split frontend and API (optional)

If the SPA is ever hosted on a **different** domain than the API, you must:

1. Rebuild the frontend with an environment file where `serverAPIURL` is the full API origin (e.g. `https://api.example.com`), and  
2. Set `CORS_ORIGIN` in `.env` to your SPA origin(s) so Spring’s `SpringConfiguration` allows the browser.

## Useful commands

```bash
docker compose logs -f web backend
docker compose down
docker compose pull && docker compose build --no-cache && docker compose up -d
```

## `npm ci` / lock file errors in Docker

If you switch the frontend Dockerfile back to `npm ci`, the lock file must match what Linux resolves (optional native deps). Regenerate it on your machine with `npm install` in `inventar-frontend`, commit the updated `package-lock.json`, or leave the Dockerfile using `npm install`, which is more tolerant when the lock was created on macOS or Windows.
