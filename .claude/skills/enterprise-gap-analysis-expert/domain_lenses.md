# Domain Lenses

For each supported domain, this file gives:
- The capabilities you should at minimum ask about
- The red flags that almost always show up in a real assessment
- Common gaps to expect (so you don't miss obvious ones, and so you don't write them up as if they're original insights when they're table-stakes)
- The default target maturity profile for a "healthy" organization at moderate scale

These are starting points, not conclusions. The actual assessment must be specific to the user's context.

---

## 1. Software systems / SaaS platforms

### Capabilities to assess
- Architecture & domain modeling
- Build & release engineering
- Test strategy (unit / integration / e2e / contract / load)
- Observability (logs / metrics / traces)
- SLOs & reliability engineering
- Security (AppSec, AuthN/Z, secrets, dependency mgmt)
- Performance & scalability
- Cost / unit economics
- Tenancy & isolation (for SaaS)
- Customer-facing API & extensibility
- Data engineering (operational data, analytics data)
- Documentation (architectural, operational, customer-facing)

### Red flags
- Production credentials in source code (current or history)
- No staging / pre-prod that resembles prod
- Single-engineer dependency for any production system
- "We can't touch that part of the codebase"
- Manual SQL run against production for routine operations
- Cost growing faster than revenue with no per-tenant attribution
- A monitoring tool that no one looks at
- Customer-facing SLAs without internal SLOs to back them
- Feature flags that have outlived their feature
- Test suite duration > 30 minutes; engineers skip it locally

### Common gaps
- Service ownership undefined or stale
- ADRs (architecture decision records) absent or never updated
- Tier-1 services without measurable SLOs
- Background jobs without observability
- Backups without restore tests
- No load testing; capacity planning is folklore
- Documentation written once at launch, never refreshed

### Default target profile (mid-scale SaaS, 50-300 engineers)
| Capability | Target |
|---|---|
| Build/release | 4 (managed) |
| Test strategy | 3-4 |
| Observability | 4 |
| SLOs/reliability | 4 |
| Security (AppSec) | 3-4 |
| Cost discipline | 3 |
| Tenancy | 4 |
| Documentation | 3 |

---

## 2. DevOps environments

### Capabilities to assess
- Source control & branching strategy
- CI: build, test, scan, package
- CD: deploy, progressive delivery, rollback
- Infrastructure as Code (coverage, modularity, drift detection)
- Secrets management
- Environment management (parity, ephemeral envs)
- Internal developer platform (golden paths, self-service)
- Observability platform (instrumentation standards, dashboards)
- Incident management (paging, runbooks, postmortems)
- On-call sustainability (rotation, comp, burnout signals)
- DORA metrics — measured?
- Cost of CI/CD infrastructure itself

### Red flags
- "We deploy on Fridays" / "we don't deploy on Fridays"
- One person knows how to do hotfixes
- Long-lived feature branches (> 2 weeks)
- IaC for new infra, ClickOps for legacy infra
- Same env for staging and customer demos
- Postmortems that blame individuals
- On-call comp = "we appreciate it"
- CI runs nightly because it's too slow to run on every PR

### Common gaps
- IaC coverage < 80% of infra
- No drift detection
- Secrets in env files in git history
- Ephemeral envs not available; testing waits in line for shared staging
- Runbooks exist for 30-50% of P1 scenarios
- Postmortem follow-up actions not tracked to closure
- No platform team or platform team funded by project

### Default target profile (high-velocity engineering org)
| Capability | Target |
|---|---|
| CI | 4 |
| CD | 4 |
| IaC coverage | 4 |
| Observability | 4 |
| Incident process | 4 |
| Platform engineering | 3-4 |
| DORA: deploy freq | High → Elite |
| DORA: lead time | High → Elite |
| DORA: CFR | < 15% |
| DORA: MTTR | < 1 day |

---

## 3. AI / ML systems

### Capabilities to assess
- Use-case selection & approval
- Data engineering & lineage
- Feature engineering / RAG indexing
- Training / fine-tuning pipeline
- Evaluation (offline + online)
- Deployment & serving
- Monitoring (performance, drift, cost)
- Safety (input/output filtering, jailbreak resistance, PII)
- Governance (model cards, approval, audit)
- Cost management (per-call, per-user, per-tenant)
- Talent & operating model (who owns the system?)

### Red flags
- "We're going to build agents" with no defined task or success criterion
- No evaluation set; quality is "vibes-based"
- Production prompts versioned in Slack
- No PII redaction story
- Model selection driven by demos, not benchmarks
- "We'll fine-tune" before they've tried prompting + retrieval well
- No cost dashboard; surprise bills
- Single notebook in someone's local env feeding production
- ChatGPT consumer tier used for company data

### Common gaps
- No model card / system documentation
- No drift monitoring
- Evaluation set < 100 examples or never refreshed
- No human-in-the-loop for low-confidence outputs
- No incident process for AI-specific failures
- Governance is "the eng manager looked at it"
- Vendor lock-in not assessed

### Default target profile (production AI/LLM system)
| Capability | Target |
|---|---|
| Use-case selection | 3 (defined approval) |
| Data lineage | 3 |
| Eval (offline) | 4 |
| Eval (online) | 3-4 |
| Drift monitoring | 4 |
| Safety controls | 4 |
| Governance (NIST AI RMF) | 3-4 |
| Cost discipline | 4 |

---

## 4. ERP / CRM ecosystems

### Capabilities to assess
- Module / process coverage
- Configuration vs customization ratio
- Integration architecture (point-to-point vs platform)
- Master data management
- Data quality
- User adoption (per role / process)
- Reporting & analytics
- Upgrade / patch posture
- Vendor relationship & contract terms
- Workforce skills (admins, developers, super-users)

### Red flags
- Critical processes run in spreadsheets that "feed into" the ERP weekly
- Customer / vendor / product master differs > 5% across systems
- Customizations not migrated through last two upgrades
- Reports built outside the system because the system can't produce them
- "We can't change that — it's how it was set up"
- Single admin dependency
- Integrations are scheduled FTP files in 2026
- Renewal coming in < 12 months with no negotiation strategy

### Common gaps
- No master data steward per domain
- No upgrade cadence; multi-version drift
- Integration spaghetti — N×N point-to-point
- Customization debt nobody can quantify
- Adoption < 70% of licensed seats actively using
- No fit-gap analysis since original implementation

### Default target profile (mid-market ERP/CRM)
| Capability | Target |
|---|---|
| Process coverage in-system | 80%+ |
| Customization ratio | < 15% |
| MDM stewardship | 3-4 |
| Integration model | 3 (iPaaS or hub) |
| Adoption | 4 |
| Upgrade posture | 3 (within 1 major version) |
| Reporting | 3 |

---

## 5. Customer support operations

### Capabilities to assess
- Channel strategy (which channels, why these)
- Tagging / intent taxonomy
- Routing & queueing
- SLA / SLO definition and tracking
- Knowledge management
- Self-service / deflection
- Agent enablement (tooling, training, AI assist)
- Quality assurance & coaching
- Escalation paths
- Voice-of-customer feedback loop into product/eng
- Workforce planning (capacity, scheduling, attrition)

### Red flags
- Tag explosion (200+ tags, no hierarchy)
- CSAT collected but never reviewed by intent
- Same intent in top-10 weekly for > 6 months
- Escalations land on engineering with no buffer
- Knowledge base updated only by support manager
- No off-hours coverage despite global customer base
- Agent attrition > 30% annually
- "Why aren't we using AI?" — without identifying which intents

### Common gaps
- No deflection measurement
- No FCR (first-contact resolution) tracking
- KB articles outdated, never audited
- No coaching cadence
- VOC feedback dies in support queue, never reaches product
- Workforce model is "best effort"

### Default target profile (mid-scale B2B SaaS support)
| Capability | Target |
|---|---|
| Tagging / taxonomy | 4 |
| SLA tracking | 4 |
| Knowledge management | 3-4 |
| Self-service / AI deflection | 3-4 (target 25-40% deflection) |
| Agent enablement | 4 |
| QA & coaching | 3-4 |
| VOC loop | 3 |

---

## 6. Internal business workflows

### Capabilities to assess
- Workflow inventory (what processes exist?)
- Workflow ownership
- Documentation
- Tooling (case mgmt, forms, BPM)
- Measurement (cycle time, throughput, exception rate)
- Automation coverage
- Audit trail
- Exception handling

### Red flags
- "It runs on email and Slack"
- One person knows all the steps
- Spreadsheets passed around as the workflow itself
- No measurement; "it works" = nobody complained
- Approval steps with no defined criteria
- Manual data re-entry between systems
- Workarounds older than the people performing them

### Common gaps
- Workflow inventory doesn't exist
- Process owner role undefined
- No SLA per process
- Automation candidates not evaluated systematically
- Audit trail gaps in regulated processes

### Default target profile (typical mid-size company)
| Capability | Target |
|---|---|
| Workflow inventory | 3 |
| Process ownership | 3 |
| Tooling | 3 |
| Measurement | 3 |
| Automation coverage (high-volume) | 3 |
| Audit trail | 4 (regulated) / 3 (not) |

---

## 7. IT infrastructure

### Capabilities to assess
- Asset inventory & CMDB
- Network architecture & segmentation
- Compute & storage architecture
- IAM & PAM
- Endpoint management
- Backup & DR (with restore-tested status)
- Patching & vulnerability management
- Monitoring & alerting
- Service desk
- Vendor management

### Red flags
- No ground-truth asset inventory
- Privileged access via shared credentials
- DR plan never tested
- Patch backlog > 90 days for high-CVE items
- Network segmentation = "trust the firewall"
- MFA not universal
- No SBOM for third-party software
- Service desk drowning in repeat tickets

### Common gaps
- CMDB exists but not authoritative
- IAM model relies on group sprawl
- Backups exist; restore-tested coverage is partial
- No PAM solution; admins use personal accounts
- Endpoint EDR coverage < 95%
- Patching SLA defined; never measured

### Default target profile (regulated mid-size enterprise)
| Capability | Target |
|---|---|
| Asset inventory | 4 |
| IAM | 4 |
| Backup + restore tested | 4 |
| Patching | 4 |
| EDR coverage | 4 |
| Network segmentation | 3-4 |
| Service desk | 3-4 |

---

## 8. Digital transformation programs

### Capabilities to assess
- Strategy clarity & alignment
- Executive sponsorship presence
- Funding model
- Operating model (current → target)
- Talent strategy (acquire / upskill / outsource)
- Technology platform decisions
- Data strategy
- Change management capability
- Governance & risk
- Value realization tracking

### Red flags
- Multiple "transformations" running with overlapping scope
- Sponsor is in name only; not present at steering
- Annual budget cycle stops the program every Q4
- "We'll figure out the operating model later"
- Vendor is steering the strategy
- KPIs are activity-based ("trainings delivered") not outcome-based
- Communications are top-down only

### Common gaps
- No baseline measurement before launch
- No formal change management function
- Adoption tracked but not value
- Mid-program, no one can answer "are we on track?"

### Default target profile
| Capability | Target |
|---|---|
| Sponsorship | 4 |
| Funding model | 3-4 (multi-year committed) |
| Operating model | 3 (designed and in transition) |
| Change management | 3-4 |
| Value tracking | 4 |

---

## 9. Operational maturity assessments

(Broad, cross-functional. Use the capability list in `analysis_frameworks.md` §10.1.)

### Red flags at the org level
- No operating rhythm above the team level
- Decisions consistently made twice (once tactically, once when leadership notices)
- Strategy refreshed annually, then ignored
- KPIs differ between functions — no shared scorecard
- No retrospective at the program / quarterly level

### Common cross-functional gaps
- RACI undefined for cross-functional decisions
- Functions running on different planning cadences
- No system of record at the company level
- Unclear escalation paths
- Talent gravity weak — losing senior people
