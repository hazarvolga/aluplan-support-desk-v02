import { ConflictException } from '@nestjs/common';

export const EMBEDDING_MIGRATION_APPROVAL_ENV = 'EMBEDDING_MIGRATION_APPROVED';

export function isEmbeddingMigrationApproved(): boolean {
    return process.env[EMBEDDING_MIGRATION_APPROVAL_ENV]?.trim().toLowerCase() === 'true';
}

export function assertEmbeddingMigrationApproved(): void {
    if (!isEmbeddingMigrationApproved()) {
        throw new ConflictException(
            'Embedding model/provider changes and bulk reindex are locked during stabilization. Set EMBEDDING_MIGRATION_APPROVED=true only with explicit operator approval.',
        );
    }
}

export function isEmbeddingModelSetting(key: string): boolean {
    return key === 'ai.embed_provider' || key.endsWith('.embed_model');
}
