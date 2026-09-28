const DUPLICATE_KNOWLEDGE_SOURCE_URL = 'KNOWLEDGE_SOURCE_URL_DUPLICATE';

export const isDuplicateKnowledgeSourceUrlError = (error: unknown): boolean =>
    error instanceof Error && error.message.includes(DUPLICATE_KNOWLEDGE_SOURCE_URL);
