# Build Angular app with same-origin API URLs (see environment.docker.ts)
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx ng build --configuration=docker

# Resolve output folder (Angular may emit `browser/` or flat `dist/...`)
RUN STATIC_DIR="$(dirname "$(find dist -name index.html | head -1)")" \
    && mkdir -p /static \
    && cp -a "${STATIC_DIR}/." /static/

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /static/ /usr/share/nginx/html/
EXPOSE 80
