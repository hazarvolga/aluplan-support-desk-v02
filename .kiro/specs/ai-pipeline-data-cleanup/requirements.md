# Requirements Document: AI Pipeline Pre-Reimport Cleanup

## Introduction

This specification defines a focused cleanup workflow for the RAG system before re-importing the document corpus.

The goal is not to build a generic cleanup platform. The goal is to make sure legacy data from previous RAG generations does not contaminate the new ingestion cycle.

This workflow is intended to be run manually before bulk re-upload and re-indexing.

## Goal

Before re-importing all documents, the system must ensure that:

- legacy auto-imported knowledge articles are identified and removed
- old embedding generations are identified and removed
- stale semantic cache entries are cleared
- orphaned dataset files and stale knowledge-source links are identified
- the system can produce a final readiness report stating whether re-import can safely begin

## Operating Modes

### Inspect Mode
- Read-only
- No deletion
- Produces counts, examples, and risk notes

### Execute Mode
- Performs approved cleanup actions
- Uses batching where needed

### Validate Mode
- Runs post-cleanup verification
- Produces a final ready / not-ready report

## Requirements

### Requirement 1: Legacy Knowledge Article Cleanup

**User Story:** As an administrator, I want legacy auto-imported articles removed before re-import, so the new RAG corpus is not mixed with old generated content.

#### Acceptance Criteria

1. The system SHALL identify records in `knowledge_articles` where:
   - `isAutoImported = true`, or
   - `source = 'notebooklm'`
2. In Inspect Mode, the system SHALL report:
   - total count
   - sample titles
   - creation dates
3. In Execute Mode, the system SHALL remove the identified legacy articles.
4. The system SHALL verify the effect of cleanup on related versions and embeddings.
5. The cleanup result SHALL be included in the final report.

### Requirement 2: Legacy Embedding Cleanup

**User Story:** As an administrator, I want old embedding generations removed before re-import, so retrieval uses only the new embedding generation.

#### Acceptance Criteria

1. The system SHALL identify legacy records in:
   - `knowledge_embeddings`
   - `knowledge_pool_embeddings`
2. A record SHALL be considered legacy if:
   - `embedding_version = 'v1'`, or
   - `embedding_dim = 1536`
3. In Inspect Mode, the system SHALL report table-level counts and sample records.
4. In Execute Mode, the system SHALL delete legacy embeddings in batches.
5. The system SHALL log batch progress.
6. In Validate Mode, the system SHALL report remaining embedding version and dimension distribution.

### Requirement 3: Semantic Cache Cleanup

**User Story:** As an administrator, I want stale cache entries removed before re-import, so old semantic results cannot leak into the new system state.

#### Acceptance Criteria

1. The system SHALL identify Redis keys matching `ai:query:cache:v6:*`.
2. The system SHALL identify stale records in `ai_response_cache`.
3. In Inspect Mode, the system SHALL report:
   - Redis key count
   - stale DB cache count
   - sample ages or timestamps
4. In Execute Mode, the system SHALL clear the identified Redis keys.
5. In Execute Mode, the system SHALL remove stale DB cache entries.
6. In Validate Mode, the system SHALL confirm the cache cleanup result.

### Requirement 4: Orphan Source and File Cleanup

**User Story:** As an administrator, I want orphaned files and stale source references identified before re-import, so the ingestion surface is clean and consistent.

#### Acceptance Criteria

1. The system SHALL scan the `dataset/` directory for import files.
2. The system SHALL cross-check those files against `knowledge_sources.filePath`.
3. Files present on disk with no matching database record SHALL be marked as orphaned.
4. In Execute Mode, orphaned files SHALL be moved to a quarantine directory, not hard-deleted.
5. The system SHALL create a manifest for quarantined files.

### Requirement 5: Relation and Cascade Safety Check

**User Story:** As an administrator, I want cleanup safety validated before execution, so unexpected data loss does not occur.

#### Acceptance Criteria

1. The system SHALL validate the relevant cleanup relations before destructive execution.
2. The system SHALL inspect the cleanup impact around:
   - `KnowledgeSource -> KnowledgePoolEmbedding`
   - `KnowledgeSource -> KnowledgeSourceSyncLog`
   - `KnowledgeArticle`-related dependent records
3. The system SHALL surface known cleanup gaps or non-cascade areas in the report.
4. High-risk relationship effects SHALL be explicitly highlighted in Inspect Mode.

### Requirement 6: Pre-Reimport Readiness Report

**User Story:** As an administrator, I want a final readiness report before re-import, so I know whether the system is clean enough for a fresh RAG ingestion.

#### Acceptance Criteria

1. In Validate Mode, the system SHALL report:
   - remaining legacy article count
   - remaining legacy embedding count
   - remaining stale cache count
   - remaining orphan file count
2. The system SHALL produce a final status of:
   - `READY`, or
   - `NOT_READY`
3. If the result is `NOT_READY`, the report SHALL explain which cleanup categories still contain legacy data.
4. The readiness report SHALL be suitable for use as the final gate before re-import.

## Explicitly Out of Scope

The following are not part of this spec:

- generic cleanup platform design
- cron scheduling
- pause/resume job engine
- rollback framework
- storage analytics dashboard
- automatic admin notification workflows
- multi-tenant cleanup orchestration
