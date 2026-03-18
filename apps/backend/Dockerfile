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
# Forcefully install prisma globally to GUARANTEE "command not found" never happens again
RUN npm install -g prisma@7.4.2

# Copy only necessary files for prod install
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# Install only production dependencies for the workspace
RUN pnpm install --prod --frozen-lockfile --filter @aluplan/backend

# Copy build artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/database/client ./node_modules/@aluplan/database/client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/apps/backend/prisma.config.js ./prisma.config.js
COPY --from=builder /app/dataset ./dataset/

EXPOSE 4000

# Set environment variable for backend port
ENV PORT=4000

# Command to run migrations using the global prisma and the consolidated config
CMD ["sh", "-c", "prisma migrate deploy && node apps/backend/dist/src/main.js"]
