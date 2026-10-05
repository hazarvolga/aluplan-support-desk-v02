FROM node:22.23.3-alpine3.23@sha256:baf676f7d0e552f3231945c2f979055ca121bce128c152f7a34e6bd1728b1c5a AS base
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

FROM node:22.23.3-alpine3.23@sha256:baf676f7d0e552f3231945c2f979055ca121bce128c152f7a34e6bd1728b1c5a AS runner
ARG VCS_REF
RUN printf '%s' "${VCS_REF}" | grep -Eq '^[0-9a-f]{40}$'
LABEL org.opencontainers.image.revision="${VCS_REF}"
WORKDIR /app
ENV NODE_ENV=production
# Playwright/Chromium dependencies for Alpine
RUN apk add --no-cache \
    bash \
    aws-cli \
    openssl \
    fontconfig \
    postgresql17-client \
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

RUN npm install -g pnpm@9.15.4

# 1. Copy entire workspace (metadata + source needed for pnpm install)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/patches ./patches
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/database/package.json ./packages/database/

# 2. Install production deps with resilient network retry settings
RUN pnpm config set registry https://registry.npmjs.org/ && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm config set fetch-timeout 120000 && \
    pnpm config set network-concurrency 4 && \
    pnpm install --prod --frozen-lockfile

# Preserve the migration CLI interface using the frozen workspace dependency.
# Link the executable JS, not pnpm's location-dependent .bin shell wrapper.
RUN test -x /app/packages/database/node_modules/prisma/build/index.js && \
    ln -s /app/packages/database/node_modules/prisma/build/index.js /usr/local/bin/prisma

# 3. Copy database package source files (NOT the generated client)
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/scripts ./packages/database/scripts
COPY --from=builder /app/packages/database/prisma.config.ts ./packages/database/
COPY --from=builder /app/packages/database/prisma.config.js ./packages/database/
COPY --from=builder /app/packages/database/index.js /app/packages/database/index.d.ts ./packages/database/
COPY --from=builder /app/scripts/verify-migration-integrity.mjs ./scripts/verify-migration-integrity.mjs
COPY --from=builder /app/scripts/backup-db.sh ./scripts/backup-db.sh
COPY --from=builder /app/scripts/capture-release-fingerprints.mjs ./scripts/capture-release-fingerprints.mjs
COPY --from=builder /app/scripts/release-fingerprint-rbac.mjs ./scripts/release-fingerprint-rbac.mjs
COPY --from=builder /app/scripts/verify-schema-parity.mjs ./scripts/verify-schema-parity.mjs
COPY --from=builder /app/scripts/verify-rbac-database.mjs ./scripts/verify-rbac-database.mjs

# 4. Generate Prisma client in runner (this creates packages/database/client/)
RUN cd packages/database && prisma generate --schema ./prisma/schema.prisma

# Installation and client generation are complete. Retain the workspace Prisma
# CLI link and all workspace dependencies for migrate-once; remove only the
# reviewed global package-manager locations from the pinned Node base image.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/pnpm \
    /usr/local/lib/node_modules/corepack \
    /opt/yarn-v1.22.22 \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/pnpm \
    /usr/local/bin/pnpx \
    /usr/local/bin/corepack \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg

# 5. Copy backend artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/src/email/templates ./apps/backend/src/email/templates
COPY --from=builder /app/apps/backend/src/email/locales ./apps/backend/src/email/locales

COPY --from=builder /app/apps/backend/scripts/deploy.sh ./apps/backend/scripts/deploy.sh
COPY --from=builder /app/apps/backend/scripts/migrate-once.sh ./apps/backend/scripts/migrate-once.sh

# Final permissions and port config
RUN chmod +x \
    ./apps/backend/scripts/deploy.sh \
    ./apps/backend/scripts/migrate-once.sh \
    ./scripts/backup-db.sh \
    ./packages/database/scripts/backup.sh && \
    bash -n ./scripts/backup-db.sh && \
    bash -n ./packages/database/scripts/backup.sh && \
    pg_dump --version | grep -E 'PostgreSQL\) 17\.' && \
    pg_restore --version | grep -E 'PostgreSQL\) 17\.' && \
    aws --version

# Keep application code root-owned; grant only existing runtime write surfaces.
RUN mkdir -p /app/uploads && \
    touch /app/openapi.json && \
    chown node:node /app/uploads /app/openapi.json && \
    for template_base in \
        /app/apps/backend/dist/email/templates/mjml \
        /app/apps/backend/dist/src/email/templates/mjml \
        /app/apps/backend/src/email/templates/mjml; do \
        if [ -d "$template_base" ]; then \
            mkdir -p "$template_base/screens" && \
            chown -R node:node "$template_base/screens" || exit 1; \
        fi; \
    done
ENV HOME=/home/node
USER node
EXPOSE 4000
ENV PORT=4000

CMD ["./apps/backend/scripts/deploy.sh"]
