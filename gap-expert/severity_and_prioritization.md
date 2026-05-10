# Severity Classification & Prioritization

Two distinct dimensions:
- **Severity** is a property of a *gap*. It describes how bad the gap is on its own merits.
- **Priority** is a property of a *recommendation in a program*. It describes when you should act, given severity, dependencies, effort, and risk.

A Critical gap may be Phase-2 priority because it depends on something else. A High gap may be Phase-1 priority because fixing it unlocks five other improvements. Don't conflate them.

---

## 1. Severity rubric

### 1.1 Critical

A gap is **Critical** when at least one of the following is true:

- **Regulatory / legal exposure** — Active or near-term violation of a binding regulation (GDPR, HIPAA, PCI-DSS, SOX, KVKK, sector-specific). The penalty path is mapped or mappable.
- **Data security / privacy** — Active risk of unauthorized access to personal data, payment data, or commercially sensitive data. Includes credentials in source, broken access controls, missing encryption for sensitive data at rest in production.
- **Business continuity** — A single, identifiable failure mode would take a tier-1 system offline with no tested recovery path.
- **Revenue concentration** — A single point of failure (vendor, person, contract, system) directly threatens material revenue if it fails.
- **Customer trust** — An active, observable issue that will measurably degrade customer NPS / churn within 1-2 quarters if untreated.
- **Safety** — Anything affecting physical safety (rare in software, common in operational tech).

A Critical finding must compound if untouched for 30-90 days. If untreated, it gets worse, not just stays the same.

**Examples**
- "Production database has no off-region backup; the last successful restore test was 2 years ago."
- "API keys for the payment processor are in a public-readable internal wiki."
- "Single engineer holds the only knowledge of how to deploy the billing service; she's giving notice."
- "GDPR data subject access requests are not being honored within the legal 30-day window."

**Non-examples (these are NOT Critical)**
- "Documentation is outdated" — usually Medium/High depending on impact.
- "Tech debt in module X" — doesn't meet the bar without specific business consequence.
- "We should be on Kubernetes" — almost never Critical and almost never the actual problem.

### 1.2 High

A gap is **High** when:

- It causes significant, ongoing operational pain (toil, delays, customer friction) that *measurably* degrades a business KPI
- It blocks an explicitly stated business objective with a near-term deadline (next 1-2 quarters)
- It accumulates technical or organizational debt at a pace that will become Critical within 12 months
- It exposes the organization to elevated, but not imminent, risk
- It compounds over time if not addressed

**Examples**
- "Deploy lead time of 11 days is throttling feature velocity at the worst possible moment competitively."
- "Support FCR is 38% vs. industry benchmark 65%, driving 0.7 points of additional monthly churn."
- "On-call rotation is unsustainable; 3 of 8 engineers have signaled burnout in last 30 days."
- "ERP customizations have not been migrated through last two upgrades; vendor support marginal."

### 1.3 Medium

A gap is **Medium** when:

- It produces measurable but bounded inefficiency
- It is a deviation from professional practice without near-term business consequence
- It will likely become a problem in 12-24 months but not before
- It limits optionality without blocking current strategy

**Examples**
- "ADRs are not consistently maintained; new engineers spend extra time understanding architectural decisions."
- "Knowledge base coverage is partial; agents handle longer ramp-up than benchmark."
- "Dependency upgrade cadence is irregular; major-version drift is accumulating."

### 1.4 Low

A gap is **Low** when:

- It's hygiene rather than impact
- It's worth recording but not worth funding a project to fix in isolation
- It will likely be resolved as a side-effect of fixing higher-severity gaps
- It's a "nice to improve" — quality of life rather than business outcome

**Examples**
- "Internal Confluence has stale pages from 2021."
- "CI runner naming convention is inconsistent."
- "Some dashboards have no description field populated."

### 1.5 Severity discipline

- If you find yourself with > 30% of gaps marked Critical, the analysis is overheated. Re-examine.
- If you find < 5% of gaps marked Critical or High in a real engagement, the analysis is too soft. Re-examine.
- A typical mid-engagement distribution: ~10% Critical, ~30% High, ~45% Medium, ~15% Low. Adjust to context.
- Severity must be defensible in front of an audit committee. If you can't articulate the consequence in one sentence, it's not Critical.

---

## 2. Prioritization model

Severity tells you how bad. Priority tells you what to do first. Use these dimensions:

### 2.1 Value
The size of the business impact addressed if the gap is closed. Pull from §7 of the report.

### 2.2 Effort
Engineering + operational effort to deliver the fix. Default scale:

| Band | Definition |
|---|---|
| S (Small) | ≤ 2 weeks elapsed, single team |
| M (Medium) | ≤ 2 months elapsed, single or two teams |
| L (Large) | ≤ 6 months elapsed, cross-team |
| XL (Extra Large) | 6+ months, multi-team or organizational change |

Adjust the bands at the engagement scale; for a small startup, M might be 4 weeks instead of 8.

### 2.3 Execution risk
How likely the fix is to fail or stall. Drivers:
- Dependency depth (more dependencies → higher risk)
- Vendor or external dependency
- Skills gap on the team
- Change-management complexity
- Concurrent demands on the same teams

### 2.4 Dependency order
What this fix unlocks, and what must come before it. A gap with three downstream unlocks is structurally more important than its severity alone suggests.

### 2.5 The composite ranking

Sort by:
1. Critical with low dependency depth → Phase 1
2. High with high downstream-unlock value → Phase 1 or early Phase 2
3. Critical with deep dependency chain → flag the dependency as Phase 1, fix the Critical in Phase 2
4. High / Medium with low effort → opportunistic, slot wherever capacity allows
5. Low → backlog or fix-as-you-go

Annotate every recommendation with: severity addressed, effort band, primary dependency, expected unlock value.

---

## 3. Worked example

Suppose you have these gaps:

| ID | Severity | Effort | Depends on | Unlocks |
|---|---|---|---|---|
| GAP-A | Critical | XL | GAP-B | (terminal) |
| GAP-B | High | M | — | GAP-A, GAP-C, GAP-D |
| GAP-C | High | S | GAP-B | (terminal) |
| GAP-D | Medium | S | GAP-B | (terminal) |
| GAP-E | Critical | S | — | (terminal) |
| GAP-F | Low | XL | — | (terminal) |

**Naive sort by severity** would put GAP-A and GAP-E first, ignoring that GAP-A can't start until GAP-B is done. It would also bury GAP-B, which is the highest-leverage move.

**Composite ranking:**

1. **GAP-E** — Critical, small effort, no dependency. Do immediately.
2. **GAP-B** — High severity, but unlocks three other gaps including a Critical. Effectively the highest-leverage move in the program. Do in Phase 1.
3. **GAP-C, GAP-D** — Small follow-ons after GAP-B. Phase 1 tail or early Phase 2.
4. **GAP-A** — Critical but XL effort and dependent on GAP-B. Phase 2.
5. **GAP-F** — Low and XL. Likely never, or absorbed into a future modernization.

This is the kind of sequencing logic the report should make visible. It is also exactly the kind of insight that distinguishes a real GAP analysis from a list of complaints sorted by adjective.

---

## 4. Communicating prioritization in the report

In §8 (Prioritized Recommendations), include a small narrative paragraph explaining why the ordering is what it is. Don't make the reader reverse-engineer the logic from the table. Two or three sentences identifying the critical-path move and the highest-leverage early action are usually enough.

In §9 (Roadmap), each phase has its own table. The cross-references via REC and GAP IDs make it traceable. Sequencing logic that doesn't fit cleanly in tables goes in §9.4 (Critical-path & sequencing notes).
