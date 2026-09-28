import { describe, expect, it } from 'vitest';
import { isDuplicateKnowledgeSourceUrlError } from './knowledge-source-errors';

describe('isDuplicateKnowledgeSourceUrlError', () => {
    it('recognizes the stable backend duplicate code', () => {
        expect(isDuplicateKnowledgeSourceUrlError(new Error('KNOWLEDGE_SOURCE_URL_DUPLICATE'))).toBe(true);
    });

    it('does not hide unrelated failures', () => {
        expect(isDuplicateKnowledgeSourceUrlError(new Error('Network error'))).toBe(false);
        expect(isDuplicateKnowledgeSourceUrlError(null)).toBe(false);
    });
});
