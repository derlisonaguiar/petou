# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY .npmrc ./

# Copy packages
COPY packages/shared/package.json ./packages/shared/

# Copy API
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN /app/node_modules/.bin/prisma generate

# Build using nest cli directly from hoisted node_modules
WORKDIR /app/apps/api
RUN /app/node_modules/.bin/nest build

# Production stage
FROM node:20-bookworm-slim AS production

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy || true; node dist/main"]