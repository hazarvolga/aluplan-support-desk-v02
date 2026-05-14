# Implementation Plan: AI Pipeline Pre-Reimport Cleanup

## Overview

This plan implements a focused cleanup workflow for the RAG system before document re-import.

The implementation is intentionally split into three operational phases:

- Inspect
- Execute
- Validate

The plan avoids turning cleanup into a large product subsystem.

## Tasks

- [ ] 1. Build inspect-only reporting
  - [ ] 1.1 Inspect legacy knowledge articles
    - Identify `knowledge_articles` where `isAutoImported = true`
    - Identify `knowledge_articles` where `source = 'notebooklm'`
    - Report counts and sample records
    - _Requirements: 1.1, 1.2_

  - [ ] 1.2 Inspect legacy embeddings
    - Identify legacy rows in `knowledge_embeddings`
    - Identify legacy rows in `knowledge_pool_embeddings`
    - Match by `embedding_version = 'v1'` or `embedding_dim = 1536`
    - Report counts and sample rows
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 1.3 Inspect stale semantic cache
    - Scan Redis keys matching `ai:query:cache:v6:*`
    - Inspect stale `ai_response_cache` rows
    - Report counts and age samples
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 1.4 Inspect orphan files and stale source links
    - Scan `dataset/`
    - Cross-check `knowledge_sources.filePath`
    - Report orphan candidates
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 1.5 Inspect cleanup safety relations
    - Review relevant article/source cascade surfaces
    - Report high-risk or unclear dependencies
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 2. Add cleanup execution endpoints and services
  - [ ] 2.1 Create cleanup controller
    - Add inspect endpoint
    - Add execute endpoint
    - Add validate endpoint
    - Restrict all routes to admin-only access
    - _Requirements: 1, 2, 3, 4, 5, 6_

  - [ ] 2.2 Create cleanup orchestrator service
    - Coordinate inspect, execute, validate
    - Aggregate report output
    - Enforce conservative execution order
    - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 3. Implement cleanup execution
  - [ ] 3.1 Implement legacy article cleanup
    - Remove article records identified as legacy
    - Verify related versions/embeddings behavior
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 3.2 Implement legacy embedding cleanup
    - Delete legacy embeddings in batches
    - Log batch progress
    - _Requirements: 2.4, 2.5, 2.6_

  - [ ] 3.3 Implement semantic cache cleanup
    - Clear Redis semantic cache keys
    - Remove stale `ai_response_cache` rows
    - _Requirements: 3.4, 3.5, 3.6_

  - [ ] 3.4 Implement orphan file quarantine
    - Move orphan files into quarantine
    - Write quarantine manifest
    - _Requirements: 4.4, 4.5_

- [ ] 4. Implement post-cleanup validation
  - [ ] 4.1 Validate remaining legacy footprint
    - Count remaining legacy articles
    - Count remaining legacy embeddings
    - Count remaining stale cache rows
    - Count remaining orphan files
    - _Requirements: 6.1_

  - [ ] 4.2 Produce readiness result
    - Return `READY` or `NOT_READY`
    - Explain blocking categories if not ready
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 5. Verification checkpoint
  - [ ] 5.1 Ensure backend compiles
    - Run backend typecheck
  - [ ] 5.2 Run targeted cleanup tests
    - Validate inspect mode
    - Validate execute mode
    - Validate readiness mode

## Suggested Delivery Order

### Phase A
- Task 1.x

### Phase B
- Task 2.x
- Task 3.x

### Phase C
- Task 4.x
- Task 5.x

## Explicitly Removed from the Previous Plan

These items were intentionally dropped from scope:

- schema models for cleanup job tracking
- rollback manager
- cleanup scheduling
- pause/resume job engine
- storage reclamation reporting
- automatic notification pipeline
- generic cleanup framework abstractions

## Definition of Done

This spec is complete when:

- inspect mode shows the true legacy footprint
- execute mode can remove legacy RAG state safely
- validate mode can confirm whether the system is ready for re-import
