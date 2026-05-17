CREATE TABLE IF NOT EXISTS "email_unsubscribe_feedbacks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NULL,
  "email" VARCHAR(255) NULL,
  "reason" VARCHAR(80) NULL,
  "comment" TEXT NULL,
  "user_agent" TEXT NULL,
  "ip_address" VARCHAR(100) NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_email_unsubscribe_feedback_user" ON "email_unsubscribe_feedbacks"("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_unsubscribe_feedback_reason" ON "email_unsubscribe_feedbacks"("reason");
