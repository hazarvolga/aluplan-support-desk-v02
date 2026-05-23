import { detectDominantAnswerLanguage, hasAnswerLanguageLeak, isNoKnowledgeAnswer } from './ai-answer-quality';

describe('AI answer quality guards', () => {
    it('detects localized no-knowledge answers that should not be treated as useful responses', () => {
        expect(isNoKnowledgeAnswer(
            'Bu konu için bilgi kaynağında yeterince güvenilir ve doğrudan eşleşen içerik bulunamadı.',
        )).toBe(true);
        expect(isNoKnowledgeAnswer(
            'The knowledge base does not contain enough reliable information for this exact question yet.',
        )).toBe(true);
        expect(isNoKnowledgeAnswer(
            'Die Wissensbasis enthält für diese konkrete Frage noch keine ausreichend verlässlichen Informationen.',
        )).toBe(true);
    });

    it('detects Turkish prose leaking into an English answer body', () => {
        const mixedAnswer = [
            '## 📌 Issue Summary',
            'Kullanıcı, Allplan 2024 yükseltmesinde lisansların nasıl yönetileceğini soruyor.',
            '',
            '## 🎯 Most Probable Cause',
            'Bu prosedürel bir lisans aktivasyonu sorusudur ve ürün anahtarı kontrol edilmelidir.',
            '',
            '## 🛠️ Solution Steps',
            '1. Lisans yöneticisini açın ve ürün anahtarını doğrulayın.',
        ].join('\n');

        expect(detectDominantAnswerLanguage(mixedAnswer)).toBe('tr');
        expect(hasAnswerLanguageLeak(mixedAnswer, 'en')).toBe(true);
    });

    it('does not flag a correctly English answer because of product names or headings', () => {
        const englishAnswer = [
            '## 📌 Issue Summary',
            'The user asks how to manage licenses during an Allplan upgrade.',
            '',
            '## 🎯 Most Probable Cause',
            'This is a procedural licensing question, not a crash diagnosis.',
            '',
            '## 🛠️ Solution Steps',
            '1. Open License Settings and verify the Product Key activation.',
        ].join('\n');

        expect(hasAnswerLanguageLeak(englishAnswer, 'en')).toBe(false);
    });

    it('flags a localized greeting that does not match the selected answer language', () => {
        const englishBodyWithTurkishGreeting = [
            'Merhaba hazarvolga,',
            '',
            '## 📌 Issue Summary',
            'The user asks how to manage licenses during an Allplan upgrade.',
            '',
            '## 🛠️ Solution Steps',
            '1. Open CodeMeter Control Center and verify the license container.',
        ].join('\n');

        expect(hasAnswerLanguageLeak(englishBodyWithTurkishGreeting, 'en')).toBe(true);
    });
});
