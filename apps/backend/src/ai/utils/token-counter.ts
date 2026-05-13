/**
 * Accurate token counting using js-tiktoken for OpenAI-compatible models.
 * Falls back to ceil(text.length / 4) for Groq/Ollama and unknown models.
 */
import { encodingForModel, type TiktokenModel } from 'js-tiktoken';

/**
 * Maps model name strings to their tiktoken encoding key.
 * Only models that js-tiktoken recognises are included here.
 */
const TIKTOKEN_MODELS = new Set<string>([
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'text-embedding-3-small',
    'text-embedding-3-large',
    'text-embedding-ada-002',
]);

/**
 * Count the number of tokens in `text` for the given model.
 *
 * @param text   The string to tokenise.
 * @param model  Model name, e.g. "gpt-4o-mini".  When omitted or unknown,
 *               falls back to the fast char/4 heuristic.
 * @returns      Token count (integer ≥ 0).
 */
export function countTokens(text: string, model?: string): number {
    if (!text) return 0;

    const modelKey = (model ?? '').toLowerCase();

    if (TIKTOKEN_MODELS.has(modelKey)) {
        try {
            const enc = encodingForModel(modelKey as TiktokenModel);
            return enc.encode(text).length;
        } catch {
            // Encoding unavailable for this build — fall through to heuristic
        }
    }

    // Heuristic fallback: ~4 chars per token (suitable for Groq/Ollama/unknown)
    return Math.ceil(text.length / 4);
}

/**
 * Estimate token cost in USD using the provider/model price table.
 * Mirrors AiBudgetMonitor.estimateCost() as a pure function so call
 * sites without DI access can use it.
 *
 * @param provider  "openai" | "groq" | "ollama"
 * @param model     Model name (e.g. "gpt-4o-mini")
 * @param inputTokens
 * @param outputTokens
 */
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
    // OpenAI
    'openai:gpt-4o':                    { input: 2.50,  output: 10.00 },
    'openai:gpt-4o-mini':               { input: 0.15,  output: 0.60  },
    'openai:gpt-4-turbo':               { input: 10.00, output: 30.00 },
    'openai:gpt-3.5-turbo':             { input: 0.50,  output: 1.50  },
    'openai:text-embedding-3-small':    { input: 0.02,  output: 0.00  },
    'openai:text-embedding-3-large':    { input: 0.13,  output: 0.00  },
    'openai:text-embedding-ada-002':    { input: 0.10,  output: 0.00  },
    // Groq
    'groq:llama-3.3-70b-versatile':     { input: 0.59,  output: 0.79  },
    'groq:llama-3.1-8b-instant':        { input: 0.05,  output: 0.08  },
    'groq:mixtral-8x7b-32768':          { input: 0.24,  output: 0.24  },
    'groq:gemma2-9b-it':                { input: 0.20,  output: 0.20  },
    // Ollama (local — no cost)
    'ollama:bge-m3':                    { input: 0.00,  output: 0.00  },
    'ollama:llama3':                    { input: 0.00,  output: 0.00  },
    'ollama:mistral':                   { input: 0.00,  output: 0.00  },
};

export function estimateTokenCost(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
): number {
    const key = `${provider.toLowerCase()}:${model.toLowerCase()}`;
    const rates = TOKEN_COSTS[key];
    if (!rates) return 0;
    return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}
