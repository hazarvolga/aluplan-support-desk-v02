# Domain-Specific Audit Checklists

Use these checklists to identify gaps in specific technical environments.

## 1. SaaS & Cloud Native
*   **Multi-tenancy:** Isolation levels, resource allocation.
*   **Scalability:** Auto-scaling groups, database sharding.
*   **State Management:** Stateless application design, session handling.
*   **API Design:** Versioning, rate limiting, documentation.

## 2. DevOps & CI/CD
*   **Pipeline Health:** Build times, failure rates, deployment frequency.
*   **Infrastructure as Code (IaC):** Terraform/CloudFormation coverage, drift detection.
*   **Observability:** Metrics (Prometheus), Logs (ELK), Tracing (OpenTelemetry).
*   **Artifact Management:** Secure registries, version pinning.

## 3. AI & RAG Systems
*   **Data Ingestion:** Parsing quality, metadata extraction, update sync.
*   **Retrieval Quality:** Precision@K, hybrid search vs. dense-only.
*   **Hallucination Control:** Grounding prompts, citation logic, guardrails.
*   **Vector DB:** Indexing strategy, latency, cost-per-query.

## 4. Operational Transformation
*   **Team Productivity:** Developer experience (DX), onboarding time.
*   **Cost Optimization:** Cloud spend, idle resources, licensing.
*   **Compliance:** GDPR/SOC2 readiness, PII protection.
*   **Disaster Recovery:** RPO/RTO metrics, backup frequency.
