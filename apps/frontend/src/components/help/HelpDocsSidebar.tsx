'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DocNode, DocTree } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HelpDocsSidebarProps {
  /** The full documentation tree (customer + admin arrays) */
  tree: DocTree;
  /** Currently selected node id */
  activeNodeId: string;
  /** Called when the user selects a leaf node */
  onNodeSelect: (id: string) => void;
  /** Whether the mobile sidebar drawer is open */
  isOpen: boolean;
  /** Toggle the mobile sidebar open/closed */
  onToggle: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarItem — leaf node button
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  node: DocNode;
  activeNodeId: string;
  onNodeSelect: (id: string) => void;
  depth?: number;
}

function SidebarItem({ node, activeNodeId, onNodeSelect, depth = 0 }: SidebarItemProps) {
  const t = useTranslations();
  const isActive = node.id === activeNodeId;
  const Icon = node.icon;

  const label = t(node.labelKey as Parameters<typeof t>[0]);

  const handleClick = () => {
    onNodeSelect(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNodeSelect(node.id);
    }
  };

  return (
    <button
      type="button"
      role="treeitem"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-node-id={node.id}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        depth > 0 && 'pl-8',
        isActive
          ? 'border-l-2 border-primary bg-primary/10 text-primary'
          : 'border-l-2 border-transparent text-muted-foreground hover:bg-white/5 hover:text-white',
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white',
          )}
          aria-hidden="true"
        />
      )}
      <span className="flex-1 truncate text-left">{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarCategory — collapsible category with children
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarCategoryProps {
  node: DocNode;
  activeNodeId: string;
  onNodeSelect: (id: string) => void;
  defaultExpanded?: boolean;
}

function SidebarCategory({
  node,
  activeNodeId,
  onNodeSelect,
  defaultExpanded = false,
}: SidebarCategoryProps) {
  const t = useTranslations();
  const Icon = node.icon;
  const label = t(node.labelKey as Parameters<typeof t>[0]);

  // Auto-expand if a child is active
  const hasActiveChild = React.useMemo(
    () => (node.children ?? []).some((c) => c.id === activeNodeId),
    [node.children, activeNodeId],
  );

  const [expanded, setExpanded] = React.useState(defaultExpanded || hasActiveChild);

  // Keep expanded when active child changes (e.g. external navigation)
  React.useEffect(() => {
    if (hasActiveChild) setExpanded(true);
  }, [hasActiveChild]);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleExpanded();
        break;
      case 'ArrowRight':
        e.preventDefault();
        setExpanded(true);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setExpanded(false);
        break;
    }
  };

  return (
    <div role="treeitem" aria-expanded={expanded}>
      {/* Category header button */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={label}
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        className={cn(
          'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          'text-foreground/80 hover:bg-white/5 hover:text-white',
        )}
      >
        {Icon && (
          <Icon
            className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-white"
            aria-hidden="true"
          />
        )}
        <span className="flex-1 truncate text-left">{label}</span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {/* Children */}
      {expanded && node.children && (
        <div role="group" className="mt-0.5 space-y-0.5 pl-2">
          {node.children.map((child) =>
            child.children ? (
              <SidebarCategory
                key={child.id}
                node={child}
                activeNodeId={activeNodeId}
                onNodeSelect={onNodeSelect}
              />
            ) : (
              <SidebarItem
                key={child.id}
                node={child}
                activeNodeId={activeNodeId}
                onNodeSelect={onNodeSelect}
                depth={1}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarSection — labelled group of categories (e.g. "Müşteri Kılavuzu")
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarSectionProps {
  label: string;
  nodes: DocNode[];
  activeNodeId: string;
  onNodeSelect: (id: string) => void;
}

function SidebarSection({ label, nodes, activeNodeId, onNodeSelect }: SidebarSectionProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}
      </h3>
      {nodes.map((node) =>
        node.children ? (
          <SidebarCategory
            key={node.id}
            node={node}
            activeNodeId={activeNodeId}
            onNodeSelect={onNodeSelect}
          />
        ) : (
          <SidebarItem
            key={node.id}
            node={node}
            activeNodeId={activeNodeId}
            onNodeSelect={onNodeSelect}
          />
        ),
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyboard navigation hook — Arrow Up/Down across all focusable items
// ─────────────────────────────────────────────────────────────────────────────

function useArrowNavigation(containerRef: React.RefObject<HTMLElement | null>) {
  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button[data-node-id], button[aria-expanded]',
        ),
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

      if (focusable.length === 0) return;

      const current = document.activeElement as HTMLElement;
      const idx = focusable.indexOf(current);

      e.preventDefault();

      if (e.key === 'ArrowDown') {
        const next = focusable[idx + 1] ?? focusable[0];
        next?.focus();
      } else {
        const prev = focusable[idx - 1] ?? focusable[focusable.length - 1];
        prev?.focus();
      }
    },
    [containerRef],
  );

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);
}

// ─────────────────────────────────────────────────────────────────────────────
// HelpDocsSidebar — main export
// ─────────────────────────────────────────────────────────────────────────────

export function HelpDocsSidebar({
  tree,
  activeNodeId,
  onNodeSelect,
  isOpen,
  onToggle,
}: HelpDocsSidebarProps) {
  const t = useTranslations();
  const navRef = React.useRef<HTMLElement>(null);
  useArrowNavigation(navRef);

  const hasAdmin = tree.admin.length > 0;

  const sidebarContent = (
    <nav
      id="help-sidebar"
      ref={navRef}
      role="navigation"
      aria-label="Dokümantasyon navigasyonu"
      className="flex h-full flex-col gap-4 overflow-y-auto px-3 py-4"
    >
      {/* Customer tree */}
      <SidebarSection
        label={t('help.docs.nav.customer_guide')}
        nodes={tree.customer}
        activeNodeId={activeNodeId}
        onNodeSelect={onNodeSelect}
      />

      {/* Admin / Agent tree — only shown for staff */}
      {hasAdmin && (
        <>
          <div className="border-t border-white/5" role="separator" />
          <SidebarSection
            label={t('help.docs.nav.admin_guide')}
            nodes={tree.admin}
            activeNodeId={activeNodeId}
            onNodeSelect={onNodeSelect}
          />
        </>
      )}
      
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex md:w-64 md:shrink-0 md:flex-col',
          'h-full border-r border-white/5 bg-[#111111]',
        )}
        aria-label="Dokümantasyon navigasyonu"
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-hidden="true"
          onClick={onToggle}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <aside
        id="help-sidebar-mobile"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-[#111111]',
          'transform transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Dokümantasyon navigasyonu"
        aria-hidden={!isOpen}
      >
        {/* Close button inside drawer */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <span className="text-sm font-semibold text-white">{t('help.title')}</span>
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={onToggle}
            className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileSidebarToggle — hamburger button rendered in the content header
// ─────────────────────────────────────────────────────────────────────────────

export interface MobileSidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function MobileSidebarToggle({ isOpen, onToggle, className }: MobileSidebarToggleProps) {
  const t = useTranslations();
  return (
    <button
      type="button"
      aria-label={isOpen ? t('help.common.close_menu') : t('help.common.open_menu')}
      aria-expanded={isOpen}
      aria-controls="help-sidebar-mobile"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2',
        'text-muted-foreground hover:bg-white/10 hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'md:hidden',
        className,
      )}
    >
      {isOpen ? (
        <X className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Menu className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
