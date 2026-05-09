'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/role-guard';
import { HelpDocsSidebar } from '@/components/help/HelpDocsSidebar';
import { isAdminOrAgent, buildDocTree } from '@/components/help/doc-tree';

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-loaded content panel (ssr: false — large component, client-only)
// ─────────────────────────────────────────────────────────────────────────────

function DocContentSkeleton() {
  return (
    <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
      <div className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-4xl w-full mx-auto space-y-4 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-white/10" />
        <div className="h-8 w-2/3 rounded-lg bg-white/10" />
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-5/6 rounded bg-white/5" />
        <div className="h-4 w-4/6 rounded bg-white/5" />
        <div className="mt-6 h-32 w-full rounded-lg bg-white/5" />
      </div>
    </div>
  );
}

const HelpDocsContent = nextDynamic(
  () => import('@/components/help/HelpDocsContent').then((m) => m.HelpDocsContent),
  {
    ssr: false,
    loading: () => <DocContentSkeleton />,
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// HelpDocsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function HelpDocsPage() {
  const { user } = useAuth();
  const t = useTranslations('help');
  const [activeNodeId, setActiveNodeId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Safe default: treat null user (loading) as customer (most restrictive)
  const isStaff = isAdminOrAgent(user);
  const tree = buildDocTree(isStaff);

  // Set role-based default node on first load
  useEffect(() => {
    const defaultNode = isStaff
      ? 'admin.tickets.overview'
      : 'customer.getting_started.dashboard';
    setActiveNodeId(defaultNode);
  }, [isStaff]);

  return (
    <div className="flex h-full">
      <HelpDocsSidebar
        tree={tree}
        activeNodeId={activeNodeId}
        onNodeSelect={setActiveNodeId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <HelpDocsContent
        tree={tree}
        activeNodeId={activeNodeId}
        onNodeSelect={setActiveNodeId}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
