# FROM node:latest as builder
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run ng build
# FROM nginx:1.17.1-alpine
# WORKDIR /usr/share/nginx/html
# RUN rm -rf ./*
# COPY --from=builder /app/dist/budget-calculator .
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
# # COPY ./nginx.conf /etc/nginx/nginx.conf
# ## Remove default nginx index page
# # RUN rm -rf /usr/share/nginx/html/*
# # COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# # COPY /dist/inventar-front-end /usr/share/nginx/html

FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY /dist/inventar-front-end /usr/share/nginx/html