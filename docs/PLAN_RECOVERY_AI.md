## 🎼 Orchestration Report: AI Response & Database Sync Fix

### Task
Analyze and resolve the "No AI response" issue. 
Findings:
1. **xAI Billing Issue:** Log shows HTTP 403: "Your newly created team doesn't have any credits or licenses yet."
2. **Migration Not Applied:** `knowledge_articles.source` error persists, meaning the pushed migration hasn't successfully executed on the production DB.
3. **API Key Validation:** Successfully reached xAI (no more prefix error), but rejected due to lack of funds.

### Mode
plan / execution

### Agents Invoked (MINIMUM 4)
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | `project-planner` | Refine recovery strategy for credits and deployment. | ✅ |
| 2 | `database-architect` | Verify migration execution and manual deployment steps. | ⏳ |
| 3 | `devops-engineer` | Audit Coolify startup commands (migrate vs deploy). | ⏳ |
| 4 | `backend-specialist` | Add error handling for "Insufficient Credits" in UI. | ⏳ |
| 5 | `debugger` | Correlate `Prisma` errors with AI draft failures. | ⏳ |

### Proposed Changes

#### packages/database
- Run `prisma migrate dev --name add_source_to_knowledge_articles --create-only` to sync migrations with schema.
- Commit the new migration.

#### apps/backend/src/ai/generic-openai.service.ts
- Add validation to check if the API key matches the provider (e.g., `xai-` for xAI, `gsk-` for Groq).
- Throw a clear error if they don't match.

### Verification Plan
- Run `pnpm --filter @aluplan/backend build` to ensure no code issues.
- Run `prisma migrate status` (after manual sync) to verify DB state.
- Push changes and ask user to Redeploy + Correct API Keys.
