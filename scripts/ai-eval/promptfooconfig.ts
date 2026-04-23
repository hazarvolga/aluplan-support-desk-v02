/**
 * promptfoo Configuration for AI Evaluation
 *
 * Evaluates AI response quality across multiple dimensions:
 * - Faithfulness: Response grounded in retrieved context
 * - Answer Relevancy: Response addresses the question
 * - Context Precision: Retrieved context is relevant
 * - Hallucination: No fabricated information
 *
 * Usage:
 *   npx promptfoo eval --config ai-eval/promptfooconfig.yaml
 *
 * CI Integration:
 *   .github/workflows/ai-eval.yml runs this nightly
 */

import type { UnifiedConfig } from 'promptfoo';

const config: UnifiedConfig = {
    description: 'Aluplan AI RAG Pipeline Evaluation',
    providers: [
        {
            id: 'openai:gpt-4o',
            config: {
                temperature: 0.3,
                max_tokens: 1024,
            },
        },
    ],
    prompts: [
        {
            label: 'RAG Query',
            raw: '{{query}}\n\nContext:\n{{context}}',
        },
    ],
    tests: [
        {
            description: 'Basic licensing question',
            vars: {
                query: 'Allplan lisansımı nasıl aktive ederim?',
                context: 'Lisans aktivasyonu için Product Key kullanılır.',
            },
            assert: [
                {
                    type: 'llm-rubric',
                    value: 'Response explains license activation using Product Key',
                },
                {
                    type: 'contains',
                    value: 'Product Key',
                },
            ],
        },
        {
            description: 'Technical crash question',
            vars: {
                query: 'Program açılırken kapanıyor',
                context: 'Crash on startup may be caused by outdated GPU drivers.',
            },
            assert: [
                {
                    type: 'llm-rubric',
                    value: 'Response provides troubleshooting steps for startup crashes',
                },
                {
                    type: 'contains-any',
                    value: ['driver', 'sürücü', 'güncelleme', 'update'],
                },
            ],
        },
        {
            description: 'Irrelevant question (hallucination test)',
            vars: {
                query: 'Bugün hava nasıl?',
                context: 'Allplan is a BIM software for structural engineering.',
            },
            assert: [
                {
                    type: 'llm-rubric',
                    value: 'Response politely declines to answer weather questions and redirects to Allplan support',
                },
            ],
        },
    ],
    defaultTest: {
        assert: [
            {
                type: 'llm-rubric',
                value: 'Response is in Turkish, professional, and directly addresses the question',
            },
        ],
    },
};

export default config;
