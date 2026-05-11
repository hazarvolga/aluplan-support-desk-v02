import * as React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DocBreadcrumbProps {
  /** Ordered array of crumbs from root → current node */
  path: BreadcrumbItem[];
  /** Called when a clickable crumb is activated */
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocBreadcrumb — renders the hierarchical navigation trail above the content panel.
 *
 * Example: Yardım › Admin Kılavuzu › Destek Talepleri › Bilet Havuzu
 *
 * - Crumbs with a `nodeId` are rendered as interactive buttons.
 * - The last crumb (current page) is always non-interactive and visually distinct.
 * - Supports keyboard navigation (Enter / Space to activate).
 */
export function DocBreadcrumb({ path, onNodeSelect, className }: DocBreadcrumbProps) {
  const t = useTranslations();
  if (path.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}
    >
      {/* Static root crumb — always "Yardım" */}
      <span className="flex items-center gap-1 text-muted-foreground/60">
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t('help.nav.back')}</span>
      </span>

      {path.map((crumb, index) => {
        const isLast = index === path.length - 1;
        const isClickable = !isLast && !!crumb.nodeId && !!onNodeSelect;

        return (
          <React.Fragment key={crumb.nodeId ?? crumb.label}>
            {/* Separator */}
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
              aria-hidden="true"
            />

            {isLast ? (
              /* Current page — non-interactive, visually prominent */
              <span
                aria-current="page"
                className="font-medium text-foreground truncate max-w-[200px]"
                title={crumb.label}
              >
                {crumb.label}
              </span>
            ) : isClickable ? (
              /* Ancestor crumb — interactive */
              <button
                type="button"
                onClick={() => onNodeSelect!(crumb.nodeId!)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNodeSelect!(crumb.nodeId!);
                  }
                }}
                className={cn(
                  'truncate max-w-[160px] rounded px-0.5',
                  'hover:text-foreground focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  'focus-visible:ring-offset-background transition-colors',
                )}
                title={crumb.label}
              >
                {crumb.label}
              </button>
            ) : (
              /* Non-clickable ancestor (no nodeId) */
              <span className="truncate max-w-[160px]" title={crumb.label}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
