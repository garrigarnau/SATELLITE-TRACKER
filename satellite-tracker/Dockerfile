FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# CRA inlines REACT_APP_* at build time, so the keys come in as build args.
ARG REACT_APP_N2YO_API_KEY
ARG REACT_APP_OPENCAGE_API_KEY
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
