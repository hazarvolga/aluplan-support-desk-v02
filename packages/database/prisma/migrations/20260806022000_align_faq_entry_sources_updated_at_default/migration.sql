-- Align the FAQ provenance table with Prisma's @updatedAt contract.
-- Existing values and rows are preserved; Prisma supplies updated timestamps.
ALTER TABLE "faq_entry_sources"
    ALTER COLUMN "updated_at" DROP DEFAULT;
