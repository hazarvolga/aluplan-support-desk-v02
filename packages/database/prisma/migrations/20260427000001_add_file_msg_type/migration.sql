-- Add FILE_MSG value to KnowledgeSourceType enum
-- Required for .msg (Outlook email) file support in knowledge pool

ALTER TYPE "KnowledgeSourceType" ADD VALUE IF NOT EXISTS 'FILE_MSG';
