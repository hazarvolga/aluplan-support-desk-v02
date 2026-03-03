FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Frontend normally doesn't need the database direct access during build, 
# but we follow the same monorepo structure.
RUN pnpm --filter @aluplan/frontend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js standalone output is preferred for Docker, but we'll use a standard start for now
# unless standalone is enabled in next.config.js.
COPY --from=builder /app/apps/frontend/package.json ./
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
# Assuming standard Next.js start
CMD ["npx", "next", "start", "-p", "3000"]
