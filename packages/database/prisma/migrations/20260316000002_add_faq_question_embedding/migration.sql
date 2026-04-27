-- Add question_embedding column to faq_entries for semantic deduplication
ALTER TABLE "faq_entries" ADD COLUMN "question_embedding" vector;
