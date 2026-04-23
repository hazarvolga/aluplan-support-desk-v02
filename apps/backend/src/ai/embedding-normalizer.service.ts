import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingResult } from './interfaces/ai-provider.interface';

/**
 * Canonical Embedding Normalizer
 *
 * Ensures vector DB consistency across different embedding providers.
 * Different providers (OpenAI, Anthropic, Ollama) produce embeddings in
 * different vector spaces. This service normalizes them to a canonical space.
 *
 * Normalization Strategies:
 * - 'none': Pass-through (all providers must use same model)
 * - 'l2': L2 normalization (unit vectors, preserves angular similarity)
 * - 'canonical': Provider-specific projection to canonical space
 *
 * Canonical Space: OpenAI text-embedding-3-small (1536d, cosine similarity)
 *
 * Implementation Notes:
 * - OpenAI embeddings are already normalized (L2 ≈ 1.0)
 * - Ollama embeddings may need L2 normalization
 * - Future: Anthropic embedding projection matrix
 * - Dimensionality reduction handled by targetDimensions config
 */
@Injectable()
export class EmbeddingNormalizer {
    private readonly logger = new Logger(EmbeddingNormalizer.name);

    /**
     * Normalize an embedding vector to the canonical space.
     */
    normalize(
        embedding: number[],
        strategy: 'none' | 'l2' | 'canonical' = 'canonical',
        targetDimensions?: number,
    ): number[] {
        switch (strategy) {
            case 'none':
                return this.truncateOrPad(embedding, targetDimensions);
            case 'l2':
                return this.l2Normalize(embedding, targetDimensions);
            case 'canonical':
                return this.canonicalNormalize(embedding, targetDimensions);
            default:
                return embedding;
        }
    }

    /**
     * Normalize an EmbeddingResult from any provider.
     */
    normalizeResult(
        result: EmbeddingResult,
        strategy: 'none' | 'l2' | 'canonical' = 'canonical',
        targetDimensions?: number,
    ): EmbeddingResult {
        return {
            embedding: this.normalize(result.embedding, strategy, targetDimensions),
            model: result.model,
        };
    }

    /**
     * L2 (Euclidean) normalization: ||v|| = 1
     * Preserves angular similarity, discards magnitude information.
     * Required for cosine similarity comparisons.
     */
    private l2Normalize(vector: number[], targetDimensions?: number): number[] {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude === 0) {
            this.logger.warn('Zero-magnitude embedding received, returning as-is');
            return this.truncateOrPad(vector, targetDimensions);
        }
        const normalized = vector.map((v) => v / magnitude);
        return this.truncateOrPad(normalized, targetDimensions);
    }

    /**
     * Canonical normalization: L2 + optional dimension alignment.
     *
     * For OpenAI text-embedding-3-small: Already L2-normalized, pass-through.
     * For other providers: L2 normalize + project if needed.
     */
    private canonicalNormalize(vector: number[], targetDimensions?: number): number[] {
        // Step 1: L2 normalize
        const l2 = this.l2Normalize(vector);

        // Step 2: Dimension alignment
        return this.truncateOrPad(l2, targetDimensions);
    }

    /**
     * Truncate or pad vector to target dimensions.
     * Truncation: Keep first N dimensions.
     * Padding: Fill with zeros.
     */
    private truncateOrPad(vector: number[], targetDimensions?: number): number[] {
        if (!targetDimensions || vector.length === targetDimensions) {
            return vector;
        }

        if (vector.length > targetDimensions) {
            // Truncate
            return vector.slice(0, targetDimensions);
        }

        // Pad with zeros
        const padded = [...vector];
        while (padded.length < targetDimensions) {
            padded.push(0);
        }
        return padded;
    }

    /**
     * Compute cosine similarity between two normalized vectors.
     * Vectors MUST be L2-normalized for accurate results.
     */
    cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
        }

        let dotProduct = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
        }

        return dotProduct;
    }

    /**
     * Verify that a vector is properly L2-normalized (≈ 1.0).
     */
    isNormalized(vector: number[], tolerance = 0.01): boolean {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return Math.abs(magnitude - 1.0) <= tolerance;
    }
}
