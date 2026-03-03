FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @aluplan/database db:generate
RUN pnpm --filter @aluplan/frontend build
# Use pnpm deploy to isolate the frontend package with its production dependencies
RUN pnpm --filter @aluplan/frontend --prod deploy /app/deployed-frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy the deployed application from the builder stage (contains production node_modules)
COPY --from=builder /app/deployed-frontend ./
# Manually copy the .next and public folders since they might be ignored by pnpm deploy
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
