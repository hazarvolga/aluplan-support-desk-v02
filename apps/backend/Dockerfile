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
# Copy the deployed application from the builder stage (contains production node_modules)
COPY --from=builder /app/deployed-backend ./
# Manually copy the dist folder since it might be ignored by pnpm deploy
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 3001
CMD ["sh", "-c", "npx -y prisma@6.3.1 migrate resolve --applied 20260219151110_init_reset --schema=./node_modules/@aluplan/database/prisma/schema.prisma || true && npx -y prisma@6.3.1 migrate deploy --schema=./node_modules/@aluplan/database/prisma/schema.prisma && node dist/main"]
