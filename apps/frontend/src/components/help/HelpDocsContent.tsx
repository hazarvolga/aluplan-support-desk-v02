'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MobileSidebarToggle } from './HelpDocsSidebar';
import { DocBreadcrumb } from './DocBreadcrumb';
import { DocSection } from './DocSection';
import { getBreadcrumbPath, findNode } from './doc-tree';
import type { DocTree, BreadcrumbItem } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HelpDocsContentProps {
  /** The full documentation tree */
  tree: DocTree;
  /** Currently selected node id */
  activeNodeId: string;
  /** Called when the user selects a node via breadcrumb */
  onNodeSelect: (id: string) => void;
  /** Toggle the mobile sidebar */
  onMobileMenuToggle: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — shown while content is loading
// ─────────────────────────────────────────────────────────────────────────────

function DocSectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      <div className="h-8 w-2/3 rounded-lg bg-white/10" />
      <div className="h-4 w-full rounded bg-white/5" />
      <div className="h-4 w-5/6 rounded bg-white/5" />
      <div className="h-4 w-4/6 rounded bg-white/5" />
      <div className="mt-6 h-32 w-full rounded-lg bg-white/5" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HelpDocsContent
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HelpDocsContent — the right-hand content panel.
 *
 * Structure:
 *   ┌─────────────────────────────────────────┐
 *   │ MobileHeader (hamburger + page title)   │
 *   ├─────────────────────────────────────────┤
 *   │ DocBreadcrumb                           │
 *   ├─────────────────────────────────────────┤
 *   │ DocSection (active node content)        │
 *   └─────────────────────────────────────────┘
 */
export function HelpDocsContent({
  tree,
  activeNodeId,
  onNodeSelect,
  onMobileMenuToggle,
  className,
}: HelpDocsContentProps) {
  const t = useTranslations();

  // Build the combined flat tree for breadcrumb lookup
  const allNodes = React.useMemo(
    () => [...tree.customer, ...tree.admin],
    [tree],
  );

  // Resolve breadcrumb path — translate labelKeys to human-readable labels
  const breadcrumbPath = React.useMemo<BreadcrumbItem[]>(() => {
    const rawPath = getBreadcrumbPath(allNodes, activeNodeId);
    return rawPath.map((crumb) => ({
      // labelKey is stored in crumb.label — translate it
      label: t(crumb.label as Parameters<typeof t>[0]),
      nodeId: crumb.nodeId,
    }));
  }, [allNodes, activeNodeId, t]);

  // Resolve the active node for the mobile header title
  const activeNode = React.useMemo(
    () => findNode(allNodes, activeNodeId),
    [allNodes, activeNodeId],
  );

  const activeLabel = activeNode
    ? t(activeNode.labelKey as Parameters<typeof t>[0])
    : t('help.title');

  return (
    <main
      className={cn(
        'flex flex-1 flex-col min-w-0 overflow-y-auto bg-background',
        className,
      )}
      id="help-docs-content"
    >
      {/* ── Mobile header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden shrink-0">
        <MobileSidebarToggle
          isOpen={false}
          onToggle={onMobileMenuToggle}
        />
        <span className="truncate text-sm font-semibold">{activeLabel}</span>
      </header>

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl w-full mx-auto">
        {/* Breadcrumb */}
        {breadcrumbPath.length > 0 && (
          <div className="mb-8">
            <DocBreadcrumb
              path={breadcrumbPath}
              onNodeSelect={onNodeSelect}
            />
          </div>
        )}

        {/* Main content */}
        <React.Suspense fallback={<DocSectionSkeleton />}>
          {activeNodeId ? (
            <DocSection nodeId={activeNodeId} />
          ) : (
            <WelcomeState />
          )}
        </React.Suspense>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WelcomeState — shown when no node is selected yet
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeState() {
  const t = useTranslations('help.common');
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
        <span className="text-4xl" aria-hidden="true">📚</span>
      </div>
      <div className="space-y-3 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight">{t('welcome_title')}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {t('welcome_desc')}
        </p>
      </div>
    </div>
  );
}
