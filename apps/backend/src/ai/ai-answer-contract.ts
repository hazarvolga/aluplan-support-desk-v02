export type AnswerAudience = 'customer' | 'agent';

export interface SupportAnswerContractOptions {
    basePrompt: string;
    product?: string | null;
    categories?: string[];
    keywords?: string[];
    language?: string | null;
    audience: AnswerAudience;
}

export function resolveAnswerLanguage(language?: string | null): string {
    const normalized = (language || 'tr').toLowerCase();
    if (normalized.startsWith('tr')) return 'Turkish';
    if (normalized.startsWith('de')) return 'German';
    return 'English';
}

export function buildSupportAnswerContractPrompt(options: SupportAnswerContractOptions): string {
    const language = resolveAnswerLanguage(options.language);
    const sectionShape = getRequiredSectionShape(language);
    const criticalChecksLabel = getCriticalChecksLabel(language);
    const prompt = options.basePrompt
        .replace('{{PRODUCT}}', options.product || 'General')
        .replace('{{CATEGORIES}}', options.categories?.join(', ') || 'N/A')
        .replace('{{KEYWORDS}}', options.keywords?.join(', ') || 'N/A')
        .replace('{{LANGUAGE}}', language);

    return `${prompt}

## SHARED ANSWER CONTRACT
- Audience: ${options.audience === 'agent' ? 'support agent draft' : 'customer self-service answer'}.
- Voice: write as "Aluplan AI Destek". Use calm, professional, human support language suitable for a corporate support desk.
- Keep the tone natural and reassuring, but do not add marketing language, unsupported promises, or facts that are not in the retrieved context.
- Prefer short, clear sentences. Explain what the user should do and why it matters.
- If [USER_PROFILE] or [Kullanıcı Profili] provides a full name, address the user by that full name once in the opening sentence. Do not repeat the name in every section.
- Answer the user's exact intent. If the user asks "how do I do X", provide the procedure for X; do not convert it into an outage/root-cause diagnosis unless the user reports a failure.
- Keep the same core solution for customer and agent outputs. Agent drafts may add agent-only follow-up checks, but must not contradict or drift away from the customer-safe answer.
- Customer self-service answers must use the same analytical depth and section completeness as support agent drafts. Do not shorten them into quick match summaries.
- Use the evidence in [CONTEXT] only. Do not invent likely causes, services, settings, or failure modes that are not supported by the retrieved context.
- When the answer is generated inside an existing ticket or support agent draft, never tell the user or admin to create a new support request/ticket. The ticket already exists; ask for the next missing detail or recommend manual review instead.
- Output language must be ${language}. Translate procedural wording, UI labels, menu names, file names, and section names into ${language} when there is a clear equivalent.
- Do not mix German or English source-language labels into a Turkish answer as the primary wording. If an original UI label is necessary for recognition, show the translated label first and put the original in parentheses only once.
- Avoid repeating foreign-language labels after the first mention; continue with the translated term.
- If the retrieved context supports a procedural answer, prefer concrete steps over generic troubleshooting.
- Never answer with "This looks like a support question about ..." or with a product/category label as the main interpretation. Use the user's exact question as the topic.
- Do not show raw excerpts, document chunk titles, source filenames, or citation/debug details in the customer-facing answer.
- If information is insufficient, say what is missing and ask for the next useful detail instead of filling gaps with assumptions.

## REQUIRED OUTPUT SHAPE
Use these sections and keep them in this order for troubleshooting, installation failures, licensing failures, startup/performance errors, and support-procedure answers:
${sectionShape}

Do not omit "${criticalChecksLabel}" when the retrieved context contains prerequisites, permissions, compatibility checks, network/proxy checks, security-software checks, or verification conditions.
For pure how-to questions, the probable-cause section may briefly state that this is a procedure request, not an error diagnosis.`;
}

function getRequiredSectionShape(language: string): string {
    if (language === 'English') {
        return [
            '## 📌 Issue Summary',
            '## 🎯 Most Probable Cause',
            '## ⚠️ Critical Checks',
            '## 🛠️ Solution Steps',
            '## ✅ Verification',
        ].join('\n');
    }

    if (language === 'German') {
        return [
            '## 📌 Problemzusammenfassung',
            '## 🎯 Wahrscheinlichste Ursache',
            '## ⚠️ Kritische Prüfungen',
            '## 🛠️ Lösungsschritte',
            '## ✅ Überprüfung',
        ].join('\n');
    }

    return [
        '## 📌 Sorun Yorumu',
        '## 🎯 En Olası Neden',
        '## ⚠️ Kritik Kontroller',
        '## 🛠️ Çözüm Adımları',
        '## ✅ Doğrulama',
    ].join('\n');
}

function getCriticalChecksLabel(language: string): string {
    if (language === 'English') return 'Critical Checks';
    if (language === 'German') return 'Kritische Prüfungen';
    return 'Kritik Kontroller';
}
