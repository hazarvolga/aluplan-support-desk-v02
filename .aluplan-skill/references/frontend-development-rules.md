# Frontend Development Rules

Read this when writing or modifying anything under `apps/frontend/`. Canonical conventions from `CLAUDE.md` §6 + observed code.

## 1. Stack

- **Next.js 15 App Router**, port 3000.
- **TypeScript strict.**
- **`@/` alias** → `apps/frontend/src/`.
- **next-intl** for routing + i18n.
- **Zustand** for client state (`src/stores/`).
- **TanStack Query is NOT used.** Server data flows from **Server Components and route handlers** — this is a deliberate architectural choice.
- **Radix UI primitives + Tailwind** + shadcn-style components in `src/components/ui/`.
- **`sonner`** for toasts (`toast()`).
- **`react-hook-form` + Zod** for forms.
- **Socket.io client** for real-time (`src/lib/socket.ts`) — including streaming AI responses. **Not SSE.**

## 2. Route layout

```
apps/frontend/src/app/[locale]/
├── (auth)/             register, reset-password, verify-email
└── (dashboard)/        all authenticated screens
    ├── dashboard/
    ├── tickets/, tickets/[id]/
    ├── knowledge-base/, knowledge-base/[id]/
    ├── knowledge-pool/, knowledge-pool/upload/
    ├── faq/, faq-learning/
    ├── kb-approvals/
    ├── customers/, customers/crm/, customers/[id]/
    ├── teams/, teams/agents/, teams/departments/
    ├── products/
    ├── admin/
    │   ├── ai-health/            AI Health & Telemetry
    │   ├── ai-intelligence/      AI Strategic Intelligence
    │   ├── announcements/
    │   ├── email-validation/
    │   ├── emails/
    │   └── settings/
    ├── settings/
    ├── users/
    └── system-topology/
```

`[locale]` is the i18n segment. `(auth)` and `(dashboard)` are route groups with shared layouts.

## 3. Routing — use next-intl

```typescript
// Correct
import { Link } from '@/i18n/routing';
<Link href="/tickets">Tickets</Link>

// Incorrect
import Link from 'next/link';
```

`next/link` does not respect the locale prefix. Always import the wrapped `Link` from `src/i18n/routing.ts`.

## 4. i18n

- Locales: **`tr` (default)**, `en`, `de`. User preference is persisted server-side on `User.language`.
- Strings live in `apps/frontend/messages/{tr,en,de}.json`.
- Run `pnpm i18n:check` before broad UI text changes — it verifies parity between locales.
- **German has known gaps** (AGENTS.md) — surface this when proposing German-text work.
- The **Turkish UI should receive Turkish AI fallback/copy** whenever the locale or query is Turkish.
- **No hardcoded user-facing strings in components.** Use `t()` with context: `t('tickets.actions.escalate')`, not `t('escalate')`.
- Plurals via ICU MessageFormat.
- Dates and numbers via `Intl.DateTimeFormat` / `Intl.NumberFormat` with the user's locale.

## 5. State

| State type | Where it lives |
|---|---|
| Server data | Server Components, route handlers, `(dashboard)/actions.ts` |
| Client state | Zustand in `src/stores/` (per-feature stores) |
| Form state | `react-hook-form` + Zod resolver |
| Real-time data | Socket.io events → state via store updates |

**Do not install or use TanStack Query** — the architecture is built around Server Components for reads. Mixing in TanStack Query creates two sources of truth for server data.

## 6. Server Actions

`apps/frontend/src/app/[locale]/(dashboard)/actions.ts` is the shared server action hub for dashboard routes. Mutations go through these server actions, which call the backend API.

## 7. Components — Radix + Tailwind + shadcn-style

- Design-system primitives in `src/components/ui/`.
- Compose from Radix primitives (`@radix-ui/react-*`) styled with Tailwind.
- Class composition via `cn(...)` utility (shadcn convention).
- **No inline styles for visual tokens** — colors, radii, shadows come from the design system.

## 8. Toasts

```typescript
import { toast } from 'sonner';

toast.success('Bilet oluşturuldu');
toast.error('Eşleme başarısız');
```

`toast` is a high-blast-radius hook (AGENTS.md). Do not replace or wrap it; do not introduce a competing notification system.

## 9. Real-time — Socket.io

`src/lib/socket.ts` wraps the Socket.io client. WebSocket events from the backend follow `<DOMAIN>_<ACTION>_<OUTCOME>` naming:

```
AI_QUERY_COMPLETED
AI_QUERY_FAILED
NOTIFICATION_NEW
TICKET_UPDATED
```

Subscribe via a hook or provider; do not access the raw socket from components. Components update Zustand state in response to events; UI re-renders from state.

**Streaming AI responses also use WebSocket**, not SSE.

## 10. Middleware

`apps/frontend/middleware.ts`:
- `next-intl` middleware (locale negotiation).
- CSP nonce generation (sets `x-nonce` header) — used by inline scripts that require nonce.
- Auth gating for `(dashboard)` group.

When adding middleware behavior, append rather than replace — locale + nonce + auth are all required.

## 11. Forms

```typescript
const form = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
});
```

- Zod schema lives in `packages/shared-schemas/` when the same schema is consumed by backend DTOs.
- Disable submit during in-flight mutation.
- Use Server Actions for submission, not direct `fetch` to backend (which would lose the action's progressive-enhancement properties).
- Preserve draft state in `localStorage` for long-form inputs (ticket reply composer, internal notes) — agents lose work to refreshes.

## 12. Rich text — TipTap

The ticket detail uses a **TipTap rich reply composer** for admin/customer replies (Phase 1 Rich Message Composer, `.ai/current-focus.md`):

- Message history and ticket descriptions render through a **safe rich/plain renderer** — detects legacy plain text safely.
- AI Copilot markdown drafts are converted into **sanitized HTML** before insertion.
- Backend accepts `contentFormat: HTML` only for ticket message bodies and applies **strict allowlist sanitization**.
- **No Prisma migration** for this MVP — sanitized HTML stored in the existing message field.

XSS smoke must remain green: `<script>`, `onerror`, `javascript:` links must not persist or execute.

## 13. AI suggestions in the UI

When presenting an AI-generated answer to the agent or customer:

- **Confidence badge** prominent — color-coded (HIGH green / MEDIUM amber / LOW orange / NO_MATCH gray) with a label, not just a number.
- **5-section markdown structure** rendered through the safe renderer (the `## 📌`, `## 🎯`, `## ⚠️`, `## 🛠️`, `## ✅` shape from the AI answer contract).
- **Sources shown to agents only** — customer UI follows R-S5 (customer-audience content only).
- **`suggestTicket: true` → ticket creation primary action.** Do not bury this behind extra clicks when confidence is low.
- **Edits are tracked.** If the agent modifies the suggestion before sending, the backend records `editedResponse` on `AiInteraction`.
- **`languageMismatch` → UI hint** that the answer language couldn't fully match the query language.

Never hide the AI's confidence. The agent is the accountable party; the UI must make accountability possible.

## 14. Customer dashboard 403 cleanup (operational note)

The customer/viewer dashboard **does not** call admin-only endpoints (`.ai/current-focus.md`):
- Customer pages don't call `/ai/health-metrics` — that's admin-only.
- Role-aware data loading is the rule. Do not call admin endpoints from customer pages "just in case the user is admin" — let the role gating in the route group handle visibility.

## 15. Loading, error, empty states

Every data-driven component handles four states explicitly:

1. **Loading** — skeleton matching final layout (no centered spinners that cause CLS).
2. **Error** — friendly message + retry. Include the correlation/error id when surfacing to user-reportable bugs.
3. **Empty** — explain why it's empty and what the user can do next.
4. **Stale / refetching** — subtle indicator; don't blank the view.

A component handling only the success path is incomplete.

## 16. Performance

- Code-split by route (App Router default).
- Heavy components (rich text, charts) dynamically imported via `next/dynamic`.
- Images via `next/image` with explicit width/height (prevent CLS).
- Virtualize long lists with `@tanstack/react-virtual` (note: this is fine — it's a different package from TanStack Query).

## 17. Testing

- **Vitest** for unit tests (jsdom). Coverage threshold: **45%**.
- **Playwright** for E2E. Backend + frontend start automatically.
- E2E auth uses **storage state** and **seeded test users**.

```bash
pnpm --filter @aluplan/frontend test:unit          # Vitest
pnpm --filter @aluplan/frontend test:unit:watch
pnpm --filter @aluplan/frontend test:e2e           # Playwright
pnpm --filter @aluplan/frontend test:e2e:ui
pnpm --filter @aluplan/frontend analyze            # ANALYZE=true next build
```

## 18. Anti-patterns

- Installing or using TanStack Query.
- Hardcoded user-facing strings.
- `next/link` imports (use the wrapped `Link` from `@/i18n/routing`).
- SSE for real-time (use Socket.io).
- Bypassing `toast()` with a custom notification component.
- Calling admin endpoints from customer pages.
- Inline `<script>` without CSP nonce.
- Replacing the sanitized rich-text renderer with raw HTML rendering.
- Mounting form state in Zustand (use `react-hook-form`).
- Component-level `fetch` for server data (use Server Components or actions).

## 19. When in doubt

- Use the existing pattern from a nearby route over a new one.
- Server Components by default; client components only when interactivity demands it.
- Run `pnpm i18n:check` before declaring UI text changes done.
- Match the existing `src/components/ui/` style — do not introduce a competing primitives library.
