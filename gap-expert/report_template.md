# Report Template

This is the canonical structure for the Enterprise GAP Analysis report. Use it verbatim for the section order and headings. Fill in placeholders. Do not skip sections — if a section is genuinely not applicable, mark it *Not in scope* with a one-sentence justification rather than removing it.

The bracketed `[guidance: ...]` notes are instructions to you, the producer. Strip them from the final output.

---

# [Engagement Title — e.g., "Enterprise GAP Analysis: AffexAI Customer Support Operations"]

**Prepared for:** [Sponsor name / role]  
**Prepared by:** Enterprise GAP Analysis Engagement  
**Date:** [YYYY-MM-DD]  
**Document version:** [v0.1 draft / v1.0 final]  
**Classification:** [Internal / Restricted / Confidential]

---

## 1. Executive Summary

[guidance: 4-7 short paragraphs. The reader should be able to make a directional decision after reading only this section. State the headline finding, the top 3-5 risks, the top 3-5 recommendations, the indicative investment band, and the expected outcome. No table here — just prose. Plain language; no jargon a CFO wouldn't recognize.]

**Headline finding:** [One sentence. The thing that, if the reader remembers nothing else, they should remember.]

**Top risks if no action is taken:**
1. [Risk in one sentence with timeframe and consequence.]
2. […]
3. […]

**Recommended path forward:**
[2-3 paragraphs describing the program's shape — phased over how long, requiring what kind of investment, producing what outcome.]

**Indicative investment band:** [e.g., $X-Y over 18 months / N FTE-quarters of effort / "to be sized after Phase 1"]

**Expected outcome by [horizon]:** [The measurable end-state. Reference the KPI section.]

---

## 2. Scope, Method, and Assumptions

### 2.1 In scope
[Bulleted list of systems, processes, teams, and capabilities included.]

### 2.2 Out of scope
[Bulleted list of what was deliberately excluded, with one-line rationale each.]

### 2.3 Method
[Brief description of the analysis approach: documents reviewed, frameworks applied, interviews conducted (or not), period covered. If this analysis is desk-only based on user-supplied information, say so.]

### 2.4 Assumptions
[guidance: Every assumption that, if wrong, would invalidate a finding goes here. Number them so the reader can challenge specific ones.]

| # | Assumption | If wrong, this impacts |
|---|---|---|
| A1 | [Assumption text] | [Which findings / recommendations] |
| A2 | … | … |

---

## 3. Current-State Assessment

[guidance: Organize by capability, not by tool or team. A capability is "what the organization is able to do" — e.g., "Release software safely to production," not "Uses Jenkins." Each capability gets a short paragraph (or 3-5 bullet items) covering what exists, how it performs, where the evidence is, and the maturity level.]

### 3.1 Capability map

| Capability | Maturity (1-5) | Evidence / signal | Notes |
|---|---|---|---|
| [e.g., Release engineering] | 2 | "Deploys are manual; mean lead time 11 days per change-log review" | Concentration risk on two engineers |
| [e.g., Incident response] | 3 | "Documented runbooks exist for 70% of P1 scenarios" | No on-call compensation; volunteer rota |
| … | … | … | … |

### 3.2 Capability deep-dives
[guidance: One H3 subsection per capability rated below target. For each: what's working, what isn't, what evidence supports the claim. Do not write a deep-dive for capabilities at target — just note them as healthy in the map above.]

#### 3.2.1 [Capability name]
[Prose + bullets.]

---

## 4. Target-State Definition

[guidance: For each capability assessed above, state where it should be — calibrated to this organization's stage, industry, and constraints. Not generic best practice. Not "world-class." Specifically: what should this organization be able to do, by when, given who they are.]

### 4.1 Target capability map

| Capability | Current (1-5) | Target (1-5) | Target horizon | Rationale |
|---|---|---|---|---|
| [e.g., Release engineering] | 2 | 4 | 12 months | Reliability now blocks customer growth; velocity gap is closing competitively |
| … | … | … | … | … |

### 4.2 Target architecture (if applicable)
[guidance: Include only if the engagement involves architecture. Diagram in mermaid or plain description. State the pattern (event-driven, modular monolith, cell-based, multi-region active-active, etc.) and *why this pattern for this organization*.]

---

## 5. Gap Inventory

[guidance: Every gap gets a row. Severity per `references/severity_and_prioritization.md`. Each gap referenced by stable ID throughout the rest of the document.]

| ID | Gap statement | Capability | Severity | Owner role |
|---|---|---|---|---|
| GAP-XXX-001 | [Single declarative sentence describing the delta.] | [Capability name] | Critical | [Role] |
| GAP-XXX-002 | … | … | High | … |
| … | … | … | … | … |

**Severity counts:** Critical: N · High: N · Medium: N · Low: N

---

## 6. Root-Cause Analysis

[guidance: For every Critical and High gap (and any Medium gap with non-obvious causation), do a root-cause walk. Use a 5-Whys-style chain or a short prose explanation. Tag the structural class (incentive / ownership / skills / tooling / architecture / data / process / governance / funding / vendor).]

### 6.1 [GAP-XXX-001] — [Short title]

**Symptom:** [What's observable.]

**Causal chain:**
1. [Why does X happen?] — [Because Y]
2. [Why Y?] — [Because Z]
3. [Why Z?] — [Because the structural cause]

**Structural class:** [e.g., Ownership + Funding model]

**Why this matters for the fix:** [The intervention has to address the structural cause, not the symptom. State which.]

### 6.2 [GAP-XXX-002] — […]
[…]

---

## 7. Business Impact & Value-at-Stake

[guidance: Quantify wherever possible. Where you cannot, give a defensible band and state what evidence would convert it to a number. Tie each impact to its source GAP IDs.]

### 7.1 Quantified impact

| Source GAPs | Impact category | Estimated annual value-at-stake | Confidence | Basis |
|---|---|---|---|---|
| GAP-XXX-001, GAP-XXX-007 | Revenue at risk (churn) | $X-Y | Medium | [Brief — e.g., "Based on stated 12% churn driven 40% by support latency per user-supplied retention data"] |
| GAP-XXX-003 | Opex (manual toil) | $X | High | [Brief] |
| GAP-XXX-005 | Regulatory exposure | Severe (qualitative) | n/a | [Brief — why this can't be priced without legal counsel] |
| … | … | … | … | … |

### 7.2 Cost of inaction

[2-3 paragraphs articulating what changes for the worse if the program is not funded. Be specific about timeframes — what happens in 90 days, 180 days, 12 months.]

### 7.3 Cost of action

[Indicative band for the recommended program. Distinguish capex / opex / FTE. Note what is missing to firm up the number.]

---

## 8. Prioritized Recommendations

[guidance: Each recommendation is a concrete intervention, not a theme. Tied to source GAP IDs. Ranked by a value-vs-effort-vs-dependency view, not severity alone.]

| # | REC-ID | Recommendation | Source GAPs | Severity addressed | Effort | Dependencies | Phase |
|---|---|---|---|---|---|---|---|
| 1 | REC-001 | [Concrete action — e.g., "Establish service ownership registry…"] | GAP-…-001, GAP-…-014 | Critical | M | None | 1 |
| 2 | REC-002 | … | … | High | L | REC-001 | 1 |
| 3 | REC-003 | … | … | High | XL | REC-001, REC-005 | 2 |
| … | … | … | … | … | … | … | … |

*Effort: S = ≤2 weeks, M = ≤2 months, L = ≤6 months, XL = 6+ months. Adjust at the engagement scale.*

### 8.1 Recommendation detail

[guidance: For Phase 1 recommendations, expand into subsections. Each: what we do, how we do it, what we stop doing (if anything), what success looks like, what KPI(s) move.]

#### REC-001 — [Title]
- **Action:** [What gets built / changed / stopped]
- **Approach:** [How — tooling, sequence, owners]
- **Success signal:** [Binary outcome or KPI ID]
- **Linked KPI(s):** [KPI-XXX]
- **Estimated effort:** [Range with confidence]
- **Dependencies:** [Other RECs, capabilities, decisions]

---

## 9. Phased Implementation Roadmap

[guidance: Default phasing — Stabilize / Modernize / Scale. Adapt to the engagement. Each phase has its own table. Include dependencies and parallel tracks.]

### 9.1 Phase 1 — Stabilize (Months 0-3)
**Objective:** [One sentence.]

| Workstream | Deliverable | Source RECs | Owner role | Dependencies | Success signal |
|---|---|---|---|---|---|
| [e.g., Ownership clarity] | Service registry + on-call rota | REC-001, REC-004 | Platform Lead | None | 100% of P1 services have named owner |
| … | … | … | … | … | … |

### 9.2 Phase 2 — Modernize (Months 3-9)
**Objective:** [One sentence.]

| Workstream | Deliverable | Source RECs | Owner role | Dependencies | Success signal |
|---|---|---|---|---|---|
| … | … | … | … | … | … |

### 9.3 Phase 3 — Scale & Differentiate (Months 9-24)
**Objective:** [One sentence.]

| Workstream | Deliverable | Source RECs | Owner role | Dependencies | Success signal |
|---|---|---|---|---|---|
| … | … | … | … | … | … |

### 9.4 Critical-path & sequencing notes
[Prose. Call out the 2-3 sequencing decisions that most affect timeline. Identify the critical path. Flag where parallelization is possible.]

---

## 10. KPI / OKR Framework

[guidance: KPIs that the program will move. Every KPI: defined, baselined (or marked TBB), targeted, owned, sourced. No KPI without a source of truth.]

| ID | KPI | Definition / formula | Baseline | Target (date) | Owner role | Source of truth |
|---|---|---|---|---|---|---|
| KPI-001 | [e.g., Deployment lead time] | Time from PR merge to production for tier-1 services (p50) | 11 days | < 1 day (Q4) | Platform Lead | CI/CD telemetry |
| KPI-002 | [e.g., L1 ticket deflection] | % of L1 tickets resolved without human agent | 0% | 35% (M+6) | Support Ops | Zendesk metrics |
| KPI-003 | … | … | TBB in Phase 1 | … | … | … |
| … | … | … | … | … | … | … |

### 10.1 Leading vs lagging indicators
[Brief note on which KPIs are leading (predictive) and which are lagging (outcome). The roadmap should move leading indicators in Phase 1; lagging indicators are expected to follow.]

---

## 11. Risk Register & Mitigation

[guidance: Risks of executing this program — not the risks of the status quo, which already appeared in §7.2.]

| ID | Risk | Likelihood | Impact | Mitigation | Owner role | Early-warning signal |
|---|---|---|---|---|---|---|
| RISK-001 | [e.g., "Platform team capacity insufficient to sustain Phase 1 + run BAU"] | High | High | Backfill 2 contractors for 90 days; freeze non-critical roadmap items | Engineering Director | Sprint completion < 60% for two consecutive sprints |
| RISK-002 | [e.g., "Vendor refuses contractual amendment needed for migration"] | Medium | Severe | Begin parallel commercial negotiation in week 1; identify alternate vendor by week 6 | Procurement Lead | Vendor non-response > 14 days |
| … | … | … | … | … | … | … |

### 11.1 Risk heatmap (qualitative)

| | Low Impact | Medium Impact | High Impact | Severe Impact |
|---|---|---|---|---|
| **High likelihood** | | | RISK-001 | |
| **Medium likelihood** | | | | RISK-002 |
| **Low likelihood** | | | | |

---

## 12. Architecture, Automation, and AI Opportunity Map

[guidance: This is where the program shifts from "fix what's broken" to "what should this org be doing differently in 12-24 months." Be specific or stay silent.]

### 12.1 Architecture moves

| Pattern | Where it applies | Why now | Trade-off accepted |
|---|---|---|---|
| [e.g., Modular monolith → service decomposition for billing only] | Billing module | Coupling blocks pricing-experiment velocity | Operational complexity for the billing team |
| … | … | … | … |

### 12.2 Automation opportunities

| Workflow | Current state | Automation target | Replaces | Build vs buy | Operating cost |
|---|---|---|---|---|---|
| [e.g., New-customer provisioning] | 6 manual steps, 3 systems, 4-hour lead time | Orchestrated workflow in n8n | Salesforce → ops Slack → manual provisioning | Build (existing n8n cluster) | ~$0 incremental + 0.1 FTE maintenance |
| … | … | … | … | … | … |

### 12.3 AI integration opportunities

[guidance: Each opportunity must specify: task, model class, integration point, evaluation method, guardrails, operating cost. No generic "use AI" entries.]

| Opportunity | Task | Model class | Integration point | Evaluation | Guardrails | Operating cost band |
|---|---|---|---|---|---|---|
| [e.g., L1 support deflection] | Answer L1 password / billing / shipping queries from KB | Mid-size hosted LLM + RAG over Zendesk KB | In-app chat widget; human handoff at confidence < 0.7 | 200-ticket weekly gold set; CSAT delta vs. control | PII redaction on input; deny-list for refunds & cancellations; full transcript audit | $X / 10k tickets |
| [e.g., Engineering toil reduction] | Auto-triage incoming bug reports | Small classifier + retrieval | GitHub Issues webhook | 500-issue labeled set; precision > 0.9 on routing | Human review on confidence < 0.8; weekly drift check | $Y / month |
| … | … | … | … | … | … | … |

### 12.4 What we are *not* recommending, and why

[guidance: Optional but valuable. Lists 2-4 fashionable moves the engagement explicitly rejects, with one-line rationale each. This builds credibility — it shows the analysis weighed alternatives.]

- **Microservices decomposition of the full monolith** — the team is 14 engineers; the operational tax exceeds the velocity gain at this scale.
- **Self-hosted open-weights LLM for support** — total cost of ownership exceeds the hosted alternative below ~50k inferences/day, which the user is years from.
- […]

---

## 13. Open Questions & Information Gaps

[guidance: List every material question the analysis could not answer with the information available. Each: what we'd need, why it matters, who should provide it.]

| # | Open question | What we'd need | Why it matters | Who should answer |
|---|---|---|---|---|
| Q1 | [Question] | [Specific data / decision] | [Which finding(s) it sharpens] | [Role] |
| … | … | … | … | … |

---

## Appendix A — Glossary
[Define every domain-specific term the report assumes the reader knows but might not.]

## Appendix B — Frameworks referenced
[List of the analysis frameworks applied (DORA, NIST AI RMF, CMMI, etc.) with one-line each on how they were used.]

## Appendix C — Document control
[Version history, contributor list, distribution list.]
