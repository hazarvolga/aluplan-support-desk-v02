# RAG Evaluation & LLMOps

This reference covers the frameworks and methodologies for measuring, monitoring, and governing enterprise RAG systems.

## 1. RAG Evaluation Framework (RAGAS / TruLens)

| Metric | Definition | Criticality |
| :--- | :--- | :--- |
| **Faithfulness** | Is the answer derived solely from the context? | High (Grounding) |
| **Answer Relevance** | Does the answer address the user query? | Medium |
| **Context Precision** | How relevant are the top-K retrieved docs? | High (Efficiency) |
| **Context Recall** | Did we find the document containing the answer? | High (Completeness) |
| **Semantic Relevancy** | Alignment of answer intent with user intent. | Medium |

## 2. Hallucination Mitigation Strategies

1.  **Strict Grounding Prompts:** Enforce "Use ONLY the provided context. If the answer is not there, say you don't know."
2.  **Attribution (Citations):** Require the LLM to provide line/page citations for every claim.
3.  **Cross-Check Verification:** Using a second LLM pass to verify the answer against the retrieved source.
4.  **Temperature Control:** Keep `temperature=0` for production RAG to ensure deterministic grounding.

## 3. Observability & Tracing (LLMOps)

*   **Trace-level visibility:** Every query must be traceable from user input -> query expansion -> vector DB hit -> reranker -> prompt -> LLM output.
*   **Latency Benchmarking:** Monitor the breakdown of latency (Embed: 200ms, Search: 300ms, LLM: 2s).
*   **Cost-per-Query:** Tracking token usage across ingestion and retrieval.

## 4. Governance & Safety

*   **PII Masking:** Scanning documents during ingestion for sensitive info (social security numbers, private emails).
*   **Access Control:** Mapping LDAP/AD groups to vector DB metadata filters to ensure users only see what they are authorized to see.
*   **Auditability:** Maintain logs of which documents were retrieved and provided to which user for compliance auditing.

## 5. Continuous Improvement (Feedback Loops)

*   **Human-in-the-loop (HITL):** Subject Matter Experts (SMEs) reviewing low-confidence RAG responses.
*   **Synthetic Data Evaluation:** Generating 1000s of query-answer pairs from your dataset to test retrieval performance at scale (using frameworks like G-Eval).
*   **A/B Testing:** Comparing different embedding models or reranking strategies in production.
