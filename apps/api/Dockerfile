# --- Build stage ---
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy API source
COPY apps/api/ apps/api/

# Generate Prisma client (use local prisma 5.x, not global)
RUN cd apps/api && node ../../node_modules/prisma/build/index.js generate

# Build the API
RUN npx turbo run build --filter=@luggageshare/api

# --- Production stage ---
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN groupadd --system --gid 1001 nestjs && \
    useradd --system --uid 1001 --gid nestjs nestjs

# Copy built output and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

USER nestjs

EXPOSE 8080

ENV PORT=8080

CMD ["node", "apps/api/dist/main"]
