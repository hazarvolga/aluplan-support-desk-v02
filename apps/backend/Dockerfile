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

# Copy only necessary files for prod install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# Install only production dependencies for the workspace
# This ensures that all modules (@prisma/adapter-pg, etc) are physically present
RUN pnpm install --prod --frozen-lockfile --filter @aluplan/backend

# Copy build artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/database/client ./packages/database/client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/apps/backend/prisma.config.js ./apps/backend/
COPY --from=builder /app/dataset ./dataset/

# Standardize path for Prisma execution
# Move config to root app dir for easier discovery by npx prisma
RUN cp ./apps/backend/prisma.config.js ./prisma.config.js

EXPOSE 4000

# Set environment variable for backend port
ENV PORT=4000

# Command to migrations and starts app from the backend dir
CMD ["sh", "-c", "npx prisma migrate deploy && node apps/backend/dist/src/main.js"]
