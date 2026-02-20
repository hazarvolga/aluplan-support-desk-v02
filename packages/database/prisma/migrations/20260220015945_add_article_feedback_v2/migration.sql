-- CreateTable
CREATE TABLE "article_feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL,
    "user_id" UUID,
    "is_helpful" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_feedbacks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "article_feedbacks" ADD CONSTRAINT "article_feedbacks_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_feedbacks" ADD CONSTRAINT "article_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
