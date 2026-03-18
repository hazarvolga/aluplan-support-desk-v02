FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.4

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @aluplan/database db:generate
RUN pnpm --filter @aluplan/backend build
# Use pnpm deploy to isolate the backend package with its production dependencies
RUN pnpm --filter @aluplan/backend --prod deploy /app/deployed-backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the isolated backend application
COPY --from=builder /app/deployed-backend ./
COPY --from=builder /app/dataset ./dataset/
# Ensure dist is copied correctly
COPY --from=builder /app/apps/backend/dist ./dist
# Copy the local prisma config for Prisma 7
COPY --from=builder /app/apps/backend/prisma.config.js ./
# Critical Fix: Copy the prisma adapter and pg modules explicitly if they are missing after deploy
COPY --from=builder /app/node_modules/.pnpm/@prisma+adapter-pg@* ./node_modules/.pnpm/
COPY --from=builder /app/node_modules/@prisma/adapter-pg ./node_modules/@prisma/adapter-pg
COPY --from=builder /app/node_modules/pg ./node_modules/pg

# CRITICAL: Copy the Prisma schema and migrations so they are available for npx prisma migrate
# The config points to node_modules/@aluplan/database/prisma/schema.prisma
RUN mkdir -p ./node_modules/@aluplan/database/prisma
COPY --from=builder /app/packages/database/prisma/schema.prisma ./node_modules/@aluplan/database/prisma/
# Also copy migrations if they exist
COPY --from=builder /app/packages/database/prisma/migrations ./node_modules/@aluplan/database/prisma/migrations
# Ensure generated Prisma client is copied correctly (nested)
COPY --from=builder /app/packages/database/client ./node_modules/@aluplan/database/client

EXPOSE 4000

# Start sequence: Fix Migrations -> Seed -> Run
CMD ["sh", "-c", "echo 'Running Prisma Migrations...'; npx -y prisma@7.4.2 migrate deploy && echo 'Seeding Admin...'; node create-admin.js || true; echo 'Seeding KB...'; node seed-kp.js || true; echo 'Starting Application...'; node dist/src/main.js"]

