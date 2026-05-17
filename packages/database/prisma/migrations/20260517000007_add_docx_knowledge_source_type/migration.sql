-- Allow Word documents to be uploaded and indexed in the knowledge pool.
ALTER TYPE "KnowledgeSourceType" ADD VALUE IF NOT EXISTS 'FILE_DOCX';
