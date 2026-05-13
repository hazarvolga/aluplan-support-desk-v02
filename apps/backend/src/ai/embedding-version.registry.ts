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
    'ollama:nomic-embed-text': { version: 'v_nom', dimension: 768 },
    'ollama:mxbai-embed-large': { version: 'v_mxb', dimension: 1024 }
  };

  constructor(private settingsService: SettingsService) {}

  async getActiveVersionConfig(): Promise<VersionConfig> {
    let provider = await this.settingsService.getValue('ai.embed_provider');
    if (!provider) {
      provider = 'openai'; // fallback
    }

    let model = await this.settingsService.getValue(`ai.${provider}.embed_model`);
    if (!model) {
      // Basic defaults if DB is missing
      if (provider === 'gemini') model = 'gemini-embedding-2';
      else if (provider === 'openai') model = 'text-embedding-ada-002';
      else model = 'unknown';
    }

    const key = `${provider}:${model}`;
    const mapped = this.configMap[key];

    if (mapped) {
      return {
        version: mapped.version,
        dimension: mapped.dimension,
        provider,
        model
      };
    }

    // Dynamic fallback for unknown models. 
    // Truncate to ensure it fits in VARCHAR(10)
    const fallbackVersion = `v_${provider.substring(0,2)}_${model.substring(0,4)}`.toLowerCase().substring(0, 10);
    
    this.logger.warn(`Unknown embedding model: ${key}. Using fallback version code: ${fallbackVersion}. Dimension might be inaccurate until first embedding generation.`);
    
    return {
      version: fallbackVersion,
      dimension: 1536, // default guess, will be updated during actual embedding generation if needed
      provider,
      model
    };
  }

  getVersionConfig(provider: string, model: string): { version: string; dimension: number } | null {
    return this.configMap[`${provider}:${model}`] || null;
  }
}
