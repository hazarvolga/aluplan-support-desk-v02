-- Migration: Add AiHealthEvent model for AI health event logging
-- Purpose: Track AI health events (fallback, timeout, error, info) with 30-day retention
-- Date: 2026-05-12
-- GAP-LIVE: AI Health Live Monitoring Infrastructure

BEGIN;

-- Create enum type for health event types
CREATE TYPE "AiHealthEventType" AS ENUM (
    'FALLBACK',
    'TIMEOUT',
    'ERROR',
    'INFO'
);

-- Create the ai_health_events table
CREATE TABLE "ai_health_events" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "event_type" "AiHealthEventType" NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100),
    "task" VARCHAR(255),
    "error_message" TEXT,
    "latency_ms" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX "idx_ai_health_events_created" ON "ai_health_events" ("created_at" DESC);
CREATE INDEX "idx_ai_health_events_type" ON "ai_health_events" ("event_type");
CREATE INDEX "idx_ai_health_events_provider" ON "ai_health_events" ("provider");
CREATE INDEX "idx_ai_health_events_created_type" ON "ai_health_events" ("created_at" DESC, "event_type");

COMMENT ON TABLE "ai_health_events" IS 'AI health event log — fallback, timeout, error, info tracking';
COMMENT ON COLUMN "ai_health_events"."metadata" IS 'Additional context (error details, stack, etc.)';

COMMIT;