import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiPart } from './interfaces/ai-provider.interface';
import { hasAnswerLanguageLeak, isNoKnowledgeAnswer } from './ai-answer-quality';

export type SupportAnswerLanguage = 'tr' | 'en' | 'de';
export type SupportAnswerAudience = 'customer' | 'agent';
export type SupportAnswerMode = 'LLM' | 'FALLBACK';
export type SupportFallbackReason = 'TIMEOUT_OR_EMPTY' | 'NO_KNOWLEDGE_WITH_CONTEXT';

export interface SupportAnswerGenerationOptions {
    finalPrompt: string;
    userQuery: string;
    kbContent: string;
    attachments?: AiPart[];
    timeoutMs: number;
    audience: SupportAnswerAudience;
    fallback?: () => string | null | undefined;
    fallbackOnNoKnowledge?: boolean;
    fallbackLabel?: string;
}

export interface SupportAnswerGenerationResult {
    response: string | null;
    mode?: SupportAnswerMode;
    model?: string;
    fallbackReason?: SupportFallbackReason;
}

export interface SupportLanguageRepairOptions {
    answer: string | null | undefined;
    userQuery: string;
    language: SupportAnswerLanguage;
    audience: SupportAnswerAudience;
    fallback?: () => string | null | undefined;
}

export interface SupportLanguageRepairResult {
    answer: string | null;
    repaired: boolean;
    mismatch: boolean;
}

@Injectable()
export class SupportAnswerOrchestrator {
    private readonly logger = new Logger(SupportAnswerOrchestrator.name);

    constructor(private readonly ai: AiService) { }

    async generate(options: SupportAnswerGenerationOptions): Promise<SupportAnswerGenerationResult> {
        const synthesisPrompt = this.buildResponseDraftPrompt(options.finalPrompt);
        let timeoutHandle: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise<null>((resolve) => {
            timeoutHandle = setTimeout(() => resolve(null), options.timeoutMs);
        });

        const generated = await Promise.race([
            this.generateOrReformat({
                synthesisPrompt,
                finalPrompt: options.finalPrompt,
                userQuery: options.userQuery,
                kbContent: options.kbContent,
                attachments: options.attachments ?? [],
                timeoutMs: options.timeoutMs,
            }),
            timeoutPromise,
        ]).finally(() => {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
        });

        if (!generated?.response) {
            return this.useFallback(options, 'TIMEOUT_OR_EMPTY');
        }

        if (options.fallbackOnNoKnowledge && isNoKnowledgeAnswer(generated.response)) {
            return this.useFallback(options, 'NO_KNOWLEDGE_WITH_CONTEXT');
        }

        return {
            response: generated.response,
            mode: 'LLM',
            model: generated.model,
        };
    }

    async repairLanguage(options: SupportLanguageRepairOptions): Promise<SupportLanguageRepairResult> {
        const answer = options.answer?.trim() || null;
        if (!answer || !hasAnswerLanguageLeak(answer, options.language)) {
            return { answer, repaired: false, mismatch: false };
        }

        const targetLanguage = this.getLanguageName(options.language);
        const audienceLabel = options.audience === 'agent' ? 'support agent draft' : 'support answer';
        const repairPrompt = [
            `Rewrite the ${audienceLabel} below entirely in ${targetLanguage}.`,
            'Preserve the exact technical meaning, markdown structure, bullets, numbering, product names, file names, URLs, and error codes.',
            'Translate explanatory prose, greeting, and section names. Do not add new facts. Do not remove useful checks.',
            `Return only the rewritten ${audienceLabel}.`,
            '',
            '[USER QUERY]',
            options.userQuery,
            '',
            '[ANSWER TO REWRITE]',
            answer,
        ].join('\n');

        try {
            const repaired = (await this.ai.generate(repairPrompt, 12000))?.trim();
            if (repaired && !hasAnswerLanguageLeak(repaired, options.language)) {
                return { answer: repaired, repaired: true, mismatch: true };
            }
        } catch (error: any) {
            this.logger.warn(`⚠️ ${audienceLabel} language repair failed: ${error?.message ?? error}`);
        }

        this.logger.warn(`⚠️ ${audienceLabel} language mismatch could not be repaired for target language ${options.language}.`);
        return {
            answer: options.fallback?.() ?? null,
            repaired: false,
            mismatch: true,
        };
    }

    private async generateOrReformat(options: {
        synthesisPrompt: string;
        finalPrompt: string;
        userQuery: string;
        kbContent: string;
        attachments: AiPart[];
        timeoutMs: number;
    }): Promise<{ response: string; model?: string } | null> {
        const generated = await this.ai.generate(options.synthesisPrompt, options.timeoutMs, options.attachments);
        const trimmed = generated?.trim();

        if (trimmed && !this.looksLikeRankingPayload(trimmed)) {
            return {
                response: trimmed,
                model: await this.ai.getActiveModelName(),
            };
        }

        return this.ai.reformat(options.finalPrompt, options.userQuery, options.kbContent, options.attachments);
    }

    private useFallback(
        options: SupportAnswerGenerationOptions,
        reason: SupportFallbackReason,
    ): SupportAnswerGenerationResult {
        const fallbackResponse = options.fallback?.()?.trim() || null;
        if (!fallbackResponse) {
            return {
                response: null,
                fallbackReason: reason,
            };
        }

        this.logger.warn(
            `⚠️ Support answer ${options.audience} orchestration used fallback (${reason}${options.fallbackLabel ? `: ${options.fallbackLabel}` : ''}).`,
        );
        return {
            response: fallbackResponse,
            mode: 'FALLBACK',
            fallbackReason: reason,
        };
    }

    private buildResponseDraftPrompt(finalPrompt: string): string {
        return `${finalPrompt.trim()}

RESPONSE DRAFT:`;
    }

    private looksLikeRankingPayload(value: string): boolean {
        if (!value.startsWith('{')) return false;

        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed?.rankings);
        } catch {
            return false;
        }
    }

    private getLanguageName(language: SupportAnswerLanguage): string {
        if (language === 'tr') return 'Turkish';
        if (language === 'de') return 'German';
        return 'English';
    }
}
