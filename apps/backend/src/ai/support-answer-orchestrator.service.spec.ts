import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';
import { AiService } from './ai.service';

describe('SupportAnswerOrchestrator', () => {
    let service: SupportAnswerOrchestrator;
    let ai: jest.Mocked<Pick<AiService, 'generate' | 'reformat' | 'getActiveModelName'>>;

    beforeEach(() => {
        ai = {
            generate: jest.fn(),
            reformat: jest.fn(),
            getActiveModelName: jest.fn().mockResolvedValue('gemini-2.5-flash'),
        } as any;
        service = new SupportAnswerOrchestrator(ai as any);
    });

    it('returns generated support answer when the model produces a usable draft', async () => {
        ai.generate.mockResolvedValue('## 📌 Issue Summary\nUse this answer.');

        const result = await service.generate({
            finalPrompt: 'SYSTEM',
            userQuery: 'Allplan freezes',
            kbContent: 'KB',
            timeoutMs: 1000,
            audience: 'customer',
            fallback: () => 'fallback',
        });

        expect(result.mode).toBe('LLM');
        expect(result.response).toContain('Issue Summary');
        expect(ai.generate).toHaveBeenCalledWith(expect.stringContaining('RESPONSE DRAFT:'), 1000, []);
        expect(ai.reformat).not.toHaveBeenCalled();
    });

    it('routes ranking payloads through provider reformat before using fallback', async () => {
        ai.generate.mockResolvedValue('{"rankings":[{"id":0,"score":91}]}');
        ai.reformat.mockResolvedValue({ response: 'Reformatted answer', model: 'gpt-4o-mini' });

        const result = await service.generate({
            finalPrompt: 'SYSTEM',
            userQuery: 'Allplan freezes',
            kbContent: 'KB',
            timeoutMs: 1000,
            audience: 'customer',
            fallback: () => 'fallback',
        });

        expect(result.mode).toBe('LLM');
        expect(result.response).toBe('Reformatted answer');
        expect(ai.reformat).toHaveBeenCalledWith('SYSTEM', 'Allplan freezes', 'KB', []);
    });

    it('uses the supplied fallback when model generation returns no answer', async () => {
        ai.generate.mockResolvedValue(null);
        ai.reformat.mockResolvedValue(null);

        const result = await service.generate({
            finalPrompt: 'SYSTEM',
            userQuery: 'Allplan freezes',
            kbContent: 'KB',
            timeoutMs: 1000,
            audience: 'customer',
            fallback: () => 'Grounded fallback',
        });

        expect(result.mode).toBe('FALLBACK');
        expect(result.fallbackReason).toBe('TIMEOUT_OR_EMPTY');
        expect(result.response).toBe('Grounded fallback');
    });

    it('retries no-knowledge responses through ANN-style synthesis before using fallback', async () => {
        ai.generate.mockResolvedValue('The knowledge base does not contain enough reliable information for this exact question yet.');
        ai.reformat.mockResolvedValue({
            response: '## 📌 Issue Summary\nCreate the fixture first, then add reinforcement using the supported reinforcement workflow.',
            model: 'gemini-2.5-flash',
        });

        const result = await service.generate({
            finalPrompt: 'SYSTEM\n[CONTEXT]\nFixture and reinforcement procedure.',
            userQuery: 'How to create a fixture with reinforcement?',
            kbContent: 'Fixture and reinforcement procedure.',
            timeoutMs: 1000,
            audience: 'customer',
            fallback: () => 'Grounded fallback',
            fallbackOnNoKnowledge: true,
            synthesisRetries: 2,
        });

        expect(result.mode).toBe('LLM');
        expect(result.response).toContain('Create the fixture first');
        expect(ai.reformat).toHaveBeenCalledWith(
            expect.stringContaining('[SECOND_PASS_SYNTHESIS]'),
            'How to create a fixture with reinforcement?',
            'Fixture and reinforcement procedure.',
            [],
        );
    });

    it('repairs a localized greeting that leaks into the wrong answer language', async () => {
        ai.generate.mockResolvedValue('Hello hazarvolga,\n\n## 📌 Issue Summary\nCheck CodeMeter.');

        const result = await service.repairLanguage({
            answer: 'Merhaba hazarvolga,\n\n## 📌 Issue Summary\nCheck CodeMeter.',
            userQuery: 'What license issues do I need to consider when upgrading?',
            language: 'en',
            audience: 'customer',
            fallback: () => 'Manual review',
        });

        expect(result.repaired).toBe(true);
        expect(result.mismatch).toBe(true);
        expect(result.answer).toContain('Hello hazarvolga');
        expect(ai.generate).toHaveBeenCalledWith(expect.stringContaining('Rewrite the support answer below entirely in English.'), 12000);
    });
});
