BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '5min';

ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "email_verification_jti_hash" VARCHAR(64),
    ADD COLUMN IF NOT EXISTS "email_verification_sent_at" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "password_reset_jti_hash" VARCHAR(64),
    ADD COLUMN IF NOT EXISTS "password_reset_sent_at" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "session_version" INTEGER NOT NULL DEFAULT 0;

DO $$
DECLARE
    invalid_columns integer;
BEGIN
    SELECT count(*) INTO invalid_columns
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name IN ('email_verification_jti_hash', 'password_reset_jti_hash')
      AND NOT (
          data_type = 'character varying'
          AND character_maximum_length = 64
          AND is_nullable = 'YES'
      );

    IF invalid_columns > 0 OR (
        SELECT count(*) FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name IN ('email_verification_jti_hash', 'password_reset_jti_hash')
    ) <> 2 THEN
        RAISE EXCEPTION 'Auth action token columns must both be nullable VARCHAR(64)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'email_verification_sent_at'
          AND data_type = 'timestamp without time zone'
          AND is_nullable = 'YES'
    ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'password_reset_sent_at'
          AND data_type = 'timestamp without time zone'
          AND is_nullable = 'YES'
    ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'session_version'
          AND data_type = 'integer'
          AND is_nullable = 'NO'
          AND column_default = '0'
    ) THEN
        RAISE EXCEPTION 'Auth session columns have an unexpected database shape';
    END IF;
END $$;

COMMIT;
