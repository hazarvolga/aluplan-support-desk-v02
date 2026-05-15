import { buildSupportAnswerContractPrompt, resolveAnswerLanguage } from './ai-answer-contract';

describe('ai-answer-contract', () => {
    it('resolves supported output languages', () => {
        expect(resolveAnswerLanguage('tr-TR')).toBe('Turkish');
        expect(resolveAnswerLanguage('de')).toBe('German');
        expect(resolveAnswerLanguage('en')).toBe('English');
        expect(resolveAnswerLanguage(undefined)).toBe('Turkish');
    });

    it('adds the shared no-drift contract for customer answers', () => {
        const prompt = buildSupportAnswerContractPrompt({
            basePrompt: 'Product={{PRODUCT}} Language={{LANGUAGE}}',
            product: 'Allplan',
            categories: ['Licensing'],
            keywords: ['license borrow'],
            language: 'tr',
            audience: 'customer',
        });

        expect(prompt).toContain('Product=Allplan');
        expect(prompt).toContain('Language=Turkish');
        expect(prompt).toContain('Audience: customer self-service answer');
        expect(prompt).toContain('Answer the user\'s exact intent');
        expect(prompt).toContain('do not convert it into an outage/root-cause diagnosis');
        expect(prompt).toContain('Do not show raw excerpts');
    });

    it('keeps agent drafts grounded in the same customer-safe core solution', () => {
        const prompt = buildSupportAnswerContractPrompt({
            basePrompt: 'Categories={{CATEGORIES}} Keywords={{KEYWORDS}}',
            categories: ['License Server'],
            keywords: ['borrow', 'vpn'],
            language: 'en',
            audience: 'agent',
        });

        expect(prompt).toContain('Categories=License Server');
        expect(prompt).toContain('Keywords=borrow, vpn');
        expect(prompt).toContain('Audience: support agent draft');
        expect(prompt).toContain('Keep the same core solution for customer and agent outputs');
        expect(prompt).toContain('must not contradict or drift away');
    });
});
