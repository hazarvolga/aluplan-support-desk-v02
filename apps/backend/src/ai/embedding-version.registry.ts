import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

export interface VersionConfig {
  version: string;
  dimension: number;
  provider: string;
  model: string;
}

@Injectable()
export class EmbeddingVersionRegistry {
  private readonly logger = new Logger(EmbeddingVersionRegistry.name);

  // Map "provider:model" to a short version code (max 10 chars) and expected dimension
  private readonly configMap: Record<string, { version: string; dimension: number }> = {
    'openai:text-embedding-ada-002': { version: 'v1', dimension: 1536 },
    'openai:text-embedding-3-small': { version: 'v3s', dimension: 1536 },
    'openai:text-embedding-3-large': { version: 'v3l', dimension: 3072 },
    'gemini:text-embedding-004': { version: 'v2', dimension: 768 },
    'gemini:models/text-embedding-004': { version: 'v2', dimension: 768 },
    'gemini:gemini-embedding-001': { version: 'v2_1', dimension: 3072 },
    'gemini:models/gemini-embedding-001': { version: 'v2_1', dimension: 3072 },
    'gemini:gemini-embedding-2': { version: 'v2_2', dimension: 3072 },
    'gemini:models/gemini-embedding-2': { version: 'v2_2', dimension: 3072 },
    'gemini:gemini-embedding-2-preview': { version: 'v2_2p', dimension: 3072 },
    'gemini:models/gemini-embedding-2-preview': { version: 'v2_2p', dimension: 3072 },
    'llmapi:gemini-embedding-2': { version: 'v2_2', dimension: 3072 },
    'llmapi:models/gemini-embedding-2': { version: 'v2_2', dimension: 3072 },
    'llmapi:gemini-embedding-2-preview': { version: 'v2_2p', dimension: 3072 },
    'llmapi:models/gemini-embedding-2-preview': { version: 'v2_2p', dimension: 3072 },
    'llmapi:text-embedding-3-small': { version: 'v3s', dimension: 1536 },
    'llmapi:text-embedding-3-large': { version: 'v3l', dimension: 3072 },
    'ollama:nomic-embed-text': { version: 'v_nom', dimension: 768 },
    'ollama:mxbai-embed-large': { version: 'v_mxb', dimension: 1024 }
  };

  constructor(private settingsService: SettingsService) {}

  async getActiveVersionConfig(): Promise<VersionConfig> {
    let provider = this.normalizeProvider(
      await this.settingsService.getValue('ai.embed_provider')
      || await this.settingsService.getValue('ai.active_provider')
      || process.env.EMBEDDING_PROVIDER
      || process.env.EMBED_PROVIDER,
    );
    if (!provider) {
      provider = 'gemini';
    }

    let model = this.normalizeModel(await this.settingsService.getValue(`ai.${provider}.embed_model`));
    if (!model) {
      // Basic defaults if DB is missing
      if (provider === 'gemini') model = 'gemini-embedding-2';
      else if (provider === 'llmapi') model = 'gemini-embedding-2';
      else if (provider === 'openai') model = 'text-embedding-3-small';
      else if (provider === 'ollama') model = 'nomic-embed-text';
    }

    const key = `${provider}:${model}`;
    const mapped = this.configMap[key];

    if (mapped) {
      return {
        version: mapped.version,
        dimension: mapped.dimension,
        provider,
        model,
      };
    }

    this.logger.error(`Unknown embedding model/version mapping: ${key}. Refusing to guess embedding dimension.`);
    throw new Error(`UNKNOWN_EMBEDDING_MODEL_MAPPING: ${key}`);
  }

  getVersionConfig(provider: string, model: string): { version: string; dimension: number } | null {
    const normalizedProvider = this.normalizeProvider(provider);
    const normalizedModel = this.normalizeModel(model);
    return this.configMap[`${normalizedProvider}:${normalizedModel}`] || null;
  }

  private normalizeProvider(provider?: string | null): string {
    return provider?.trim().toLowerCase() ?? '';
  }

  private normalizeModel(model?: string | null): string {
    const normalized = model?.trim() ?? '';
    if (normalized === 'text-embeding-3-small') {
      return 'text-embedding-3-small';
    }
    return normalized;
  }
}
