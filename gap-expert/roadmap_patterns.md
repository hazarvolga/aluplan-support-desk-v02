# Roadmap Patterns

A roadmap is the part of the report most likely to be wrong, and most likely to be acted on. It deserves more thinking time than the gap inventory. This file gives the patterns and the discipline.

---

## 1. The default phasing

Use this phasing unless the engagement clearly calls for something else:

### Phase 1 — Stabilize (0-90 days)

**Objective:** Stop the bleeding. Eliminate Critical risk. Establish the measurement baseline that the rest of the program will be judged against.

Phase 1 is not for ambitious work. It's for buying the right to do ambitious work in Phase 2. Three kinds of items belong here:

1. **Critical risk reduction** — The Critical-severity gaps that don't depend on Phase 2 capabilities.
2. **Measurement & instrumentation** — You can't manage what you can't see; if KPIs are unbaselined, Phase 1 baselines them.
3. **Foundational ownership clarity** — Service ownership, on-call structure, decision rights. These are usually small in effort and disproportionately large in unlock value.

What does *not* belong in Phase 1:
- Architecture rewrites
- Tool migrations that don't address Critical risk
- "Quick wins" that aren't actually wins (cleaning up Confluence pages, etc.)
- AI / automation pilots — those need Phase 1 foundations to land safely

### Phase 2 — Modernize (3-9 months)

**Objective:** Structural fixes. Pay down the debt that limits velocity. Move from the current platform/process state toward the target state.

This is where most of the engineering and operational lift happens. Common Phase 2 themes:

- Platform / IaC consolidation
- Test automation & CI/CD modernization
- Observability platform consolidation
- Data architecture modernization (system of record clarity, integration platform)
- Process redesign (incident response, change management, on-call)
- Documentation & knowledge management as a function, not a side-effect
- Security posture lifts (IAM, secrets, vulnerability management, supply chain)

### Phase 3 — Scale & differentiate (9-24 months)

**Objective:** Apply the foundation laid in Phase 2 to capabilities that change the unit economics or open new strategic options.

This is where AI, automation, advanced analytics, and platform-as-a-product belong — *only* once Phase 2 has produced the foundation they need. Trying to do Phase 3 work without Phase 2 plumbing is the most common failure mode in tech transformations.

Common Phase 3 themes:
- AI deflection / co-pilots in the right places (not everywhere)
- Workflow automation at scale
- Self-service platform with adoption metrics
- Advanced analytics / data products
- Multi-region / cell-based architecture
- Internal platform-as-a-product with named customer success

---

## 2. When to deviate from default phasing

Adapt phasing when:

- **The user already has a stable foundation.** A mature engineering org doesn't need Phase 1; lead with Phase 2.
- **There's a regulatory deadline** — Phase 1 must include the regulatory work even if it's structurally Phase 2; risk-weight wins.
- **The engagement is narrowly scoped** — A 6-week support-deflection PoC is not three phases; it's one phase with milestones.
- **The horizon is short** — A 90-day engagement collapses Phase 1 + 2; flag explicitly that Phase 3 work is out of scope.
- **The engagement is huge** — A 36-month program may need Phase 0 (operating model design) before Phase 1 lifts.

When you deviate, *say why* in §9.4 of the report. The reader needs to understand the logic.

---

## 3. Sequencing logic

Phasing is the macro structure. Within and across phases, sequencing decisions determine whether the program succeeds or stalls.

### 3.1 Critical-path identification

For the program as a whole, identify the longest dependency chain from "today" to "Phase 3 unlocks delivered." That chain is the critical path. Every workstream on the critical path must be:

- Funded
- Owned by a named role (not "the platform team in general")
- Tracked weekly at minimum
- Protected from competing priorities

Workstreams *not* on the critical path are the budget for absorbing surprises.

### 3.2 Dependency types

| Type | Example |
|---|---|
| Capability dependency | Can't deploy AI evaluation until logging is in place |
| Skill dependency | Can't run K8s in prod until two engineers are trained |
| Data dependency | Can't measure deflection until ticket tagging stabilizes |
| Vendor dependency | Can't migrate until contract amendment is signed |
| Decision dependency | Can't pick a target architecture until M&A decision lands |
| Funding dependency | Can't begin Phase 2 until budget cycle approves |

In the roadmap table, dependencies are not optional fields. Each item has its dependencies named, with a note on whether they're internal or external (external = harder to control).

### 3.3 Parallelization

Things you can do in parallel — flag explicitly. Phase 1 commonly has 3-4 parallel tracks that can run independently:

- Risk reduction (Critical gaps)
- Measurement (KPI baselining)
- Ownership (service registry, RACI)
- Quick procurement (any vendor decisions on the critical path of Phase 2)

Things you must *not* parallelize:
- Two architectural changes affecting the same system
- A migration and a feature push on the same team

### 3.4 The "first 30 days" view

Even with a 24-month roadmap, executive sponsors usually want a clear answer to: *what are we doing in the next 30 days?*

Include a short subsection (or annotated table row) that lists the first 30-day moves, by name, with named owners. This is usually 3-7 items. It's the difference between a roadmap that gets approved and a roadmap that gets revised.

---

## 4. Roadmap anti-patterns

- **The Christmas tree.** Every gap becomes a roadmap item. The roadmap collapses under its own weight. Be selective — Lows generally don't earn a roadmap row.
- **All Phase 1, no Phase 2/3.** A program of "stabilize forever" never delivers strategic value. If you can't see Phase 2/3 yet, say so and describe what would unlock the view.
- **All Phase 3, no Phase 1.** Plenty of "AI strategies" with no foundation. The report should say so plainly.
- **Time-boxed by calendar, not by capability.** "3 months for X" because it's tidy, not because it's true. If something is genuinely a 5-month effort, don't squeeze it into a quarter; say 5 months.
- **No owners.** Workstreams without owners drift. Always assign an owner role (not necessarily a person — but a role accountable for the outcome).
- **No exit criteria per phase.** Phase 1 must have a definition of done that an outsider could verify. Same for Phase 2. If you can't write the definition of done, the phase isn't designed yet.
- **Linear illusion.** Real programs replan at quarterly checkpoints. Note this explicitly: the roadmap is a current best plan, not a contract.

---

## 5. Communicating the roadmap

In §9 of the report:

- One table per phase
- Workstreams as rows; not individual tasks
- Each row: deliverable, source RECs, owner role, dependencies, success signal
- Below the tables, §9.4 has prose: critical path, parallelization decisions, the "first 30 days" view, and exit criteria per phase
- A simple Gantt-style visualization is fine if the user has tooling for it; it's not required for a markdown report

What to avoid:
- Decorative roadmap visuals that don't add information
- Tasks at the JIRA-ticket level (this is a strategy document, not a backlog)
- Vague workstream names ("Improve operations") — name the deliverable

---

## 6. Worked example — phasing logic for a typical mid-size SaaS engagement

Engagement: Support operations of a 200-person B2B SaaS, 80 customers, 14 support agents.

**Phase 1 (0-90 days) — Stabilize and baseline**

| Workstream | Why Phase 1 |
|---|---|
| Tagging taxonomy redesign + retroactive cleanup | Without it, every other measurement is unreliable |
| FCR & CSAT baselining | These KPIs must exist before targets are set |
| Top-50 intent KB coverage audit + gap-fill | Cheap, fast, measurable |
| Service ownership for product-side dependencies | Today escalations land in the wrong inbox |
| Critical: SLA breach in enterprise tier — name root cause and immediate mitigation | Critical-severity, customer-trust |

**Phase 2 (3-9 months) — Modernize**

| Workstream | Why Phase 2 |
|---|---|
| Workforce model redesign | Requires Phase 1 baseline data |
| Coaching cadence + QA framework | Requires CSAT + FCR baselines |
| Knowledge management as a function (steward, audit cadence) | Builds on Phase 1 KB work |
| Customer-tier-aware routing | Requires tag taxonomy from Phase 1 |
| Engineering-side deflection (bug triage, status pages) | Cross-team, longer effort |

**Phase 3 (9-18 months) — Scale**

| Workstream | Why Phase 3 |
|---|---|
| AI deflection on top-N intents (target 35% deflection) | Requires KB stewardship + tag accuracy + baseline measurement, all from earlier phases |
| Predictive workforce planning | Requires multiple quarters of clean data |
| Self-service expansion: in-app support flows for top 5 intents | Requires product partnership formed in Phase 2 |
| Voice-of-customer feedback loop into product roadmap | Cultural / structural change; needs sustained sponsorship |

**Why this ordering:**
- AI deflection is the deliverable the sponsor most wants. It lives in Phase 3 because it depends on tag accuracy (Phase 1) and KB stewardship (Phase 2). Trying it in Phase 1 produces a deflection bot fed by stale articles measured against an unreliable baseline — a guaranteed failed pilot.
- Phase 1's "boring" work (taxonomy, KB audit, SLA breach root-cause) is the highest-leverage work in the program; it's just not the most exciting.

This is the kind of sequencing reasoning the §9.4 prose should make explicit.
