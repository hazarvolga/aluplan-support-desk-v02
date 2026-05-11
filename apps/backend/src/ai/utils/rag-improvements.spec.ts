import { rewriteQueryWithHistory, HistoryMessage } from './conversation-query-rewriter';
import { generateHypotheticalDocument, detectQueryLanguage } from './hypothetical-document';
import { checkAnswerConfidence } from './answer-self-check';

describe('conversation-query-rewriter', () => {
    describe('rewriteQueryWithHistory', () => {
        it('should return original query when history is empty', () => {
            const result = rewriteQueryWithHistory('Allplan crash', []);
            expect(result).toBe('Allplan crash');
        });

        it('should return original query when history is undefined', () => {
            const result = rewriteQueryWithHistory('Allplan crash', undefined);
            expect(result).toBe('Allplan crash');
        });

        it('should extract keywords from history and add context', () => {
            const history: HistoryMessage[] = [
                { role: 'user', content: 'Allplan çöküyor ne yapmalıyım' },
                { role: 'assistant', content: 'Log dosyalarını kontrol edin' }
            ];
            const result = rewriteQueryWithHistory('Hata kodu ne', history);
            expect(result).toContain('[Bağlam:');
            expect(result).toContain('çöküyor');
        });

        it('should add new keywords from history not in current query', () => {
            const history: HistoryMessage[] = [
                { role: 'user', content: 'Allplan modelleme sorunu' },
            ];
            const result = rewriteQueryWithHistory('Allplan crash', history);
            expect(result).toContain('modelleme');
        });

        it('should limit context to 5 keywords', () => {
            const history: HistoryMessage[] = [
                { role: 'user', content: 'keyword1 keyword2 keyword3 keyword4 keyword5 keyword6' },
            ];
            const result = rewriteQueryWithHistory('test', history);
            expect(result.split(',').length).toBeLessThanOrEqual(6);
        });
    });
});

describe('hypothetical-document', () => {
    describe('generateHypotheticalDocument', () => {
        it('should generate Turkish template by default', () => {
            const result = generateHypotheticalDocument('Allplan crash');
            expect(result).toContain('Allplan hakkında bir destek makalesi');
            expect(result).toContain('Başlık');
        });

        it('should generate English template when language is en', () => {
            const result = generateHypotheticalDocument('Allplan crash', { language: 'en' });
            expect(result).toContain('Allplan support article');
        });

        it('should generate German template when language is de', () => {
            const result = generateHypotheticalDocument('Allplan crash', { language: 'de' });
            expect(result).toContain('Allplan-Supportartikel');
        });

        it('should respect maxLength', () => {
            const longQuery = 'Allplan crash error problem performance issue very long query text here';
            const result = generateHypotheticalDocument(longQuery, { maxLength: 50 });
            expect(result.length).toBeLessThanOrEqual(53);
        });

        it('should clean query before generating', () => {
            const result = generateHypotheticalDocument('test [Bağlam: keyword] (ilgili: extra)');
            expect(result).not.toContain('[Bağlam:');
            expect(result).not.toContain('(ilgili:');
        });
    });

    describe('detectQueryLanguage', () => {
        it('should detect Turkish', () => {
            expect(detectQueryLanguage('Allplan çöküyor')).toBe('tr');
        });

        it('should detect German', () => {
            expect(detectQueryLanguage('Allplan Straße')).toBe('de');
        });

        it('should default to Turkish for English', () => {
            expect(detectQueryLanguage('Allplan error')).toBe('tr');
        });
    });
});

describe('answer-self-check', () => {
    describe('checkAnswerConfidence', () => {
        it('should return reliable for high similarity', () => {
            const result = checkAnswerConfidence('Bu bir test yanıtıdır. Adımlar: 1, 2, 3', 0.8);
            expect(result.isReliable).toBe(true);
            expect(result.confidence).toBe(0.8);
        });

        it('should flag short answers', () => {
            const result = checkAnswerConfidence('Tamam', 0.5);
            expect(result.concerns).toContain('Answer too short');
            expect(result.confidence).toBe(0.3);
        });

        it('should flag generic placeholder answers', () => {
            const result = checkAnswerConfidence('Merhaba, size yardımcı olabilirim', 0.5);
            expect(result.concerns).toContain('Generic placeholder answer detected');
        });

        it('should check keyword matching', () => {
            const result = checkAnswerConfidence('Bu başka bir konu hakkında', 0.5, ['test', 'allplan']);
            expect(result.concerns).toContain('Low keyword match in answer');
        });

        it('should escalate for very low confidence', () => {
            const result = checkAnswerConfidence('Test', 0.1);
            expect(result.shouldEscalate).toBe(true);
        });

        it('should not flag structured answers', () => {
            const result = checkAnswerConfidence(`
1. İlk adım
2. İkinci adım
3. Üçüncü adım

\`\`\`js
console.log('test');
\`\`\`
            `, 0.6);
            expect(result.concerns).not.toContain('Answer lacks structure');
        });
    });
});