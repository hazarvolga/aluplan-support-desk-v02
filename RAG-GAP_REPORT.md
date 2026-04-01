# GAP Analysis Report: Aluplan Support Desk V02

## 1. Executive Summary
This report identifies critical and minor gaps in the current implementation of the Aluplan Support Desk project. The analysis covers backend architecture, AI/RAG reliability, CRM integration, frontend consistency, and overall production readiness.

## 2. Security Gaps

### [CRITICAL] Lack of CSRF Protection
- **Finding:** `main.ts` does not implement explicit CSRF protection (e.g., `csurf` or custom token validation).
- **Risk:** Vulnerability to Cross-Site Request Forgery on state-changing endpoints (tickets, users, settings).
- **Recommendation:** Implement cookie-based CSRF protection or ensure frontend strictly uses Bearer tokens (which it does) AND that the backend truly ignores cookies for authentication.

### [HIGH] Secret Exposure in Admin UI
- **Finding:** `CrmService.getAllConnections` decrypts `clientSecret` and `webhookSecret` for the response.
- **Risk:** Sensitive credentials visible in memory and network logs of the admin client.
- **Recommendation:** Return only masked versions (e.g., `****`) or existence flags unless explicitly requested for editing.

### [MEDIUM] Brittle Environment Variable Validation
- **Finding:** `configuration.ts` has fallbacks to `localhost` in production for some variables if missing.
- **Risk:** Deployment failure or unintended connection to local services if config is slightly misconfigured.
- **Recommendation:** Enforce strict presence of all required production variables without fallbacks.

## 3. Performance & Reliability Gaps

### [HIGH] CRM Sync Reliability (Fire-and-Forget)
- **Finding:** `CrmService.triggerSync` runs the sync process as a background task without using a robust job queue (BullMQ is available but not used here).
- **Risk:** Large syncs (thousands of records) could crash the process (OOM) or be lost if the server restarts.
- **Recommendation:** Refactor CRM sync to use BullMQ for better observability and retry logic.

### [MEDIUM] Database Load in Notification Broadcasts
- **Finding:** `NotificationsGateway.emitTicketCreated` fetches ALL non-customer users from the DB before emitting.
- **Risk:** High latency and DB load if the agent count grows.
- **Recommendation:** Use a dedicated Redis set or room for active agents instead of querying the DB on every event.

### [MEDIUM] Dynamics Adapter Resilience
- **Finding:** API calls in loops for pagination/sync lack explicit timeouts or per-request retries within the adapter logic.
- **Risk:** Hanging processes during network instability.
- **Recommendation:** Configure specific timeouts for Dynamics OData calls.

## 4. Functional Gaps

### [MEDIUM] "Smart Buffer" Consistency
- **Finding:** The logic for cancelling email notifications (`message_read` event) depends on a custom `jobId` (`msg-ntf-${messageId}`).
- **Risk:** If the enqueuing logic changes or the message ID format is altered, the cancellation will fail silently, leading to redundant emails.
- **Recommendation:** Centralize the `jobId` generation logic in a shared utility.

### [MEDIUM] Brittle FAQ Extraction Logic
- **Finding:** `FaqService` uses simple text heuristics (message length, "question"/ "answer" matching) to extract patterns.
- **Risk:** Low-quality or redundant FAQ entries being generated.
- **Recommendation:** Implement a specialized AI prompt to "Refactor to Q&A" before creating PENDING_REVIEW entries.

### [LOW] Frontend Role vs. Permission Usage
- **Finding:** Frontend `TicketDetailPage` and others use hardcoded role strings (`includes('customer')`) instead of checking specific permissions returned by `api.auth.me()`.
- **Risk:** UI may show buttons/data that the backend will block, or vice versa, causing UX friction.
- **Recommendation:** Implement a permission-based visibility helper in the frontend.

## 5. Production Readiness Checklist

### Infrastructure & Ops
- [ ] **S3 Configuration:** Verify `STORAGE_TYPE` is set to `S3` and credentials are valid in the target environment.
- [ ] **Redis Persistence:** Ensure Redis is configured with persistence (AOF/RDB) to save presence and queue states.
- [ ] **Ollama Resource Limits:** Set memory and timeout limits for Ollama to prevent it from starving the main application.

### Validation & Testing
- [ ] **E2E Stability:** Run `pnpm test:e2e` and verify all flows (Ticket cycle, CRM sync, KB search).
- [ ] **TR Support:** Validate `nomic-embed-text` accuracy with Turkish industry-specific terminology.
- [ ] **Secrets Audit:** Ensure `ENCRYPTION_KEY` is rotated and stored in a secure vault (not just `.env`).

### Functional Verification
- [ ] **SLA Monitor:** Manually trigger an SLA breach and verify managers receive both DB and Socket notifications.
- [ ] **Smart Read:** Verify reading a message in chat within 60 seconds cancels the scheduled notification email.
