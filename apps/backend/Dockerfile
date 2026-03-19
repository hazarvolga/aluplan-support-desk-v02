FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.4

FROM base AS builder
WORKDIR /app
# Force development mode so devDependencies (nest CLI, typescript, etc.) are installed
ENV NODE_ENV=development
COPY . .
# Perform full build in builder stage
RUN pnpm install --frozen-lockfile && \
    pnpm --filter @aluplan/database db:generate && \
    pnpm --filter @aluplan/backend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9.15.4 && \
    npm install -g prisma@7.4.2

# 1. Copy workspace metadata
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# 2. Copy the minimal internal database package artifacts (Pre-built)
COPY --from=builder /app/packages/database/index.js /app/packages/database/index.d.ts ./packages/database/
COPY --from=builder /app/packages/database/client ./packages/database/client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/prisma.config.ts ./packages/database/

# 3. Install production dependencies (Resource optimized)
RUN pnpm install --prod --no-optional --frozen-lockfile --filter @aluplan/backend

# 4. Copy backend artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/dataset ./dataset/
# Copy the deployment script
COPY --from=builder /app/apps/backend/scripts/deploy.sh ./deploy.sh

# Final permissions and port config
RUN chmod +x ./deploy.sh
EXPOSE 4000
ENV PORT=4000

# Start via specialized script
CMD ["./deploy.sh"]
