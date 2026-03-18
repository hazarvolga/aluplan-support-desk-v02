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
# AI Strategic Upgrade: Add OPENAI_API_KEY / GEMINI_API_KEY to Coolify ENV to auto-upgrade from Ollama.
# MJML & Template Fix: Ensure dist folder contains compiled assets.
COPY --from=builder /app/deployed-backend ./
COPY --from=builder /app/dataset ./dataset/
# Ensure dist is copied correctly from the filter output
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 4000

# Start sequence: Fix Migrations -> Deploy -> Run
# Using pnpm start:prod instead of raw node for better task handling if possible, or direct node if fixed.
CMD ["sh", "-c", "echo 'Running Prisma Migrations...'; npx -y prisma@7.4.2 migrate deploy --schema=./node_modules/@aluplan/database/prisma/schema.prisma && echo 'Seeding Admin...'; node create-admin.js || true; echo 'Seeding KB...'; node seed-kp.js || true; echo 'Starting Application...'; node dist/main.js"]
