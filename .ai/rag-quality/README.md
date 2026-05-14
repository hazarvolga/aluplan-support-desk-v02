# RAG Quality Acceptance Set

This folder is the project memory surface for RAG quality validation.

Use `acceptance-questions.json` before importing more documents or changing retrieval logic. The set is intentionally customer-like and multilingual. Each item defines the expected retrieval intent, source category, language behavior, and known off-intent sources to avoid.

## Phase Rules

- Run this set after every RAG retrieval, cache, ingestion, or dataset-classification change.
- Treat it as an acceptance gate, not as a broad benchmark.
- Prefer exact source/category correctness over only displayed similarity.
- If a question fails, first decide whether the problem is retrieval, metadata, cache, generation, or dataset quality.
- Add new questions only when they represent a real support scenario or a previously observed failure.

## Current Critical Checks

- Turkish question should receive Turkish fallback/answer copy.
- Network/startup questions must not be answered from license activation sources.
- Graphics driver questions should rank graphics driver documents over generic performance documents.
- Performance questions may use English or German source PDFs, but the answer should follow Turkish UI/query language.
- Legacy `General` sources and duplicate pilot sources should not outrank canonical categorized PDFs.
