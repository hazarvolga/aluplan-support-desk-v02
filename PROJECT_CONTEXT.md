# AI IDE Persistent Memory Architecture
## OpenCode + Zen + GitNexus Setup
### For `aluplan-support-desk-v02`

---

# Problem

When using AI coding agents like:

- OpenCode
- Zen
- Cursor
- Windsurf
- Cline

the assistant appears to "forget everything" every new session.

This is NOT because the model is bad.

The real issue is:

- no persistent context
- no repository memory
- no semantic retrieval
- no architectural bootstrap
- no graph awareness

Large repositories REQUIRE a memory architecture.

---

# Your Current Repository Situation

Your project already contains advanced architecture:

- NestJS backend
- Next.js frontend
- AI orchestration
- RAG pipeline
- CRM integrations
- Ticketing system
- OmniChannel
- WebSocket notifications
- Embeddings
- Semantic querying

Your GitNexus index already extracted:

- 9,142 symbols
- 15,926 relationships
- 365 communities
- 241 execution flows

This means your project is now TOO LARGE for simple chat memory.

---

# Root Cause

Most AI IDE setups rely only on:

```txt
Conversation history
```

This is insufficient.

Real AI memory systems require:

```txt
Repository graph
+ embeddings
+ retrieval
+ persistent summaries
+ architectural rules
+ session bootstrap
```

---

# Solution Architecture

Recommended stack:

```txt
Repository
    ↓
GitNexus Graph
    ↓
Embeddings
    ↓
Vector Database
    ↓
Semantic Retrieval
    ↓
AI IDE Context Injection
    ↓
Persistent Sessions
```

---

# STEP 1 — Create Persistent Project Memory

Create:

```txt
PROJECT_CONTEXT.md
```

at repository root.

Example:

```md
# Project Overview

Project: aluplan-support-desk-v02

## Architecture

- Backend: NestJS
- Frontend: Next.js
- Database: PostgreSQL
- AI: OpenAI/Gemini
- Vector Search: Embeddings + RAG
- CRM: Dynamics 365 integration

## Critical Services

- AiService
- AiQueryService
- EmbeddingService
- CrmService
- EmailService
- NotificationsGateway

## Important Rules

- Never break RBAC decorators
- Use existing DTO structure
- Preserve i18n with t()
- Use toast() for frontend notifications
- Follow existing module boundaries

## Current Work

- Improving AI memory persistence
- Optimizing RAG pipeline
- Refactoring OmniChannel
- Improving semantic retrieval
```

---

# STEP 2 — Inject GitNexus Index Into Context

Your file:

```txt
nexus-index.md
```

contains:

- architecture graph
- execution flows
- symbol relationships
- module communities

This is EXTREMELY valuable.

Load it automatically.

Example:

```bash
opencode --context nexus-index.md
```

or in Zen config:

```json
{
  "memoryFiles": [
    "PROJECT_CONTEXT.md",
    "nexus-index.md",
    ".ai/session-summary.md",
    ".ai/current-focus.md"
  ]
}
```

Without this, the agent must rediscover the repository every session.

---

# STEP 3 — Create AGENTS.md

Create:

```txt
AGENTS.md
```

Recommended content:

```md
# AGENT RULES

## Repository Intelligence Rules

This repository exceeds normal LLM context capacity.

Always prioritize:

1. GitNexus graph
2. Graphify execution flows
3. Existing architectural summaries
4. Semantic retrieval
5. Raw grep/search (LAST)

---

## Coding Standards

- Preserve DTO structure
- Preserve RBAC decorators
- Keep services modular
- Never bypass validation layer
- Preserve existing naming patterns

---

## AI Rules

- Use existing services first
- Avoid duplicate utilities
- Reuse shared schemas
- Preserve frontend toast() usage
- Preserve translation function t()

---

## Architecture

Backend:
- NestJS modules
- Service-oriented architecture

Frontend:
- Next.js App Router
- Shared schemas
- Centralized notification handling

AI:
- Embeddings
- RAG
- Retrieval pipeline
- semantic querying

---

## Session Persistence

Before starting work:

1. Read:
   - PROJECT_CONTEXT.md
   - nexus-index.md
   - .ai/session-summary.md
   - .ai/current-focus.md

2. Restore:
   - active architecture decisions
   - pending TODOs
   - current refactors
   - previous discoveries

3. Prefer:
   - graph traversal
   - semantic retrieval
   - GitNexus execution flows

4. Avoid:
   - isolated file reasoning
   - duplicate abstractions
   - architecture rediscovery

---

## Session Ending Rule

Before ending a session:

Update:

.ai/session-summary.md

Include:
- changes made
- discoveries
- pending work
- introduced risks
```

---

# STEP 4 — Create Persistent Session Memory

Create:

```txt
.ai/session-summary.md
```

Example:

```md
# Session Summary

## Completed

- Fixed RBAC issue
- Added Gemini fallback
- Refactored ticket assignment
- Improved repository memory bootstrap

---

## Important Discoveries

- AiQueryService depends on EmbeddingService
- NotificationsGateway triggers ticket updates
- CRM sync depends on ticket lifecycle

---

## TODO

- Improve semantic retrieval
- Reduce embedding duplication
- Add vector DB retrieval

---

## Risks

- Large repository exceeds standard context capacity
- WebSocket flows tightly coupled to ticket updates
```

---

# STEP 5 — Add Current Focus Tracking

Create:

```txt
.ai/current-focus.md
```

Example:

```md
# Current Focus

## Active Work

- AI memory persistence
- Retrieval optimization
- RAG improvements
- OmniChannel cleanup

---

## Avoid Breaking

- NotificationsGateway
- CRM sync
- websocket flows
- RBAC decorators

---

## Current Refactors

- AiQueryService separation
- embedding deduplication
```

---

# STEP 6 — Add Semantic Long-Term Memory

Chat history is NOT memory.

Real memory requires:

- embeddings
- vector database
- semantic retrieval

Recommended vector databases:

- pgvector
- Qdrant
- Chroma

Recommended flow:

```txt
Codebase
    ↓
Chunking
    ↓
Embeddings
    ↓
Vector DB
    ↓
Retrieval
    ↓
AI Context
```

---

# STEP 7 — Enable Graph-Aware Retrieval

Your GitNexus graph already provides:

- execution flows
- symbol dependencies
- architectural communities
- inferred relationships

Example:

```bash
gitnexus query "How does ticket creation work?"
```

This is MUCH stronger than raw file search.

Without graph retrieval:

AI only sees:
- open files
- nearby code
- current chat

With graph retrieval:

AI understands:
- dependencies
- architecture
- execution paths
- service relationships

---

# STEP 8 — Create Session Bootstrap Prompt

Every new session should preload architectural rules.

Example bootstrap:

```txt
You are working on aluplan-support-desk-v02.

Architecture:
- NestJS backend
- Next.js frontend
- RAG AI system
- Dynamics CRM integration

Important services:
- AiService
- AiQueryService
- EmbeddingService
- NotificationsGateway

Coding rules:
- Preserve RBAC
- Never break DTO contracts
- Use existing service patterns
- Keep i18n compatibility
- Preserve toast() usage

Repository intelligence:
- Prefer GitNexus graph traversal
- Use semantic retrieval before grep
- Avoid isolated file reasoning
```

This prevents the model from behaving like a "new developer" every session.

---

# STEP 9 — Recommended Folder Structure

```txt
repo/
│
├── PROJECT_CONTEXT.md
├── AGENTS.md
├── nexus-index.md
│
├── .ai/
│   ├── session-summary.md
│   ├── current-focus.md
│   ├── architecture-decisions.md
│   ├── bootstrap.txt
│   ├── retrieval.yaml
│   └── summaries/
│       └── condensed.md
│
├── embeddings/
├── vector-db/
└── graphify-out/
```

---

# STEP 10 — OpenCode Desktop Workflow

When starting a NEW session:

FIRST MESSAGE:

```txt
Read:
- AGENTS.md
- PROJECT_CONTEXT.md
- .ai/current-focus.md
- .ai/session-summary.md

Use GitNexus and Graphify before grep.
This repository exceeds normal LLM context capacity.
Prefer graph-aware reasoning and semantic retrieval.
```

Keep these tabs OPEN:

- AGENTS.md
- PROJECT_CONTEXT.md
- current-focus.md
- session-summary.md

OpenCode heavily prioritizes:
- visible context
- open tabs
- injected files

---

# STEP 11 — Enable Automatic Repository Reindexing

Whenever:

- files change
- modules move
- services refactor

run:

```bash
gitnexus detect_changes
```

then regenerate:

```bash
gitnexus index
```

Otherwise memory becomes stale.

---

# STEP 12 — Add .gitignore Rules

Recommended:

```gitignore
.ai/cache/
.ai/embeddings/
.ai/vector/
vector-db/
```

---

# STEP 13 — Recommended Models

## Claude Sonnet 4

Best for:
- architecture
- refactoring
- debugging
- repository understanding

---

## GPT-5

Best for:
- reasoning
- orchestration
- system design

---

## Gemini 2.5 Pro

Best for:
- huge repositories
- long context
- broad retrieval

---

# STEP 14 — Recommended IDE Setup

## BEST OVERALL

### Cursor

Strong:
- retrieval
- repo awareness
- memory
- multi-file editing

---

## BEST FOR AGENTS

### Windsurf

Strong:
- autonomous workflows
- code actions
- planning

---

## MOST CUSTOMIZABLE

### OpenCode + Zen

Strong:
- fully hackable
- self-hostable
- custom memory pipelines

Weak:
- requires manual architecture

---

# STEP 15 — Advanced Hybrid Retrieval

Use BOTH:

```txt
semantic search
+
symbol graph search
```

Example:

User asks:

```txt
How does ticket assignment work?
```

System retrieves:
- execution flow
- service dependencies
- related DTOs
- websocket notifications
- CRM side effects

instead of simple keyword search.

---

# IMPORTANT

Most developers wrongly assume:

```txt
Long context window = memory
```

FALSE.

Even 1M token models still need:

- retrieval
- summarization
- graph memory
- semantic indexing

because repositories evolve continuously.

---

# Ultimate Production Architecture

```txt
Repository
    ↓
GitNexus Graph Extraction
    ↓
Chunking + Embeddings
    ↓
pgvector / Qdrant
    ↓
Hybrid Retrieval Engine
    ↓
Session Bootstrap
    ↓
Persistent Agent Memory
    ↓
AI IDE
```

---

# Final Recommendation For aluplan-support-desk-v02

## REQUIRED

- PROJECT_CONTEXT.md
- AGENTS.md
- GitNexus graph
- Session summaries
- Vector DB retrieval

---

## HIGHLY RECOMMENDED

- pgvector
- Qdrant
- Cursor or Windsurf
- Claude Sonnet 4

---

## OPTIONAL BUT POWERFUL

- automatic commit summarization
- architectural diff tracking
- semantic code review memory
- retrieval scoring

---

# Golden Rule

AI coding assistants should NOT rely on chat history.

They should rely on:

```txt
Repository Intelligence Layer
```

That layer consists of:

- graph memory
- embeddings
- retrieval
- architecture summaries
- persistent context
- semantic indexing

This is the difference between:

```txt
AI chatbot
```

and:

```txt
AI software engineer
```