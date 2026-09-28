import { Injectable, Logger } from '@nestjs/common';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { AiService } from './ai.service';
import { AiPart } from './interfaces/ai-provider.interface';
import { hasAnswerLanguageLeak, isNoKnowledgeAnswer } from './ai-answer-quality';

export type SupportAnswerLanguage = 'tr' | 'en' | 'de';
export type SupportAnswerAudience = 'customer' | 'agent';
export type SupportAnswerMode = 'LLM' | 'FALLBACK';
export type SupportFallbackReason = 'TIMEOUT_OR_EMPTY' | 'NO_KNOWLEDGE_WITH_CONTEXT';
export type SupportContextRejectionReason = 'NO_RESULTS' | 'BELOW_THRESHOLD';

export interface SupportAnswerContextDecisionOptions {
    topScore?: number | null;
    adaptiveThreshold: number;
    resultCount: number;
    audience: SupportAnswerAudience;
    hasVisualEvidence?: boolean;
}

export interface SupportAnswerContextDecision {
    shouldGenerate: boolean;
    reason?: SupportContextRejectionReason;
    topScore: number;
    effectiveThreshold: number;
}

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
    synthesisRetries?: number;
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

    constructor(
        private readonly ai: AiService,
        private readonly work: MaintenanceWorkService,
    ) { }

    shouldGenerateFromRetrievedContext(options: SupportAnswerContextDecisionOptions): SupportAnswerContextDecision {
        const rawTopScore = Number(options.topScore ?? 0);
        const topScore = Number.isFinite(rawTopScore) ? rawTopScore : 0;
        const rawThreshold = Number(options.adaptiveThreshold);
        const adaptiveThreshold = Number.isFinite(rawThreshold) ? rawThreshold : 0.45;
        const resultCount = Math.max(0, Math.floor(options.resultCount));

        if (resultCount === 0) {
            return {
                shouldGenerate: false,
                reason: 'NO_RESULTS',
                topScore,
                effectiveThreshold: adaptiveThreshold,
            };
        }

        const audienceAllowance = options.audience === 'agent' ? 0.05 : 0;
        const visualAllowance = options.hasVisualEvidence ? 0.05 : 0;
        const effectiveThreshold = Math.max(0.35, adaptiveThreshold - audienceAllowance - visualAllowance);

        if (topScore < effectiveThreshold) {
            return {
                shouldGenerate: false,
                reason: 'BELOW_THRESHOLD',
                topScore,
                effectiveThreshold,
            };
        }

        return {
            shouldGenerate: true,
            topScore,
            effectiveThreshold,
        };
    }

    async generate(options: SupportAnswerGenerationOptions): Promise<SupportAnswerGenerationResult> {
        const parent = this.work.currentLease();
        const operation = () => this.generateTracked(options);
        return parent
            ? this.work.runChild(parent, 'ai.answer', operation)
            : this.work.runRoot('ai.answer', operation);
    }

    private async generateTracked(options: SupportAnswerGenerationOptions): Promise<SupportAnswerGenerationResult> {
        const parent = this.work.currentLease();
        if (!parent) throw new Error('Expected active answer work lease');
        const synthesisPrompt = this.buildResponseDraftPrompt(options.finalPrompt);
        let timeoutHandle: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise<null>((resolve) => {
            timeoutHandle = setTimeout(() => resolve(null), options.timeoutMs);
        });

        const generated = await Promise.race([
            // The response deadline does not cancel generation. Reserve its full
            // lifetime so late reformatting remains counted after the fallback.
            this.work.runChild(parent, 'ai.answer.generation', () => this.generateOrReformat({
                synthesisPrompt,
                finalPrompt: options.finalPrompt,
                userQuery: options.userQuery,
                kbContent: options.kbContent,
                attachments: options.attachments ?? [],
                timeoutMs: options.timeoutMs,
            })),
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
            const recovered = await this.recoverNoKnowledgeAnswer({
                finalPrompt: options.finalPrompt,
                userQuery: options.userQuery,
                kbContent: options.kbContent,
                attachments: options.attachments ?? [],
                attempts: options.synthesisRetries ?? 1,
            });

            if (recovered?.response && !isNoKnowledgeAnswer(recovered.response)) {
                this.logger.log(`✅ Support answer ${options.audience} recovered from no-knowledge response with a grounded synthesis retry.`);
                return {
                    response: recovered.response,
                    mode: 'LLM',
                    model: recovered.model,
                };
            }

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

    private async recoverNoKnowledgeAnswer(options: {
        finalPrompt: string;
        userQuery: string;
        kbContent: string;
        attachments: AiPart[];
        attempts: number;
    }): Promise<{ response: string; model?: string } | null> {
        const recoveryPrompt = this.buildNoKnowledgeRecoveryPrompt(options.finalPrompt);

        for (let attempt = 1; attempt <= Math.max(1, options.attempts); attempt += 1) {
            try {
                const recovered = await this.ai.reformat(recoveryPrompt, options.userQuery, options.kbContent, options.attachments);
                if (recovered?.response && !isNoKnowledgeAnswer(recovered.response)) {
                    return recovered;
                }
            } catch (error: any) {
                this.logger.warn(`⚠️ No-knowledge recovery synthesis attempt ${attempt} failed: ${error?.message ?? error}`);
            }
        }

        return null;
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

    private buildNoKnowledgeRecoveryPrompt(finalPrompt: string): string {
        return `${finalPrompt.trim()}

[SECOND_PASS_SYNTHESIS]
The previous draft claimed that the knowledge base did not contain enough information, but retrieved context is available.
Before refusing, re-check the approved context, ticket details, approved source visual evidence, and any image attachments for concrete procedural evidence.
If the context contains usable steps, checks, UI labels, module names, source image summaries, or screenshots related to the user's exact question, synthesize a complete support answer from that evidence.
Do not mention "best match", source names, internal confidence, or fallback behavior.
If the context truly lacks evidence for the exact question, return the no-knowledge message required by the main contract.
[/SECOND_PASS_SYNTHESIS]

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
