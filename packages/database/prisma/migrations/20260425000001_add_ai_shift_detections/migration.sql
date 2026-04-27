-- CreateTable
CREATE TABLE "ai_shift_detections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interaction_id" UUID,
    "user_id" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previous_keywords" TEXT[],
    "new_keywords" TEXT[],
    "history_length" INTEGER NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ai_shift_detections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_shift_detections" ADD CONSTRAINT "ai_shift_detections_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "ai_interactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
