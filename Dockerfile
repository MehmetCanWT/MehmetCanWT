FROM oven/bun:latest AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
RUN bun install

# Build the apps
FROM deps AS builder
COPY . .
# Build the web app for production
RUN bun run build

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./

# Only expose 3000 in production
EXPOSE 3000

ENV NODE_ENV production

# Start the unified Elysia server
CMD ["bun", "run", "start"]
