# Docker deployment (e.g. Hostinger VPS)

This stack runs **MongoDB**, the **Spring Boot** API, and the **Angular** app behind **nginx** on one machine. The production build uses `environment.docker.ts`: the browser calls **`/api/...` on the same host and port as the SPA**, and nginx forwards those requests to the backend.

**Default published ports**

| Service   | Host port | Use |
|-----------|-----------|-----|
| **web** (nginx + Angular) | **4000** | Open the app at `http://YOUR_SERVER:4000` |
| **backend** (Spring Boot) | **9000** | Direct API at `http://YOUR_SERVER:9000/api/...` (optional; the SPA normally uses port 4000 only) |

Set `HTTP_PORT` and `BACKEND_PORT` in `.env` if you need different host ports.

## Requirements

- A **VPS** (or similar) where you can install Docker—not shared hosting without root.
- On **Hostinger**, use a plan that includes **KVM VPS** (or another product that supports Docker). Install Docker Engine and the Compose plugin using Hostinger’s docs or [Docker’s install guide](https://docs.docker.com/engine/install/).

## Quick start

1. On the server, clone this repository and `cd` into it.
2. `cp .env.example .env` and edit if needed (defaults work for a single-server compose).
3. Build and run:

   ```bash
   docker compose build
   docker compose up -d
   ```

4. Open `http://YOUR_SERVER_IP:4000` (or `http://YOUR_DOMAIN:4000`). Open firewall rules for **4000** (and **9000** only if you need the API directly from outside).

Data is stored in the **`mongo_data`** Docker volume. Back it up with your provider’s snapshot tools or `docker run` backup procedures.

## HTTPS

Compose publishes **HTTP on port 4000** (web) and **9000** (backend). For HTTPS you can:

- Terminate TLS on **Hostinger** (if they offer a reverse proxy in front of your VPS), or  
- Install **Caddy** / **Traefik** / **Certbot** on the VPS and proxy to `127.0.0.1:4000` (and optionally `127.0.0.1:9000` if you expose the API under TLS), or  
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
