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
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/dataset ./dataset/

EXPOSE 3001
# Start sequence: Reset (optional) -> Fix Migrations -> Deploy -> Seed Admin -> Seed Knowledge Pool -> Run
CMD ["sh", "-c", "if [ \"$RESET_DB_ON_START\" = \"true\" ]; then echo 'Wiping DB via DB Execute...'; echo 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' | npx -y prisma@6.3.1 db execute --url \"$DATABASE_URL\" --stdin; fi; echo \"DELETE FROM _prisma_migrations WHERE migration_name = '20260303220000_fix_diverged_schema_sla';\" | npx -y prisma@6.3.1 db execute --url \"$DATABASE_URL\" --stdin || true; npx -y prisma@6.3.1 migrate deploy --schema=./node_modules/@aluplan/database/prisma/schema.prisma && node create-admin.js || true && node seed-kp.js || true && node dist/main"]
