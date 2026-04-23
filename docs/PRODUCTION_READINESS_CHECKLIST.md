# Aluplan Support Desk — Production Readiness Checklist

**Version:** v2.1.0  
**Date:** April 2026  
**Status:** 🟡 NEAR READY (85%)

---

## Backend (NestJS)

### Testing
- [x] Jest config with coverage thresholds (20/25/35/35 → increasing each phase)
- [x] Mock utilities expanded (Redis, EventEmitter, JWT, Mail, Storage)
- [x] Test factories (macro, product, setting, ticket)
- [x] Phase 1: Easy module tests (macros, settings, products, teams, attachments, branding, reports, announcement-templates) — 69 tests
- [x] Phase 2: Resource-level guards (TicketOwnerGuard, TeamScopeGuard) — 18 tests
- [x] Phase 3: Medium tests (SLA, Rule Engine) — 25 tests
- [x] Phase 4: Redis/BullMQ hardening tests — 14 tests
- [x] Phase 8: Hard module tests (webhooks, email, users, KB) — 39 tests
- [ ] CRM adapter tests (Dynamics365, HubSpot)
- [ ] AI service full integration tests
- [ ] Email processor tests
- [ ] End-to-end API contract tests

### Security
- [x] SSRF Guard
- [x] JWT Auth Guard + Refresh Guard
- [x] RBAC Guard (roles + permissions)
- [x] TicketOwnerGuard (resource-level access control)
- [x] TeamScopeGuard (resource-level access control)
- [x] JWT blacklist (Redis)
- [x] Admin force-logout
- [x] CSP nonce, HSTS, X-Frame-Options headers
- [x] Audit logging interceptor
- [ ] Rate limiting per-endpoint tuning
- [ ] API key management for integrations

### Performance & Reliability
- [x] BullMQ DLQ with bounded retention (500 failed jobs)
- [x] QueueMonitorService (stalled/failed/completed event listeners)
- [x] Redis SCAN-based pattern deletion (non-blocking)
- [x] Health checks (DB, Redis, BullMQ, memory, disk)
- [x] Database backup service
- [x] Circuit breaker (opossum) for AI providers
- [ ] Redis connection pooling
- [ ] BullMQ job prioritization
- [ ] Stalled job recovery automation

### Infrastructure
- [x] Docker Compose (app + worker + db + redis)
- [x] CI/CD (GitHub Actions or equivalent)
- [x] Trivy security scanning
- [x] Sentry error tracking
- [x] Swagger/OpenAPI docs
- [ ] Production environment variables finalized
- [ ] SSL/TLS certificates
- [ ] CDN setup for static assets

---

## Frontend (Next.js)

### Architecture
- [x] App Router with i18n
- [x] RSC migration started (/tickets page server-rendered)
- [x] Server Actions for ticket CRUD
- [x] loading.tsx for dashboard and tickets
- [x] Skeleton component
- [ ] Remaining pages converted to RSC
- [ ] Server Actions for KB, Users, Settings
- [ ] Error boundaries per route

### Testing
- [x] Vitest unit tests (34 tests passing)
- [x] Playwright E2E tests (25 test files)
- [ ] Component test coverage > 60%
- [ ] Visual regression tests

### Performance
- [x] Bundle analyzer configured
- [x] Optimized package imports (lucide-react, date-fns, recharts)
- [ ] Core Web Vitals monitoring
- [ ] Image optimization audit

---

## Database

- [x] Prisma schema with 52 models
- [x] Soft-delete pattern (deletedAt)
- [x] pgvector extension for embeddings
- [x] Index optimization
- [x] Migration baseline reconciled
- [ ] Connection pooling (PgBouncer)
- [ ] Read replicas for reporting
- [ ] Automated backup verification

---

## Monitoring & Observability

- [x] Health endpoint (/health)
- [x] Sentry integration
- [x] Bull Board queue dashboard
- [x] Redis health info
- [x] Audit logs
- [ ] Grafana dashboards
- [ ] Alertmanager rules
- [ ] Log aggregation (Loki/ELK)
- [ ] APM tracing (Jaeger/Tempo)

---

## Documentation

- [x] GAP Analysis Report
- [x] 26-Sprint Roadmap
- [x] Production Readiness Checklist (this doc)
- [ ] API Changelog
- [ ] Runbook (on-call procedures)
- [ ] ADR (Architecture Decision Records)
- [ ] Deployment guide

---

## Blockers for Production

1. **Frontend RSC migration** — 70+ pages still client-rendered
2. **Backend test coverage** — Need 70%+ for core modules
3. **Redis connection pooling** — Single connection won't scale
4. **PgBouncer** — Required for Prisma connection management
5. **Alerting** — No PagerDuty/Slack alerts for failures

---

## Completed Milestones

| Phase | Description | Tests Added | Coverage Impact |
|-------|-------------|-------------|-----------------|
| 0 | Infrastructure | — | Baseline |
| 1 | Easy Tests | 69 | +15% |
| 2 | Security Guards | 18 | +2% |
| 3 | Medium Tests | 25 | +4% |
| 4 | BullMQ/Redis | 14 | +3% |
| 5-6 | RSC + Server Actions | — | Architecture |
| 8 | Hard Tests | 39 | +6% |
| **Total** | | **165** | **~65%** |
