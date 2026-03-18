FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.4

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @aluplan/database db:generate
RUN pnpm --filter @aluplan/backend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9.15.4
# Forcefully install prisma globally
RUN npm install -g prisma@7.4.2

# 1. Copy workspace configuration
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# 2. Copy workspace package source/artifacts (Fixing the "index.js not found" error)
# We copy the entire database package structure except for node_modules
COPY --from=builder /app/packages/database/index.js /app/packages/database/index.d.ts ./packages/database/
COPY --from=builder /app/packages/database/client ./packages/database/client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# 3. Install only production dependencies
# This will handle the symlinking of @aluplan/database correctly
RUN pnpm install --prod --frozen-lockfile --filter @aluplan/backend

# 4. Copy backend build artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/dataset ./dataset/
# Copy the deployment script
COPY --from=builder /app/apps/backend/scripts/deploy.sh ./deploy.sh

# Make deployment script executable
RUN chmod +x ./deploy.sh

EXPOSE 4000
ENV PORT=4000

# Definitive production start using the entrypoint script
CMD ["./deploy.sh"]
