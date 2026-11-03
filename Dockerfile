# Build stage: install everything, generate the Prisma client, build with adapter-node
FROM oven/bun:1.3 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bunx prisma generate && bun run build

# Keep only what the server needs at runtime (prisma included, it runs the migrations)
RUN rm -rf node_modules && bun install --frozen-lockfile --production


# Runtime stage: plain Node runs the adapter-node output as a non-root user
FROM node:24-slim
WORKDIR /app

# Prisma's schema engine needs OpenSSL
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
	PORT=3000 \
	DATABASE_URL=file:/data/app.db \
	UPLOADS_DIR=/data/uploads \
	BODY_SIZE_LIMIT=6M

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

# /data is the persistent volume (database and uploads); the app user must be able to write to it
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
VOLUME /data

EXPOSE 3000

# Apply pending migrations on every start, then serve
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && exec node build"]
