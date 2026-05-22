FROM node:20-alpine AS base
RUN apk add --no-cache openssl fontconfig
RUN npm install -g pnpm@9.15.4

FROM base AS builder
WORKDIR /app
# Force development mode so devDependencies (nest CLI, typescript, etc.) are installed
ENV NODE_ENV=development
# Avoid downloading heavy browser binaries during build
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY . .


# Remove any pre-existing generated client to avoid version conflicts
RUN rm -rf packages/database/client packages/database/generated
# Use the canonical npm registry for production builds. The mirror has caused
# intermittent 502/504 failures during Coolify deployments.
RUN pnpm config set registry https://registry.npmjs.org/ && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm config set fetch-timeout 120000 && \
    pnpm config set network-concurrency 4
# Perform full build in builder stage
RUN pnpm install --frozen-lockfile && \
    NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter @aluplan/database db:generate && \
    NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter @aluplan/backend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Playwright/Chromium dependencies for Alpine
RUN apk add --no-cache \
    openssl \
    fontconfig \
    postgresql-client \
    curl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV CHROME_BIN=/usr/bin/chromium-browser \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install -g pnpm@9.15.4 && \
    npm install -g prisma@7.4.2

# 1. Copy entire workspace (metadata + source needed for pnpm install)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# 2. Install production deps with resilient network retry settings
RUN pnpm config set registry https://registry.npmjs.org/ && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm config set fetch-timeout 120000 && \
    pnpm config set network-concurrency 4 && \
    pnpm install --prod --frozen-lockfile || pnpm install --prod

# 3. Copy database package source files (NOT the generated client)
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/scripts ./packages/database/scripts
COPY --from=builder /app/packages/database/prisma.config.ts ./packages/database/
COPY --from=builder /app/packages/database/prisma.config.js ./packages/database/
COPY --from=builder /app/packages/database/index.js /app/packages/database/index.d.ts ./packages/database/

# 4. Generate Prisma client in runner (this creates packages/database/client/)
RUN cd packages/database && prisma generate --schema ./prisma/schema.prisma

# 5. Copy backend artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/src/email/templates ./apps/backend/src/email/templates
COPY --from=builder /app/apps/backend/src/email/locales ./apps/backend/src/email/locales

COPY --from=builder /app/apps/backend/scripts/deploy.sh ./deploy.sh
COPY --from=builder /app/apps/backend/scripts/grant-admin.js ./apps/backend/scripts/grant-admin.js
COPY --from=builder /app/apps/backend/scripts/fix-customer-roles.js ./apps/backend/scripts/fix-customer-roles.js

# Final permissions and port config
RUN chmod +x ./deploy.sh
EXPOSE 4000
ENV PORT=4000

CMD ["./deploy.sh"]
