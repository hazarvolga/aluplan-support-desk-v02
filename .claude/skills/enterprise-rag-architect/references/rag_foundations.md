# RAG Foundations: Retrieval & Ingestion Deep Dive

This reference documents advanced retrieval strategies, ingestion techniques, and chunking methodologies for high-performance RAG systems.

## 1. Retrieval Paradigms

### Dense Retrieval (Semantic Search)
*   **Mechanism:** Bi-encoders (e.g., BGE, Ada-002) mapping text to high-dimensional vector space.
*   **Strengths:** Captures conceptual meaning; robust to synonymy.
*   **Weaknesses:** Struggles with exact keywords, acronyms, and product IDs.

### Sparse Retrieval (Keyword Search)
*   **Mechanism:** BM25 / TF-IDF.
*   **Strengths:** Excellent for exact matching, technical terms, and rare tokens.
*   **Weaknesses:** "Vocabulary mismatch" problem.

### Hybrid Retrieval (The Gold Standard)
*   **Implementation:** Reciprocal Rank Fusion (RRF) or weighted combination of Dense and Sparse scores.
*   **Use Case:** Production systems requiring both conceptual understanding and exact term precision.

### Reranking (Cross-Encoders)
*   **Strategy:** Retrieve top-K (e.g., 50) using bi-encoders, then rerank using a more expensive Cross-Encoder (e.g., Cohere Rerank, BGE-Reranker).
*   **Impact:** Significantly improves precision and grounding by analyzing document-query interaction.

## 2. Ingestion & Chunking Strategies

### Recursive Character Chunking
*   **Logic:** Splits on a list of characters (e.g., ["\n\n", "\n", " ", ""]) to keep semantic units together.
*   **Best For:** General purpose documents with standard structure.

### Semantic Chunking
*   **Logic:** Uses embedding similarity to identify breakpoints where meaning changes.
*   **Best For:** Cohesive narratives or documents where paragraph structure doesn't match semantic shifts.

### Parent-Child Retrieval (Small-to-Big)
*   **Logic:** Embed small chunks (child) for better matching, but provide the surrounding large chunk (parent) to the LLM for context.
*   **Benefit:** Improves retrieval granularity while maintaining context completeness.

### Metadata-Filtered Retrieval
*   **Optimization:** Ingesting structured metadata (date, category, author, tenant_id) to pre-filter the vector space.
*   **Impact:** Dramatically reduces search space and improves accuracy for domain-specific queries.

## 3. Advanced & Agentic Patterns

### GraphRAG
*   **Mechanism:** Combining vector search with Knowledge Graphs (entities and relationships).
*   **Benefit:** Enables global reasoning over a dataset (e.g., "What are the common themes across all these reports?").

### Query Expansion & Transformation
*   **Multi-Query:** Generating multiple variations of the user query to capture different semantic angles.
*   **HyDE (Hypothetical Document Embeddings):** Generating a fake "perfect" answer and using its embedding to search for real documents.
*   **Sub-query Decomposition:** Breaking complex questions into smaller, atomic retrieval tasks.

### Corrective RAG (CRAG)
*   **Logic:** Evaluates the quality of retrieved documents; if irrelevant, triggers a web search or fallback mechanism.

### Self-Reflective RAG
*   **Logic:** The system critiques its own retrieved context and final answer for relevance and grounding (Self-RAG).
