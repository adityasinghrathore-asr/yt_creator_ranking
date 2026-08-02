# Multi-stage build.
# Stage 1: build — runs next build and exports static assets.
# Stage 2: runtime — serves static assets via nginx (cheaper than Next.js on Cloud Run).

FROM node:20-alpine AS build

WORKDIR /app

# config.yaml is mounted read-only at /config.yaml from the monorepo root
COPY config.ts ./
COPY package*.json ./
RUN npm ci

COPY . .

# next.config.ts reads config.yaml via config.ts at build time
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# ---

FROM nginx:alpine AS runtime

COPY --from=build /app/out /usr/share/nginx/html

# Simple SPA routing — all paths serve index.html
RUN echo 'server { \
  listen 3000; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
