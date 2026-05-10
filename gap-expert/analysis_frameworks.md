# Analysis Frameworks

A working library of frameworks the GAP analyst applies, organized by domain. Pick the one(s) that fit the engagement; do not apply all of them. A framework is a lens, not a checklist. The goal is structured insight, not framework theatre.

## Table of contents

1. Cross-cutting frameworks (apply to most engagements)
2. Software systems & SaaS platforms
3. DevOps environments
4. AI / ML systems
5. ERP / CRM ecosystems
6. Customer support operations
7. Internal business workflows
8. IT infrastructure
9. Digital transformation programs
10. Operational maturity assessments

---

## 1. Cross-cutting frameworks

### 1.1 Capability maturity ladder (1-5)

The default scale used throughout the report.

| Level | Label | Characteristics |
|---|---|---|
| 1 | Initial / ad-hoc | Heroics-driven; outcomes depend on individuals; no documentation |
| 2 | Repeatable | Patterns exist but inconsistent; some documentation; lots of variance |
| 3 | Defined | Documented standards; consistent application; measurable |
| 4 | Managed | Quantitatively controlled; outcomes predictable; continuous measurement |
| 5 | Optimizing | Continuous improvement; capability is a competitive differentiator |

Most enterprises live at 2-3 across most capabilities. Targeting 5 universally is a sign of a poorly calibrated assessment.

### 1.2 People / Process / Technology / Data / Governance (PPTDG)

A cross-section every capability deep-dive should consider:
- **People** — skills, headcount, ownership, incentives, gravity
- **Process** — defined workflows, decision rights, cadences
- **Technology** — tooling, platforms, integrations, debt
- **Data** — completeness, quality, timeliness, system of record
- **Governance** — policies, standards, audit, accountability

Most "technology problems" turn out to be people-or-process problems. PPTDG forces you to check.

### 1.3 5-Whys + Ishikawa for root cause

Already covered in SKILL.md. When the chain runs out, you've reached structural cause.

### 1.4 Value-Effort-Risk prioritization matrix

For ranking recommendations:
- **Value** — quantified business impact (revenue, cost, risk reduction, optionality)
- **Effort** — engineering + operational effort to deliver
- **Risk** — execution risk (technical, organizational, vendor, change-management)

Plot on a 2x2 (value × effort), then annotate risk. Top-right (high-value, low-effort, low-risk) is your Phase 1.

---

## 2. Software systems & SaaS platforms

### 2.1 The well-architected pillars (cloud-agnostic)

A practical lens for any production system:

| Pillar | What to assess |
|---|---|
| Operational excellence | Observability, runbooks, on-call, incident response, change management |
| Security | IAM, secrets, network segmentation, data protection, supply chain, AppSec |
| Reliability | SLOs, redundancy, failure modes, DR tested, dependency mapping |
| Performance efficiency | Latency, throughput, capacity planning, load testing, caching strategy |
| Cost optimization | Unit economics per tenant / per request, rightsizing, idle resources, commit strategy |
| Sustainability | Carbon footprint, hardware lifecycle (lower priority for most orgs but rising) |

### 2.2 C4 model (Context / Container / Component / Code)

For documenting and assessing architecture. In a GAP analysis, you usually only need Context + Container — going to Component or Code is an architecture review, not a GAP analysis.

### 2.3 4+1 architectural views

Logical / Process / Development / Physical + Scenarios. Good when assessing whether the documented architecture matches the running system. The mismatch is usually the finding.

### 2.4 SaaS-specific signals

- **Multi-tenancy model** — pool / silo / bridge — and whether it matches the customer-segment economics
- **Tenant isolation** — data, compute, network — and how it's enforced
- **Per-tenant unit economics** — gross margin per customer; tail-customer cost
- **Customer-facing SLAs vs internal SLOs** — gap between commitment and capability
- **Onboarding time-to-value** — and what blocks it
- **Self-serve coverage** — what % of common operations require an internal ticket

### 2.5 Common red flags

- "We don't have a staging environment that matches production"
- "We deploy when it's quiet"
- Single-engineer dependency for any production system
- No service ownership map
- No SLO definitions, only SLA commitments
- Cost growth tracking ahead of revenue growth
- No customer-tier-based isolation despite enterprise-tier pricing

---

## 3. DevOps environments

### 3.1 DORA metrics

The defensible baseline for delivery performance:

| Metric | Definition | Elite | High | Medium | Low |
|---|---|---|---|---|---|
| Deployment frequency | How often code reaches prod | On-demand (multiple per day) | Weekly to daily | Weekly to monthly | < monthly |
| Lead time for changes | Commit to prod | < 1 day | 1 day - 1 week | 1 week - 1 month | > 1 month |
| Change failure rate | % deployments causing degradation | 0-15% | 16-30% | 16-30% | 16-30% |
| MTTR | Time to restore service | < 1 hour | < 1 day | 1 day - 1 week | > 1 week |

Use these literally. They're well-validated and resistant to gaming.

### 3.2 SPACE framework

For developer experience and productivity (where DORA is too narrow):
- **Satisfaction & well-being** — eNPS, burnout signals
- **Performance** — outcome quality
- **Activity** — output (use sparingly; gameable)
- **Communication & collaboration** — review latency, knowledge sharing
- **Efficiency & flow** — uninterrupted time, blocked time, context switches

### 3.3 CALMS (DevOps culture)

Culture / Automation / Lean / Measurement / Sharing. A cultural assessment lens — useful when the technical metrics are fine but the team is unhappy or losing people.

### 3.4 Platform engineering maturity

| Level | Signal |
|---|---|
| 1 | Each team rolls their own infra; ticket-based ops |
| 2 | Shared scripts and Terraform modules; ops centralized |
| 3 | Internal developer platform (IDP) with golden paths |
| 4 | Self-service platform with measurable adoption (>60% of services) |
| 5 | Platform as a product with customer success function for internal users |

### 3.5 Common red flags

- CI takes > 30 min for a typical service
- Deploys require manual approval from a single person
- "We don't have IaC for the legacy stack"
- Secrets in environment files committed to git history
- No staging that matches prod
- Incidents resolved without postmortems
- On-call burden concentrated on 2-3 engineers
- Build server is a snowflake VM

---

## 4. AI / ML systems

### 4.1 NIST AI Risk Management Framework (AI RMF) — Govern / Map / Measure / Manage

The defensible governance lens for AI systems.

| Function | What to assess |
|---|---|
| Govern | Policy, accountability, risk tolerance, oversight |
| Map | Context, intended use, stakeholders, data lineage |
| Measure | Performance, fairness, robustness, drift, safety |
| Manage | Risk treatment, incident response, decommissioning |

### 4.2 MLOps maturity ladder

| Level | Signal |
|---|---|
| 0 | No automation; notebooks in production |
| 1 | Trained models versioned; manual deploy |
| 2 | CI/CD for models; automated retraining triggers |
| 3 | Continuous training, monitoring, drift detection, automated rollback |
| 4 | Full closed-loop with human-in-the-loop and shadow deployment |

### 4.3 Generative-AI-specific lens

For LLM / RAG / agent systems specifically:

| Dimension | What to look at |
|---|---|
| Data layer | Source quality, chunking, embedding strategy, freshness, access control |
| Model layer | Model selection rationale, version pinning, cost per call, latency p95 |
| Retrieval | Recall@K, context relevance, citation accuracy |
| Orchestration | Prompt versioning, tool definitions, agent loop bounds, fallback paths |
| Evaluation | Gold set, automated eval, regression suite, online metrics |
| Safety | Input filtering, output filtering, jailbreak resistance, PII redaction |
| Observability | Trace logging, prompt/response storage, cost dashboard, latency SLO |
| Governance | Use-case approval, data residency, model card, incident process |
| Cost | $ per task, $ per user, marginal cost behavior at scale |

### 4.4 AI readiness assessment (for orgs not yet deploying AI in production)

Five gates to assess in order:
1. **Data readiness** — accessible, labeled, quality-assured, governed
2. **Use case fit** — task is well-defined, value is sized, evaluation is possible
3. **Build/buy/partner decision** — based on TCO and differentiation, not hype
4. **Operating model** — who runs it, who's on-call, who governs it
5. **Risk & compliance** — regulatory, contractual, and ethical clearance

### 4.5 Common red flags

- "We're going to use AI agents" with no defined task or success criterion
- No evaluation set; "we just check it manually"
- Model selection driven by demos, not benchmarks
- No PII handling story
- Production prompts live in a Slack thread
- No cost dashboard; surprise bills
- "ChatGPT integration" with no enterprise-tier privacy controls

---

## 5. ERP / CRM ecosystems

### 5.1 Fit-gap analysis

The native framework for ERP/CRM. For each business process:

| Process | Standard fit | Configuration | Customization | Integration | Manual workaround |
|---|---|---|---|---|---|
| [e.g., Order-to-cash] | 80% | 15% | 5% | 1 system | None |
| […] | … | … | … | … | … |

Customization > 15% on a single process is a strong "should reconsider" signal — it usually predicts upgrade pain and vendor support friction.

### 5.2 Process coverage matrix

Map the org's actual business processes to ERP/CRM modules. The white space (processes not covered, processes covered by spreadsheets, processes split across systems) is where the gaps live.

### 5.3 Master data management (MDM) lens

- **System of record** — defined per entity? (customer, product, vendor, account)
- **System of reference** — defined per entity?
- **Data quality** — measured? what's the duplicate rate?
- **Stewardship** — named role per master domain?
- **Synchronization** — real-time / batch / manual? lag SLO?

### 5.4 Adoption assessment

A perfectly configured ERP no one uses is a failed ERP. Assess:
- Login frequency vs. license count
- Process steps performed in-system vs. in side spreadsheets
- Training completion vs. role-required modules
- Help-desk ticket themes (config issue vs. user-skill issue)

### 5.5 Common red flags

- Critical processes run on Excel that "feeds into" the ERP weekly
- Customer master differs by > 5% between CRM and ERP
- Customizations not migrated through the latest two upgrades
- Reports built outside the system because the system can't produce them
- "We can't change that — it's how it was set up"

---

## 6. Customer support operations

### 6.1 Ticket lifecycle decomposition

Every minute of a ticket is in one of these states. Map them and find the dominant time sink:

| Stage | Common time sinks |
|---|---|
| Submission | Form complexity, channel ambiguity, identification |
| Routing | Mis-tagging, queue depth, capacity mismatch |
| Triage | Insufficient info from customer, escalation criteria unclear |
| Investigation | Tool sprawl, knowledge fragmentation, no system-of-record access |
| Resolution | Skill gap, dependency on engineering, missing self-service path |
| Communication | Template gaps, language barriers, status update cadence |
| Closure & QA | CSAT collection, knowledge capture |

### 6.2 SLA / SLO decomposition

- First-response time (by tier, channel, severity)
- Time-to-resolution (by tier, severity)
- CSAT (by tier, channel, agent, intent)
- First-contact resolution rate
- Escalation rate
- Backlog age distribution (p50, p90, p99 — not just average)

### 6.3 Deflection and self-serve maturity

| Level | Signal |
|---|---|
| 1 | All tickets reach a human |
| 2 | FAQ exists; deflection unmeasured |
| 3 | Knowledge base searchable; deflection 5-15% |
| 4 | Conversational deflection (bot/AI) for common intents; 20-40% |
| 5 | Personalized self-serve; AI-assisted with confidence-based handoff; 40-60%+ |

### 6.4 Agent enablement lens

- Time to ramp (new agent → independent)
- Knowledge base coverage (% of intents with current article)
- Tool consolidation (how many tools per ticket on average)
- AI assist (suggested reply, summarization, KB pull)
- Coaching cadence and feedback loop

### 6.5 Common red flags

- No tagging taxonomy, or 200+ tags with no hierarchy
- CSAT collected but never reviewed by intent
- Same intent appearing in top-10 weekly for > 6 months (preventable but not prevented)
- Escalations land on engineering with no buffer
- Knowledge base updated by support manager only
- No coverage on weekends / off-hours despite global customer base

---

## 7. Internal business workflows

### 7.1 Workflow maturity ladder

| Level | Signal |
|---|---|
| 1 | Tribal — exists in heads, runs on email and Slack |
| 2 | Documented but not enforced |
| 3 | Tooled (ticket / form / case management) |
| 4 | Measured (cycle time, throughput, exceptions tracked) |
| 5 | Continuously optimized; automation embedded |

### 7.2 Process mining lens

For workflows where event-log data exists:
- Variant analysis — how many actual paths vs. the documented path?
- Bottleneck analysis — where does work pile up?
- Rework rate — % of cases revisiting earlier states
- Conformance rate — % of cases following the documented path

If event-log data doesn't exist, that's itself a finding.

### 7.3 Automation candidacy scoring

Per workflow, score 1-5 on each:
- **Volume** — how often it runs
- **Standardization** — how repeatable each instance is
- **Rule clarity** — how cleanly automatable the decisions are
- **Data accessibility** — whether the inputs are in systems vs. heads/email
- **Consequence of error** — how reversible mistakes are

Total score → automation priority.

---

## 8. IT infrastructure

### 8.1 ITIL service lifecycle (still relevant in regulated/large orgs)

Service strategy / design / transition / operation / continuous improvement. Use as a maturity assessment per service category, not a checklist.

### 8.2 Reliability lens

- **SLOs** — defined, measured, error-budget consumed?
- **DR/BCP** — RTO / RPO defined per tier, last successful test
- **Redundancy** — single points of failure mapped
- **Capacity** — headroom per resource pool, growth trend
- **Observability** — three-pillars (logs / metrics / traces) coverage

### 8.3 Security lens

- **Identity** — IAM model, MFA coverage, privileged access
- **Network** — segmentation, egress control, zero-trust posture
- **Data** — classification, encryption at rest/in transit, key management
- **Endpoint** — EDR coverage, patch SLA, BYOD posture
- **Supply chain** — SBOM, dependency scanning, vendor risk assessment
- **Detection & response** — SIEM/SOAR, MTTD, MTTR for security events

### 8.4 FAIR (Factor Analysis of Information Risk) for quantified risk

Where the org needs to put dollar figures on risk exposure. Heavier than most engagements need; reach for it when the audience is a risk committee or insurer.

### 8.5 Common red flags

- "We have backups" — but no restore test in the last 12 months
- Privileged access via shared credentials
- DR plan exists; never tested
- Patch backlog > 90 days for high-CVE items
- No asset inventory ground-truth
- Observability gaps on the most-changed systems

---

## 9. Digital transformation programs

### 9.1 Adapted McKinsey 7S

Structure / Strategy / Systems / Shared values / Style / Staff / Skills. Useful for assessing whether the technical transformation has matching organizational support — most digital transformations fail on the right-hand side, not the left.

### 9.2 Transformation readiness gates

Five gates to clear before declaring a transformation "ready":
1. **Executive sponsorship** — named, present, time-committed (not just rhetorical)
2. **Funding model** — multi-year, not project-by-project
3. **Operating model** — target organization defined; transition path planned
4. **Capability investment** — talent acquisition / upskilling plan
5. **Change management** — communications, training, incentive alignment

### 9.3 Value realization lens

Beyond delivery (did we ship?) and adoption (do they use it?), value realization asks: did the business outcome materialize? Most transformations stop at adoption. The KPI section of the report should not.

---

## 10. Operational maturity assessments

### 10.1 Cross-functional capability map

For full-org maturity, score each capability on the 1-5 ladder:

- Strategy & planning
- Finance & controls
- People & talent
- Sales & GTM
- Marketing
- Product management
- Engineering & delivery
- Customer success & support
- Data & analytics
- Security & compliance
- IT operations
- Legal & risk
- Procurement & vendor management

The shape of the maturity profile matters more than any single number. Even-but-low is a different problem than peaky-but-uneven.

### 10.2 Operating-rhythm lens

How does the company run itself?
- Strategic cadence (annual / quarterly planning)
- Operational cadence (monthly business reviews, weekly metrics)
- Tactical cadence (sprint, standup, retro)
- Decision rights — RACI / DACI defined?
- Escalation paths — clear and used?

Companies that look operationally weak often have functional gaps but more often have rhythm gaps.

---

## How to choose

| If the engagement is about… | Lead with |
|---|---|
| A specific software product or SaaS platform | §2 + §3 (delivery) + §1.1 (maturity) |
| Engineering productivity / DevOps | §3 (DORA + SPACE + platform) |
| ML/LLM/AI systems | §4 (NIST AI RMF + MLOps + GenAI lens) |
| Salesforce / SAP / NetSuite / D365 | §5 (fit-gap + MDM + adoption) |
| Support team performance | §6 (lifecycle + SLA + deflection + agent) |
| Back-office workflows | §7 (workflow maturity + process mining + automation candidacy) |
| Data center / cloud / network | §8 (ITIL where regulated; reliability + security otherwise) |
| Multi-year change program | §9 (7S + readiness gates + value realization) |
| Whole-org "where are we" | §10 (capability map + operating rhythm) |

If the engagement spans multiple, layer the lenses but produce one integrated report.
