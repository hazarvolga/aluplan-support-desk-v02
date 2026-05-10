# Questioning Playbook

A GAP analysis is only as good as the information it's built on, and you will rarely have everything you need on turn one. This playbook governs *what* to ask, *how many* questions to ask, and *when not to ask*.

---

## 1. Operating principles

**Ask less, ask better.** A pile of low-leverage questions exhausts the user and signals you're not paying attention. Pick the questions whose answers would most change the analysis.

**Bundle, don't drip.** One organized message with grouped questions beats a sequence of small clarifications. Group by theme; mark blockers vs. nice-to-have.

**Never ask what you can reasonably infer.** If the user pasted code, infer the stack from the code. If they pasted an org chart, infer team structure from it. Ask about what the artifact *can't* tell you.

**Treat "just proceed" as a real answer.** If the user says proceed without answering, do it — but capture every assumption in the report's Assumptions section so they can challenge specific ones.

**Ask in the user's language.** If they wrote in Turkish, ask in Turkish. The report itself can follow the same rule (see SKILL.md multilingual note).

**Hard cap: 8 questions per round, 10 in extreme cases.** If you genuinely need more, do a partial analysis with explicit assumptions, then ask the next round based on what surfaced.

---

## 2. The seven question themes

Most engagements need a subset of these themes. Pull what's relevant; skip what isn't.

### 2.1 Scope & audience
- What systems / processes / teams are in scope, what's deliberately out, and what's adjacent?
- Who is the primary audience for the report (board / CIO / CTO / VP eng / ops director / PM / external)?
- What decision is this analysis supposed to inform?

### 2.2 Time horizon & constraints
- What's the time horizon the program needs to plan against (90 days / 12 months / 24 months)?
- Is there a budget envelope or FTE constraint we should respect?
- Are there regulatory regimes that bind us (GDPR, HIPAA, PCI, SOX, KVKK, sector-specific)?
- Any vendor lock-ins, parent-company mandates, or M&A context that constrain options?

### 2.3 Current state — capability evidence
- What is currently working well that we should not disrupt?
- What is the most painful current symptom from the user's perspective?
- What evidence exists — metrics, dashboards, incident logs, tickets, retros — that we can use as ground truth?

### 2.4 Target state — what "good" means here
- What does success look like in 12 months? In 24?
- Are there explicit objectives (OKRs, board commitments) the program must support?
- Is there a benchmark organization or competitor whose state you'd consider directionally correct?

### 2.5 People & operating model
- Team size, structure, and key roles?
- Where are the skill gaps the user is already aware of?
- What's the change-management posture — is the org used to transformation, or is this their first?

### 2.6 Technology & data
- What's the current stack at a high level?
- What's the data architecture — systems of record, integration model, analytics platform?
- What are the platform / vendor decisions that are explicitly off the table for change?

### 2.7 Risk & governance
- What risks is leadership most worried about?
- What governance structure exists for technology / process decisions?
- Has there been a recent audit, incident, or near-miss that's shaping priorities?

---

## 3. Question selection by domain

### Software systems / SaaS
Ask first: scope, current architecture (one-paragraph or diagram), tier-1 services, team structure, top customer pain points, current SLO posture if any.

Skip: detailed code-level questions on round 1 — those come after the lens picks the focus area.

### DevOps
Ask first: DORA-equivalent metrics if measured, deployment process, infra ownership, on-call model, top incident themes from last quarter, IaC coverage.

Skip: tool-by-tool inventory — get it from a follow-up if it matters.

### AI/ML systems
Ask first: use case (the actual task), current solution if any, evaluation method, data source and access pattern, governance status, cost target.

Critical question if not stated: **what task is the AI doing, in plain language?** Most AI engagements stall because this isn't crisply defined.

### ERP/CRM
Ask first: which platform and version, modules in use, customization extent, integration model, master data ownership, key business processes most affected.

Skip: feature-level configuration questions on round 1.

### Customer support
Ask first: ticket volume / channel mix, SLA definitions and current attainment, top 5 intents, agent count and structure, knowledge base existence, current AI/automation footprint.

### Internal workflows
Ask first: which workflow(s) specifically, current tooling, who owns it, throughput / cycle time if known, exception rate, integration points.

### IT infrastructure
Ask first: scale (servers, sites, users), regulated or not, DR/BCP posture, last security audit, on-prem vs. cloud mix, IAM model.

### Digital transformation / Operational maturity
Ask first: what's already been tried, sponsorship structure, funding model, target operating model if articulated, KPIs leadership uses today, recent transformation history (success/failure pattern).

---

## 4. The bundling format

When asking, format the questions like this so the user can scan and answer in one pass:

```
To produce a defensible analysis I need a few inputs. Marked which are blockers vs. nice-to-have — feel free to skip the latter or write "n/a".

**Scope & audience** (blocker)
1. Who is this report for, and what decision will it inform?
2. What's in scope and what's deliberately out?

**Current state evidence** (blocker)
3. Top 1-2 symptoms / pain points from the user's perspective?
4. Any metrics or evidence we can use as baseline (DORA, ticket volume, incidents)?

**Target & constraints** (nice-to-have)
5. Time horizon for the program?
6. Budget / FTE envelope, even rough?

**Operating context** (nice-to-have)
7. Team size, structure, key skill gaps?
8. Any vendor / regulatory / M&A constraints we should respect?

If you'd rather I proceed with assumptions on any of these, just say so — I'll capture every assumption in the report so you can challenge them.
```

Why this format works:
- Themed, so the user can scan
- Blocker vs. nice-to-have so they know what to prioritize
- Numbered so they can reply by number
- Explicit invitation to skip — reduces friction

---

## 5. The "just proceed" path

If the user replies with any of: "just proceed," "you decide," "make assumptions," "do your best," "skip the questions" — do exactly that.

Process:
1. Make the most plausible assumption per skipped question.
2. Capture every assumption in §2.4 of the report (Assumptions table).
3. Mark which findings would change if the assumption is wrong.
4. List the questions still open in §13 (Open Questions) so the user can answer them later if they want a refined version.

This protects the analysis from collapsing into hand-waving while respecting the user's time.

---

## 6. Anti-patterns to avoid

- **The kitchen sink** — 30 questions on turn one. The user disengages.
- **The trick question** — asking something only to demonstrate that the user doesn't have an answer ("Do you have SLOs?"). Just assess the absence as a finding.
- **The leading question** — "Don't you think you should be on Kubernetes?" That's not analysis; that's selling.
- **The redundant question** — asking what's already in the artifacts they shared. Re-read first.
- **The passive question** — "Maybe consider whether…" Be direct.
- **Round 2 with no progress** — if you must ask a second time, the second round must be tighter and grounded in something specific from the first response.

---

## 7. Mid-analysis questions

It's legitimate to discover during Phase 5 (root cause) or Phase 6 (impact) that you need a specific data point you didn't ask for upfront. Don't pretend you didn't notice. Ask, briefly:

> "To sharpen the impact estimate on GAP-OPS-014 I'd want one number: roughly what % of P1 incidents in the last quarter were caused by the integration layer? If you don't have it, I'll proceed with a defensible estimate band."

One question, scoped, tied to a specific finding, with an explicit fallback. Easy to answer or deflect.
