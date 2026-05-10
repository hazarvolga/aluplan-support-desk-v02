# KPI Library

A working library of KPIs by domain. Use these as starting points and adapt to the engagement. Every KPI in the report must have:

- **ID** (`KPI-XXX`)
- **Name**
- **Definition / formula**
- **Baseline** — current value, or explicitly "to be baselined in Phase 1"
- **Target** — value, by what date
- **Owner role**
- **Source of truth** — where the number comes from

A KPI without a source of truth is a wish. Cut it or downgrade it to "to be baselined."

This file gives the *menu*; selection is engagement-specific. Don't drop in 50 KPIs because the library has them — pick the 8-15 that actually matter for the program. Most programs need fewer KPIs than they think.

---

## 1. Software / SaaS platform KPIs

### Reliability
| KPI | Definition | Default target band |
|---|---|---|
| Tier-1 availability | (Total time − downtime) / total time, per service tier | 99.9% / 99.95% / 99.99% by tier |
| SLO error budget consumption | % of monthly error budget consumed by mid-month | < 50% |
| MTTR — production incidents | Time from detection to resolution, p50 | < 60 min for tier-1 |
| MTTD — production incidents | Time from event to detection, p50 | < 5 min for tier-1 |
| Change failure rate | % deploys causing incident or rollback | < 15% |

### Delivery & velocity
| KPI | Definition | Default target band |
|---|---|---|
| Deploy lead time | PR merge → production, p50 | < 1 day |
| Deploy frequency | Deploys per service per week | Daily for active services |
| Build time | CI green-build duration, p50 | < 10 min |
| Test pass rate (main) | % of main-branch builds passing | > 95% |

### Security
| KPI | Definition | Default target band |
|---|---|---|
| High-severity CVE remediation SLA | Time from disclosure to patch, p90 | ≤ 14 days |
| Secrets scanning coverage | % repos with active scanning | 100% |
| MFA coverage | % human accounts with MFA | 100% |
| Privileged access review cadence | Periodic review completion | Quarterly, 100% |

### SaaS unit economics
| KPI | Definition | Default target band |
|---|---|---|
| Gross margin per tenant — top decile | Revenue − attributable cost, top 10% customers | Track trend |
| Gross margin per tenant — bottom decile | Same, bottom 10% | Watch the tail |
| Cost-to-serve growth vs. revenue growth | YoY ratio | < 1.0 |

### Customer-facing
| KPI | Definition | Default target band |
|---|---|---|
| Tier-1 SLA attainment | % months meeting customer-facing SLA | ≥ 99% |
| Time-to-first-value (new tenant) | Onboarding start → first successful production action | Engagement-specific |

---

## 2. DevOps KPIs

### DORA core (use as headlines)
| KPI | Definition | Elite | High |
|---|---|---|---|
| Deployment frequency | Per service per week | Multiple/day | Daily–weekly |
| Lead time for changes | Commit → prod | < 1 day | 1 day – 1 week |
| Change failure rate | % deploys causing degradation | 0–15% | 16–30% |
| MTTR | Service restore time | < 1 hr | < 1 day |

### Platform & developer experience
| KPI | Definition | Default target band |
|---|---|---|
| Self-service infra adoption | % services using IDP for provisioning | > 60% |
| Ephemeral env availability | Time from request to ready | < 10 min |
| CI median wait time | PR open → CI green | < 20 min |
| eNPS — engineering | Engineer net promoter score | Trend |
| On-call burden | Pages per engineer per week | < 2 sustained |

### Operational
| KPI | Definition | Default target band |
|---|---|---|
| IaC coverage | % infra defined as code | > 90% |
| Drift incidents detected | Per month | Trending down |
| Postmortem completion rate | % P1/P2 incidents with postmortem in 5 business days | 100% |
| Postmortem action close rate | % action items closed within agreed SLA | > 80% |

---

## 3. AI/ML system KPIs

### Quality
| KPI | Definition | Notes |
|---|---|---|
| Eval suite pass rate | % gold set examples passing | Define per suite |
| Production accuracy / quality score | Online metric (CSAT, task success, click-through, etc.) | Task-specific |
| Hallucination / fabrication rate | % outputs citing unsupported facts | RAG-specific; aim < 2% |
| Human override rate | % outputs overridden by human reviewer | Lower-bound for trust calibration |

### Operations
| KPI | Definition | Default target band |
|---|---|---|
| Latency p95 | End-to-end response time, 95th percentile | Task-specific |
| Cost per task | All-in $ per inference / task | Trend with usage |
| Drift detection coverage | % models with monitored drift | 100% for tier-1 |
| Time to rollback | Model version rollback duration | < 15 min |

### Governance
| KPI | Definition | Default target band |
|---|---|---|
| Use-case approval coverage | % production AI uses through governance | 100% |
| Model card freshness | % models with current documentation | 100% |
| Incident response coverage | % AI-specific incident scenarios with runbooks | > 80% |

### Adoption / value
| KPI | Definition | Default target band |
|---|---|---|
| User adoption rate | DAU / MAU vs. licensed users | Engagement-specific |
| Task completion uplift | With-AI vs. baseline cohort | Define hypothesis upfront |
| Realized hours saved | Estimated time saved × adoption × confidence | Conservative bands only |

---

## 4. ERP / CRM KPIs

### Process & adoption
| KPI | Definition | Default target band |
|---|---|---|
| Process coverage in-system | % critical processes performed in ERP/CRM | > 80% |
| Active license utilization | % licensed seats used 5+ days/month | > 80% |
| Customization ratio | Custom code / total config + custom | < 15% |
| Spreadsheet dependency rate | Critical processes with Excel intermediate steps | Trend down |

### Data quality
| KPI | Definition | Default target band |
|---|---|---|
| Master data duplicate rate (customer, vendor, product) | Duplicate records / total | < 1% |
| Cross-system master data variance | Records differing across systems | < 1% |
| Data completeness — required fields | % records with all required fields | > 95% |

### Operations
| KPI | Definition | Default target band |
|---|---|---|
| Ticket-resolved-via-config rate | Help-desk tickets resolved through config (no code) | Trend up |
| Upgrade currency | Versions behind latest stable | ≤ 1 major version |
| Integration health — failed runs | Failed integration jobs per week | Trend down |

---

## 5. Customer support KPIs

### Volume & coverage
| KPI | Definition | Default target band |
|---|---|---|
| Total inbound — ticket volume | Per period | Trend with customer base |
| Tickets per customer per month | Volume normalized | Trend down with maturity |

### Speed
| KPI | Definition | Default target band |
|---|---|---|
| First-response time, p50 / p90 | Submission → first agent reply | Channel-specific |
| Time-to-resolution, p50 / p90 | Open → close, by severity | Tier-specific |
| Backlog age — p90 | Age of 90th-percentile open ticket | < 5 business days |

### Quality
| KPI | Definition | Default target band |
|---|---|---|
| CSAT — per ticket | Post-resolution survey | > 90% positive |
| First-contact resolution | % tickets closed without further customer contact | > 65% |
| Reopen rate | % tickets reopened within 7 days | < 8% |
| Escalation rate | % tickets escalated to higher tier or eng | < 15% |

### Self-service & deflection
| KPI | Definition | Default target band |
|---|---|---|
| KB article coverage of top intents | Top 50 intents with current article | 100% |
| KB-to-ticket ratio | KB views per ticket created | Trend up |
| Deflection rate | % support journeys resolved without human | 25–40% mature B2B |
| AI-assist acceptance rate | % suggested replies used by agent | Indicator of suggestion quality |

### People
| KPI | Definition | Default target band |
|---|---|---|
| Time-to-ramp | Hire → independent on tier-1 queue | Engagement-specific |
| Agent attrition | Annualized | < 25% |
| Agent CSAT distribution | Variance across agents | Tighten over time |

---

## 6. Internal workflow KPIs

| KPI | Definition | Default target band |
|---|---|---|
| Cycle time | Initiation → completion, p50 | Process-specific |
| Throughput | Cases completed per period | Process-specific |
| Exception rate | % cases hitting non-standard path | Engagement-specific |
| Rework rate | % cases revisiting earlier states | Trend down |
| Manual touch count | Avg. handoffs per case | Trend down |
| Automation coverage | % steps automated end-to-end | Process-specific |

---

## 7. IT infrastructure KPIs

### Reliability & DR
| KPI | Definition | Default target band |
|---|---|---|
| Tier-1 service availability | Per quarter | 99.95%+ |
| Last successful DR test | Days since last verified restore | ≤ 365 |
| RTO / RPO attainment in DR test | Actual vs. committed | 100% within commit |

### Security
| KPI | Definition | Default target band |
|---|---|---|
| Patch SLA — critical CVE | Time to deploy patch | ≤ 14 days |
| EDR coverage | % managed endpoints with EDR | > 95% |
| MFA coverage | All human accounts | 100% |
| Privileged accounts | Count and review cadence | Track + quarterly review |
| Failed login anomalies | Detected per month | Trend |

### Operations
| KPI | Definition | Default target band |
|---|---|---|
| CMDB accuracy | Spot-check accuracy rate | > 95% |
| Service desk first-touch resolution | % tickets resolved by L1 | > 60% |
| Change success rate | % changes with no rollback or incident | > 95% |

---

## 8. Digital transformation / Operational maturity KPIs

These are program-level KPIs the executive sponsor watches.

| KPI | Definition |
|---|---|
| Sponsorship engagement | Steering committee attendance and decisions made vs. deferred |
| Funding adherence | Multi-year commitment honored quarter over quarter |
| Capability maturity uplift | Maturity score per capability vs. baseline (per maturity ladder) |
| Adoption rate | Target users actively using new capability |
| Realized value | $ or KPI movement attributable to the program |
| Risk burndown | Open risks closed vs. opened, by severity |
| Roadmap predictability | % committed milestones delivered within ±2 weeks |
| Engagement health (eNPS / pulse) | Among teams in the path of change |

---

## 9. Anti-patterns when defining KPIs

- **Activity, not outcome.** "Trainings delivered" is activity. "% of agents using KB ≥ daily" is closer to outcome. "FCR rate" is outcome.
- **Vanity metric.** "Total tickets" tells you nothing without normalization (per customer, per channel, per intent).
- **No source of truth.** If three people would compute the same KPI three different ways, it's not a KPI yet.
- **Unbaselined target.** "Improve X by 50%" without a baseline is meaningless.
- **Too many KPIs.** A program with 40 KPIs has 0 KPIs. 8-15 is the working band for most programs.
- **Leading indicators only, no lagging.** You need both. Leading tells you if the work is happening; lagging tells you if it's working.
- **KPIs that nobody owns.** Every KPI has a single accountable role. If everyone owns it, nobody does.
