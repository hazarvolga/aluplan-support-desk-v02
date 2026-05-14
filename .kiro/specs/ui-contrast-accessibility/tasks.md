# Implementation Plan: UI Contrast Accessibility (WCAG 2.1 AA)

## Overview

Pure Tailwind class substitution across the Aluplan Support Desk Next.js 15 / Tailwind CSS frontend to fix all WCAG 2.1 AA contrast violations. No new dependencies, no API changes, dark mode preserved via `dark:` prefix. The plan starts with the contrast utility library (foundation for tests), then fixes components and pages in parallel, and ends with a typecheck verification.

## Tasks

- [ ] 1. Create contrast utility library
  - Create `apps/frontend/src/lib/contrast.ts` with five pure functions: `relativeLuminance(hex)`, `contrastRatio(fg, bg)`, `passesAA(fg, bg)`, `passesAALarge(fg, bg)`, and `blendWithBackground(color, opacity, background)`
  - Implement WCAG 2.1 IEC 61966-2-1 relative luminance formula (linearise each channel, sum with weights 0.2126 R + 0.7152 G + 0.0722 B)
  - Implement contrast ratio as `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter luminance
  - `passesAA` returns `true` when ratio ≥ 4.5; `passesAALarge` returns `true` when ratio ≥ 3.0
  - `blendWithBackground` alpha-composites `color` at `opacity` over `background` and returns the resulting hex
  - Export all five functions; no runtime dependencies
  - _Requirements: 1.5, 7.2_

  - [ ]* 1.1 Write property-based tests for contrast utility (contrast.pbt.spec.ts)
    - Create `apps/frontend/src/lib/contrast.pbt.spec.ts` using `fast-check`
    - **Property 1: Kontrast Oranı Fonksiyonu Doğruluğu** — for any two valid hex colours, `contrastRatio` returns a value in [1, 21]; `passesAA` iff ratio ≥ 4.5; `passesAALarge` iff ratio ≥ 3.0
    - **Property 3: Opacity ile Karıştırılmış Renk Hesabı Doğruluğu** — for any colour, opacity ∈ [0,1], and background, `blendWithBackground` returns a valid hex; when opacity ≥ 0.5 over a dark background the result passes `passesAALarge`
    - **Property 4: Küçük Metin Kontrast Eşiği** — for each fixed colour pair used in small-text fixes (slate-700 on slate-100, slate-700 on slate-50, slate-800 on slate-100), `passesAA` returns `true`
    - **Property 5: Minimum Font Boyutu Kuralı** — assert that font sizes below 10px are only valid when paired with `aria-hidden="true"` (document the rule as a comment-based property; no DOM needed)
    - Each property runs minimum 100 iterations; add comment header: `// Feature: ui-contrast-accessibility, Property N: <title>`
    - Run with: `pnpm --filter @aluplan/frontend exec vitest run src/lib/contrast.pbt.spec.ts`
    - _Requirements: 1.4, 1.5, 4.5, 5.2, 6.1, 7.2_

- [ ] 2. Fix RoleBadge and AgentStatusBadge components
  - [ ] 2.1 Fix RoleBadge.tsx contrast violations
    - In `apps/frontend/src/components/team/RoleBadge.tsx`, update the `config` map:
      - `AGENT`: change `text-slate-500` → `text-slate-700 dark:text-slate-400`
      - `VIEWER`: change `text-stone-500` → `text-stone-700 dark:text-stone-400`
    - All other roles (ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, SENIOR_AGENT) are already compliant — do not touch them
    - _Requirements: 3.2, 3.5_

  - [ ] 2.2 Fix AgentStatusBadge.tsx contrast violation
    - In `apps/frontend/src/components/team/AgentStatusBadge.tsx`, update the `config` map:
      - `OFFLINE`: change `text-slate-500` → `text-slate-700 dark:text-slate-400`
    - ONLINE, AWAY, DND are already compliant — do not touch them
    - _Requirements: 3.3, 3.5_

  - [ ]* 2.3 Write unit tests for RoleBadge (RoleBadge.spec.tsx)
    - Create `apps/frontend/src/components/team/RoleBadge.spec.tsx` using Vitest + `@testing-library/react`
    - Test that AGENT role className contains `text-slate-700` and does NOT contain `text-slate-500`
    - Test that VIEWER role className contains `text-stone-700` and does NOT contain `text-stone-500`
    - Test that AGENT role className contains `dark:text-slate-400`
    - Test that ADMIN role className still contains `text-purple-500` (regression guard)
    - **Property 2: Badge Renk Varyantları Her İki Modda WCAG AA Uyumlu** — for each role variant, extract the light-mode text colour hex and call `passesAA(hex, '#ffffff')` from `contrast.ts`; assert `true`
    - _Requirements: 3.2, 3.5, 7.1, 7.3_

  - [ ]* 2.4 Write unit tests for AgentStatusBadge (AgentStatusBadge.spec.tsx)
    - Create `apps/frontend/src/components/team/AgentStatusBadge.spec.tsx` using Vitest + `@testing-library/react`
    - Test that OFFLINE status className contains `text-slate-700` and does NOT contain `text-slate-500`
    - Test that OFFLINE status className contains `dark:text-slate-400`
    - Test that ONLINE status className still contains `text-emerald-500` (regression guard)
    - **Property 2: Badge Renk Varyantları Her İki Modda WCAG AA Uyumlu** — for each status variant, extract the light-mode text colour hex and call `passesAA(hex, '#ffffff')` from `contrast.ts`; assert `true`
    - _Requirements: 3.3, 3.5, 7.1, 7.3_

- [ ] 3. Fix hover state contrast violations
  - [ ] 3.1 Fix knowledge-base/[id]/page.tsx hover states
    - In `apps/frontend/src/app/[locale]/(dashboard)/knowledge-base/[id]/page.tsx`:
      - "Evet" feedback button: change `hover:bg-green-500` → `hover:bg-green-700`
      - "Düzenle" edit link: change `hover:bg-orange-500` → `hover:bg-orange-700`
    - Both buttons already use `hover:text-white` — do not change text colour
    - _Requirements: 1.1, 1.3_

  - [ ] 3.2 Fix customers/crm/field-mapping.tsx hover state
    - In `apps/frontend/src/app/[locale]/(dashboard)/customers/crm/field-mapping.tsx`:
      - "Add column" button (bottom of form): change `hover:bg-blue-400` → `hover:bg-blue-700`
    - The save button in the header uses `bg-blue-500/10 text-blue-400` (ghost style on dark background) — this is compliant; do not change it
    - _Requirements: 1.2_

- [ ] 4. Fix small text contrast violations
  - [ ] 4.1 Fix teams/page.tsx overflow badge
    - In `apps/frontend/src/app/[locale]/(dashboard)/teams/page.tsx`, around line 221:
      - Change `text-slate-500` → `text-slate-700` on the overflow member count badge (`bg-slate-100 text-[10px]`)
    - _Requirements: 2.1_

  - [ ] 4.2 Fix knowledge-base/analytics/page.tsx small text
    - In `apps/frontend/src/app/[locale]/(dashboard)/knowledge-base/analytics/page.tsx`:
      - Around line 107: change `text-slate-500` → `text-slate-700` (view count badge, `bg-slate-50 text-xs`)
      - Around line 79: change `text-slate-600` → `text-slate-800` (helpfulness label, `bg-slate-100 text-sm`)
    - _Requirements: 2.2, 2.3_

- [ ] 5. Fix status badge contrast violations (light mode)
  - [ ] 5.1 Fix tickets/[id]/page.tsx STATUS_COLORS map
    - In `apps/frontend/src/app/[locale]/(dashboard)/tickets/[id]/page.tsx`, update the `STATUS_COLORS` constant:
      - `NEW`: `text-blue-400` → `text-blue-700 dark:text-blue-400`
      - `OPEN`: `text-sky-400` → `text-sky-700 dark:text-sky-400`
      - `IN_PROGRESS`: `text-amber-400` → `text-amber-700 dark:text-amber-400`
      - `PENDING_CUSTOMER`: `text-purple-400` → `text-purple-700 dark:text-purple-400`
      - `PENDING_CUSTOMER_REVIEW`: `text-orange-400` → `text-orange-700 dark:text-orange-400`
      - `RESOLVED`: `text-emerald-400` → `text-emerald-700 dark:text-emerald-400`
      - `CLOSED` uses `text-muted-foreground` — leave unchanged
    - _Requirements: 3.1, 3.4_

  - [ ] 5.2 Fix knowledge-pool/page.tsx status badge colours and font size
    - In `apps/frontend/src/app/[locale]/(dashboard)/knowledge-pool/page.tsx`:
      - Apply the same `text-*-400` → `text-*-700 dark:text-*-400` pattern to all status badge colour classes
      - Change `text-[9px]` → `text-[10px]` for any informational text at that size
    - _Requirements: 3.1, 6.1_

  - [ ] 5.3 Fix faq/page.tsx status badge colours
    - In `apps/frontend/src/app/[locale]/(dashboard)/faq/page.tsx`:
      - Apply the same `text-*-400` → `text-*-700 dark:text-*-400` pattern to all status badge colour classes
    - _Requirements: 3.1_

  - [ ] 5.4 Fix knowledge-pool/upload/page.tsx status badge colours
    - In `apps/frontend/src/app/[locale]/(dashboard)/knowledge-pool/upload/page.tsx`:
      - Apply the same `text-*-400` → `text-*-700 dark:text-*-400` pattern to all status badge colour classes
    - _Requirements: 3.1_

- [ ] 6. Fix placeholder text contrast violations
  - [ ] 6.1 Fix login/page.tsx placeholder opacity
    - In `apps/frontend/src/app/[locale]/login/page.tsx`:
      - Change all `placeholder:text-muted-foreground/30` → `placeholder:text-muted-foreground/60`
      - There are two input fields (email and password) — update both
    - _Requirements: 4.1_

  - [ ] 6.2 Fix ai/page.tsx placeholder opacity
    - In `apps/frontend/src/app/[locale]/(dashboard)/ai/page.tsx`:
      - Change all `placeholder:text-muted-foreground/30` → `placeholder:text-muted-foreground/60`
    - _Requirements: 4.2_

  - [ ] 6.3 Fix reset-password/page.tsx placeholder opacity
    - In `apps/frontend/src/app/[locale]/(auth)/reset-password/page.tsx`:
      - Change all `placeholder:text-white/20` → `placeholder:text-white/50`
      - There are two password input fields — update both
    - _Requirements: 4.3_

  - [ ] 6.4 Fix AiSettings.tsx placeholder opacity
    - In `apps/frontend/src/app/[locale]/(dashboard)/admin/settings/components/AiSettings.tsx`:
      - Change all `placeholder:text-white/20` → `placeholder:text-white/50`
    - _Requirements: 4.4_

- [ ] 7. Fix low-opacity text and font size violations
  - [ ] 7.1 Fix customers/page.tsx low-opacity text and font size
    - In `apps/frontend/src/app/[locale]/(dashboard)/customers/page.tsx`:
      - Lines ~745 and ~976: change `text-white/40` → `text-white/80` for all informational (non-decorative) text elements
      - Any `text-[8px]` on informational text: change to `text-[10px]`; if purely decorative, add `aria-hidden="true"` instead
    - _Requirements: 5.1, 5.2, 6.1_

  - [ ] 7.2 Fix source-architecture-view.tsx font sizes and decorative labels
    - In `apps/frontend/src/components/dashboard/source-architecture-view.tsx`:
      - The `text-[7px]` element rendering `{t('status_running')}` (STATUS_RUNNING label inside the processing engine boxes) is decorative — add `aria-hidden="true"` to that element
      - The `text-[8px]` elements rendering pillar labels (`{p.label}`) and strategy labels (`{p.strategy}`) carry information — change to `text-[10px]`
      - The `text-[7px]` Badge elements in the bottom vector DB section (`re_ranking`, `trust_priority`) are decorative — add `aria-hidden="true"` to those Badge components
    - _Requirements: 6.1, 6.3_

- [ ] 8. Checkpoint — Ensure all tests pass
  - Run `pnpm --filter @aluplan/frontend exec vitest run src/lib/contrast.pbt.spec.ts`
  - Run `pnpm --filter @aluplan/frontend exec vitest run src/components/team/RoleBadge.spec.tsx`
  - Run `pnpm --filter @aluplan/frontend exec vitest run src/components/team/AgentStatusBadge.spec.tsx`
  - Ensure all tests pass; ask the user if questions arise.

- [ ] 9. Run typecheck to verify zero TypeScript errors
  - Run `pnpm --filter @aluplan/frontend typecheck`
  - Fix any TypeScript errors introduced by the changes (e.g., incorrect JSX attribute types on `aria-hidden`)
  - `aria-hidden` must be set as `aria-hidden="true"` (string) not `aria-hidden={true}` (boolean) in JSX to avoid type errors in some configurations — use whichever form the project's tsconfig accepts
  - _Requirements: 6.4, 7.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All Tailwind class changes are static strings — Tailwind's purge/JIT will include them without any config changes
- Dark mode is preserved on every fix: light-mode class is updated, `dark:` variant retains the original colour
- The contrast utility (`contrast.ts`) has zero runtime dependencies and is safe to import in both test and production code
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2", "4.1", "4.2", "5.1", "5.2", "5.3", "5.4", "6.1", "6.2", "6.3", "6.4", "7.1", "7.2"] },
    { "id": 2, "tasks": ["2.3", "2.4"] }
  ]
}
```
