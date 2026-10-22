# Docker deployment (e.g. Hostinger VPS)

This stack runs **MongoDB**, the **Spring Boot** API and the **Angular** app (served by nginx in the `web` container). The Docker build uses `environment.docker.ts`: the browser calls the API at **same-origin** paths **`/api/...`**, which the `web` container's nginx proxies to the **backend** service on port **9000** inside the compose network.

HTTPS is done **outside Docker** by the server's own nginx with a Let's Encrypt certificate (certbot), which proxies to the `web` container on `127.0.0.1:4001`.

**Published ports**

| Service | Host port | Use |
|---------|-----------|-----|
| **web** (nginx + Angular) | **127.0.0.1:4001** | What the server's nginx proxies to |
| **backend** (Spring Boot) | **127.0.0.1:9000** | From the server itself only, for debugging |

Both are bound to `127.0.0.1`, so they can't be reached from the internet directly (Docker's published ports bypass `ufw`, so the firewall alone would not stop that). Set `WEB_PORT` / `BACKEND_PORT` in `.env` to change them.

## Requirements

- A **VPS** (or similar) where you can install Docker—not shared hosting without root.
- On **Hostinger**, use a plan that includes **KVM VPS** (or another product that supports Docker). Install Docker Engine and the Compose plugin using Hostinger's docs or [Docker's install guide](https://docs.docker.com/engine/install/).
- nginx and certbot on the server, with a certificate for the domain (`sudo certbot --nginx -d financa.cloud -d www.financa.cloud`).

## Quick start

1. On the server, clone this repository and `cd` into it.
2. `cp .env.example .env` and set **`JWT_SECRET`** to 32+ random characters (`openssl rand -base64 48`). It signs login tokens; keep it secret and out of git (`.env` is git-ignored). Changing it signs everyone out.
3. Build and run:

   ```bash
   docker compose build
   docker compose up -d
   ```

4. Point the server's nginx at the app (below) and open `https://financa.cloud`.

Data is stored in the **`mongo_data`** Docker volume. Back it up with your provider's snapshot tools or `mongodump` (`docker compose exec -T mongo mongodump --archive --gzip --db inventar > backup.gz`).

## The server's nginx

The site's `server { listen 443 ssl; ... }` block (e.g. `/etc/nginx/sites-enabled/financa.cloud`, certbot adds the `ssl_*` lines) needs:

```nginx
add_header Strict-Transport-Security "max-age=31536000" always;

location / {
    proxy_pass http://127.0.0.1:4001;   # 127.0.0.1, not localhost (Docker binds IPv4 only)
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    # Required: the API's login rate limit counts per visitor using this header.
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then `sudo nginx -t && sudo systemctl reload nginx`.

## Useful commands

```bash
docker compose logs -f web backend
docker compose down
docker compose pull && docker compose build --no-cache && docker compose up -d
```

## `npm ci` / lock file errors in Docker

If you switch the frontend Dockerfile back to `npm ci`, the lock file must match what Linux resolves (optional native deps). Regenerate it on your machine with `npm install` in `inventar-frontend`, commit the updated `package-lock.json`, or leave the Dockerfile using `npm install`, which is more tolerant when the lock was created on macOS or Windows.
