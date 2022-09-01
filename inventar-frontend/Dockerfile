FROM nginx:1.17.1-alpine
# COPY ./nginx.conf /etc/nginx/nginx.conf
## Remove default nginx index page
# RUN rm -rf /usr/share/nginx/html/*
COPY /dist/inventar-front-end /usr/share/nginx/html
