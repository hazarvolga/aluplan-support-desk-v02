'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Customer sections
import {
  GettingStartedDashboard,
  GettingStartedAnnouncements,
  AiAssistantOverview,
  AiAssistantTips,
  MyTicketsCreate,
  MyTicketsAttachments,
  MyTicketsTracking,
  KnowledgeBaseOverview,
  ProfileSettings,
} from './sections/customer';

// Admin sections
import {
  TicketsOverview,
  TicketsAiCopilot,
  TicketsInternalNotes,
  AiKnowledgePool,
  AiLearningCycle,
  AiApprovals,
  AiFaq,
  CrmProducts,
  CrmTaxonomy,
  TeamCustomers,
  TeamTeams,
  TeamSla,
  AnnouncementsOverview,
  AnnouncementsTemplates,
  SystemTopology,
  SystemSettings,
  SystemProfile,
} from './sections/admin';

// ─────────────────────────────────────────────────────────────────────────────
// Node ID → Component map
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_MAP: Record<string, React.ComponentType> = {
  // Customer nodes
  'customer_getting_started_dashboard':      GettingStartedDashboard,
  'customer_getting_started_announcements':  GettingStartedAnnouncements,
  'customer_ai_assistant_overview':          AiAssistantOverview,
  'customer_ai_assistant_tips':              AiAssistantTips,
  'customer_my_tickets_create':              MyTicketsCreate,
  'customer_my_tickets_attachments':         MyTicketsAttachments,
  'customer_my_tickets_tracking':            MyTicketsTracking,
  'customer_knowledge_base_overview':        KnowledgeBaseOverview,
  'customer_profile_settings':               ProfileSettings,

  // Admin nodes
  'admin_tickets_overview':                  TicketsOverview,
  'admin_tickets_ai_copilot':                TicketsAiCopilot,
  'admin_tickets_internal_notes':            TicketsInternalNotes,
  'admin_ai_knowledge_pool':                 AiKnowledgePool,
  'admin_ai_knowledge_learning_cycle':       AiLearningCycle,
  'admin_ai_knowledge_approvals':            AiApprovals,
  'admin_ai_knowledge_faq':                  AiFaq,
  'admin_crm_products_products':             CrmProducts,
  'admin_crm_products_taxonomy':             CrmTaxonomy,
  'admin_team_customers_customers':          TeamCustomers,
  'admin_team_customers_teams':              TeamTeams,
  'admin_team_customers_sla':                TeamSla,
  'admin_announcements_overview':            AnnouncementsOverview,
  'admin_announcements_templates':           AnnouncementsTemplates,
  'admin_system_settings_topology':          SystemTopology,
  'admin_system_settings_settings':          SystemSettings,
  'admin_system_settings_profile':           SystemProfile,
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DocSectionProps {
  /** The currently active node id */
  nodeId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DocSection — renders the content component for the given node id.
 *
 * Falls back to a friendly "not found" state when the node id has no
 * registered component (e.g. category nodes that have no direct content).
 */
export function DocSection({ nodeId }: DocSectionProps) {
  const t = useTranslations('help.common');
  const Component = SECTION_MAP[nodeId];

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <HelpCircle className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {t('content_not_found')}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {t('select_topic')}
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}
