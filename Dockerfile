# syntax=docker/dockerfile:1

# Static Shellui Marketplace files. No secrets. FRAME_ANCESTORS sets which
# origins may embed the directory.

FROM node:22-alpine AS build

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

WORKDIR /src/marketplace

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build && rm -f dist/assets/*.map

# Dev stack: deps only. Bind-mount source at /app and keep node_modules in a volume.
FROM node:22-alpine AS dev

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

EXPOSE 5176

CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5176"]

# Runtime stage: unprivileged nginx (uid 101) on port 8080.
FROM nginxinc/nginx-unprivileged:1.29-alpine-slim

USER root
RUN mkdir -p /etc/nginx/snippets && chown 101:101 /etc/nginx/snippets
USER 101

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chmod=755 docker/40-shellui-frame-ancestors.sh /docker-entrypoint.d/40-shellui-frame-ancestors.sh
COPY --from=build /src/marketplace/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
