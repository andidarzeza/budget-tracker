FROM node:14 as node
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build --prod
# RUN ls

# stage 2
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=node app/dist/inventar-frontend /usr/share/nginx/html
