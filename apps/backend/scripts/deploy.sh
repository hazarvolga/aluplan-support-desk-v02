#!/bin/sh
set -e

echo "--- Starting Deployment ---"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

# Clean DATABASE_URL for psql (remove ?schema=... etc).
# Use POSIX shell parameter expansion instead of sed because BusyBox sed treats
# "\?" as an invalid basic-regex repetition token.
CLEAN_DB_URL=${DATABASE_URL%%\?*}

echo "[DEPLOY DIAGNOSTIC] Checking known failed migration metadata..."
SUBSCRIPTION_COL_EXISTS=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='customer_profiles' AND column_name='subscription_model';" 2>/dev/null || echo "0")
SUBSCRIPTION_MIGRATION_FAILED=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM \"_prisma_migrations\" WHERE migration_name='20260314110208_add_subscription_model' AND finished_at IS NULL AND rolled_back_at IS NULL;" 2>/dev/null || echo "0")

if [ "$SUBSCRIPTION_COL_EXISTS" = "1" ] && [ "$SUBSCRIPTION_MIGRATION_FAILED" = "1" ]; then
  echo "[DEPLOY FIX] Marking already-applied subscription_model migration as applied..."
  psql "$CLEAN_DB_URL" -v ON_ERROR_STOP=1 -c "
    UPDATE \"_prisma_migrations\"
    SET finished_at = NOW(),
        applied_steps_count = GREATEST(applied_steps_count, 1),
        logs = NULL
    WHERE migration_name = '20260314110208_add_subscription_model'
      AND finished_at IS NULL
      AND rolled_back_at IS NULL;
  "
fi

POOL_PARENT_COL_EXISTS=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='knowledge_pool_embeddings' AND column_name='parent_id';" 2>/dev/null || echo "0")
POOL_PARENT_MIGRATION_FAILED=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM \"_prisma_migrations\" WHERE migration_name='20260316000001_add_pool_embedding_parent_id' AND finished_at IS NULL AND rolled_back_at IS NULL;" 2>/dev/null || echo "0")

if [ "$POOL_PARENT_COL_EXISTS" = "1" ] && [ "$POOL_PARENT_MIGRATION_FAILED" = "1" ]; then
  echo "[DEPLOY FIX] Finalizing already-applied knowledge_pool_embeddings parent_id migration..."
  psql "$CLEAN_DB_URL" -v ON_ERROR_STOP=1 -c "
    DO \$\$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'knowledge_pool_embeddings_parent_id_fkey'
      ) THEN
        ALTER TABLE \"knowledge_pool_embeddings\"
        ADD CONSTRAINT \"knowledge_pool_embeddings_parent_id_fkey\"
        FOREIGN KEY (\"parent_id\") REFERENCES \"knowledge_pool_embeddings\"(\"id\")
        ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END \$\$;

    CREATE INDEX IF NOT EXISTS \"idx_kpe_parent\" ON \"knowledge_pool_embeddings\"(\"parent_id\");

    UPDATE \"_prisma_migrations\"
    SET finished_at = NOW(),
        applied_steps_count = GREATEST(applied_steps_count, 1),
        logs = NULL
    WHERE migration_name = '20260316000001_add_pool_embedding_parent_id'
      AND finished_at IS NULL
      AND rolled_back_at IS NULL;
  "
fi

AI_CACHE_TABLE_EXISTS=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='ai_response_cache';" 2>/dev/null || echo "0")
EMBEDDING_VERSIONING_FAILED=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM \"_prisma_migrations\" WHERE migration_name='20260511000000_add_embedding_versioning' AND finished_at IS NULL AND rolled_back_at IS NULL;" 2>/dev/null || echo "0")

if [ "$AI_CACHE_TABLE_EXISTS" = "0" ] && [ "$EMBEDDING_VERSIONING_FAILED" = "1" ]; then
  echo "[DEPLOY FIX] Creating missing ai_response_cache base table before retrying embedding versioning migration..."
  psql "$CLEAN_DB_URL" -v ON_ERROR_STOP=1 -c "
    CREATE TABLE IF NOT EXISTS \"ai_response_cache\" (
      \"id\" UUID NOT NULL DEFAULT gen_random_uuid(),
      \"query_hash\" TEXT NOT NULL,
      \"query_embedding\" vector,
      \"response\" JSONB NOT NULL,
      \"tenant_id\" UUID NOT NULL,
      \"user_id\" UUID,
      \"confidence\" VARCHAR(20) NOT NULL,
      \"created_at\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \"expires_at\" TIMESTAMP(3) NOT NULL,
      CONSTRAINT \"ai_response_cache_pkey\" PRIMARY KEY (\"id\")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS \"ai_response_cache_query_hash_key\" ON \"ai_response_cache\"(\"query_hash\");
    CREATE INDEX IF NOT EXISTS \"idx_cache_hash\" ON \"ai_response_cache\"(\"query_hash\");
    CREATE INDEX IF NOT EXISTS \"idx_cache_tenant\" ON \"ai_response_cache\"(\"tenant_id\");
    CREATE INDEX IF NOT EXISTS \"idx_cache_expires\" ON \"ai_response_cache\"(\"expires_at\");

    UPDATE \"_prisma_migrations\"
    SET rolled_back_at = NOW()
    WHERE migration_name = '20260511000000_add_embedding_versioning'
      AND finished_at IS NULL
      AND rolled_back_at IS NULL;
  "
fi

echo "Running Prisma migrations..."
echo "[DEPLOY DIAGNOSTIC] Available migrations:"
ls -1 ./packages/database/prisma/migrations/ | grep -E '^[0-9]' | tail -10
MIGRATION_COUNT=$(ls -1 ./packages/database/prisma/migrations/ | grep -E '^[0-9]' | wc -l | tr -d ' ')
echo "[DEPLOY DIAGNOSTIC] Total migration folders: $MIGRATION_COUNT"

# Attempt 1: Standard Prisma migrate deploy
npx prisma migrate deploy \
  --schema ./packages/database/prisma/schema.prisma \
  --config ./packages/database/prisma.config.js || echo "[DEPLOY WARNING] prisma migrate deploy exited non-zero, will try direct SQL fallback"

# Verify critical column exists — if not, apply migrations directly via psql
echo "[DEPLOY DIAGNOSTIC] Checking if is_vip column exists in customer_profiles..."
# Check if is_vip exists in customer_profiles
HAS_VIP=$(psql "$CLEAN_DB_URL" -tAc "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='customer_profiles' AND column_name='is_vip';" 2>/dev/null || echo "0")

if [ "$HAS_VIP" = "0" ]; then
  echo "[DEPLOY FIX] is_vip column MISSING — applying migration SQL directly via psql..."

  psql "$DATABASE_URL" -c "
    -- Migration: 20260426202926_add_proactive_chat
    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProactiveChatStatus') THEN
        CREATE TYPE \"ProactiveChatStatus\" AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'DECLINED', 'MISSED');
      END IF;
    END \$\$;

    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProactiveChatInitiatorType') THEN
        CREATE TYPE \"ProactiveChatInitiatorType\" AS ENUM ('AGENT', 'CUSTOMER');
      END IF;
    END \$\$;

    ALTER TABLE \"customer_profiles\" ADD COLUMN IF NOT EXISTS \"is_vip\" BOOLEAN NOT NULL DEFAULT false;

    CREATE TABLE IF NOT EXISTS \"proactive_chat_sessions\" (
        \"id\" UUID NOT NULL DEFAULT gen_random_uuid(),
        \"agent_id\" UUID NOT NULL,
        \"customer_id\" UUID NOT NULL,
        \"status\" \"ProactiveChatStatus\" NOT NULL DEFAULT 'PENDING',
        \"initiator_type\" \"ProactiveChatInitiatorType\" NOT NULL DEFAULT 'AGENT',
        \"converted_ticket_id\" UUID,
        \"ended_at\" TIMESTAMP(3),
        \"created_at\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \"updated_at\" TIMESTAMP(3) NOT NULL,
        CONSTRAINT \"proactive_chat_sessions_pkey\" PRIMARY KEY (\"id\")
    );

    CREATE TABLE IF NOT EXISTS \"proactive_chat_messages\" (
        \"id\" UUID NOT NULL DEFAULT gen_random_uuid(),
        \"session_id\" UUID NOT NULL,
        \"sender_id\" UUID NOT NULL,
        \"content\" TEXT NOT NULL,
        \"created_at\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \"proactive_chat_messages_pkey\" PRIMARY KEY (\"id\")
    );

    CREATE INDEX IF NOT EXISTS \"idx_pcs_agent_status\" ON \"proactive_chat_sessions\"(\"agent_id\", \"status\");
    CREATE INDEX IF NOT EXISTS \"idx_pcs_customer_status\" ON \"proactive_chat_sessions\"(\"customer_id\", \"status\");
    CREATE INDEX IF NOT EXISTS \"idx_pcs_status\" ON \"proactive_chat_sessions\"(\"status\");
    CREATE INDEX IF NOT EXISTS \"idx_pcm_session_created\" ON \"proactive_chat_messages\"(\"session_id\", \"created_at\");

    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proactive_chat_sessions_agent_id_fkey') THEN
        ALTER TABLE \"proactive_chat_sessions\" ADD CONSTRAINT \"proactive_chat_sessions_agent_id_fkey\" FOREIGN KEY (\"agent_id\") REFERENCES \"users\"(\"id\") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END \$\$;

    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proactive_chat_sessions_customer_id_fkey') THEN
        ALTER TABLE \"proactive_chat_sessions\" ADD CONSTRAINT \"proactive_chat_sessions_customer_id_fkey\" FOREIGN KEY (\"customer_id\") REFERENCES \"users\"(\"id\") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END \$\$;

    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proactive_chat_messages_session_id_fkey') THEN
        ALTER TABLE \"proactive_chat_messages\" ADD CONSTRAINT \"proactive_chat_messages_session_id_fkey\" FOREIGN KEY (\"session_id\") REFERENCES \"proactive_chat_sessions\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END \$\$;

    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proactive_chat_messages_sender_id_fkey') THEN
        ALTER TABLE \"proactive_chat_messages\" ADD CONSTRAINT \"proactive_chat_messages_sender_id_fkey\" FOREIGN KEY (\"sender_id\") REFERENCES \"users\"(\"id\") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END \$\$;

    -- Migration: 20260427000001_add_file_msg_type
    ALTER TYPE \"KnowledgeSourceType\" ADD VALUE IF NOT EXISTS 'FILE_MSG';

    -- Mark both migrations as applied in _prisma_migrations so Prisma won't retry
    INSERT INTO \"_prisma_migrations\" (id, checksum, migration_name, finished_at, applied_steps_count)
    SELECT gen_random_uuid(), 'manual-psql-fix', '20260426202926_add_proactive_chat', NOW(), 1
    WHERE NOT EXISTS (SELECT 1 FROM \"_prisma_migrations\" WHERE migration_name = '20260426202926_add_proactive_chat');

    INSERT INTO \"_prisma_migrations\" (id, checksum, migration_name, finished_at, applied_steps_count)
    SELECT gen_random_uuid(), 'manual-psql-fix', '20260427000001_add_file_msg_type', NOW(), 1
    WHERE NOT EXISTS (SELECT 1 FROM \"_prisma_migrations\" WHERE migration_name = '20260427000001_add_file_msg_type');
  "

  echo "[DEPLOY FIX] Direct SQL migration applied successfully"
else
  echo "[DEPLOY DIAGNOSTIC] is_vip column exists — migrations are up to date ✅"
fi

echo "Running Production Data Synchronization (Seeding & Recovery)..."
node packages/database/scripts/production-sync.js || echo "Warning: production-sync.js failed but continuing..."
node apps/backend/scripts/grant-admin.js || echo "Warning: grant-admin.js failed but continuing..."
node apps/backend/scripts/fix-customer-roles.js || echo "Warning: fix-customer-roles.js failed but continuing..."

echo "Starting application..."
# Prefer the canonical dist/main.js produced by `nest build`. The
# dist/src/main.js fallback is only there because older builds emitted to
# a nested path; new code (CSRF bypass paths, etc.) is NOT in that file.
# Loading the stale variant masks the new bypass and silently 403's
# /api/v1/auth/login despite the route being declared @Public.
if [ -f "apps/backend/dist/main.js" ]; then
  node apps/backend/dist/main.js
elif [ -f "apps/backend/dist/src/main.js" ]; then
  echo "WARNING: falling back to legacy dist/src/main.js path"
  node apps/backend/dist/src/main.js
else
  echo "ERROR: no compiled main.js found in apps/backend/dist/"
  exit 1
fi
