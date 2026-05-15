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
    const prompt = options.basePrompt
        .replace('{{PRODUCT}}', options.product || 'General')
        .replace('{{CATEGORIES}}', options.categories?.join(', ') || 'N/A')
        .replace('{{KEYWORDS}}', options.keywords?.join(', ') || 'N/A')
        .replace('{{LANGUAGE}}', language);

    return `${prompt}

## SHARED ANSWER CONTRACT
- Audience: ${options.audience === 'agent' ? 'support agent draft' : 'customer self-service answer'}.
- Answer the user's exact intent. If the user asks "how do I do X", provide the procedure for X; do not convert it into an outage/root-cause diagnosis unless the user reports a failure.
- Keep the same core solution for customer and agent outputs. Agent drafts may add agent-only follow-up checks, but must not contradict or drift away from the customer-safe answer.
- Use the evidence in [CONTEXT] only. Do not invent likely causes, services, settings, or failure modes that are not supported by the retrieved context.
- If the retrieved context supports a procedural answer, prefer concrete steps over generic troubleshooting.
- Do not show raw excerpts, document chunk titles, source filenames, or citation/debug details in the customer-facing answer.
- If information is insufficient, say what is missing and ask for the next useful detail instead of filling gaps with assumptions.

## REQUIRED OUTPUT SHAPE
Use these sections when applicable and keep them in this order:
## 📌 Sorun Yorumu
## 🎯 En Olası Neden
## ⚠️ Kritik Kontroller
## 🛠️ Çözüm Adımları
## ✅ Doğrulama

For pure how-to questions, "En Olası Neden" may briefly state that this is a procedure request, not an error diagnosis.`;
}
