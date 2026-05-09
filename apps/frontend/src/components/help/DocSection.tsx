'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';

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
  'customer.getting_started.dashboard':      GettingStartedDashboard,
  'customer.getting_started.announcements':  GettingStartedAnnouncements,
  'customer.ai_assistant.overview':          AiAssistantOverview,
  'customer.ai_assistant.tips':              AiAssistantTips,
  'customer.my_tickets.create':              MyTicketsCreate,
  'customer.my_tickets.attachments':         MyTicketsAttachments,
  'customer.my_tickets.tracking':            MyTicketsTracking,
  'customer.knowledge_base.overview':        KnowledgeBaseOverview,
  'customer.profile.settings':               ProfileSettings,

  // Admin nodes
  'admin.tickets.overview':                  TicketsOverview,
  'admin.tickets.ai_copilot':                TicketsAiCopilot,
  'admin.tickets.internal_notes':            TicketsInternalNotes,
  'admin.ai_knowledge.pool':                 AiKnowledgePool,
  'admin.ai_knowledge.learning_cycle':       AiLearningCycle,
  'admin.ai_knowledge.approvals':            AiApprovals,
  'admin.ai_knowledge.faq':                  AiFaq,
  'admin.crm_products.products':             CrmProducts,
  'admin.crm_products.taxonomy':             CrmTaxonomy,
  'admin.team_customers.customers':          TeamCustomers,
  'admin.team_customers.teams':              TeamTeams,
  'admin.team_customers.sla':                TeamSla,
  'admin.announcements.overview':            AnnouncementsOverview,
  'admin.announcements.templates':           AnnouncementsTemplates,
  'admin.system_settings.topology':          SystemTopology,
  'admin.system_settings.settings':          SystemSettings,
  'admin.system_settings.profile':           SystemProfile,
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
  const Component = SECTION_MAP[nodeId];

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <HelpCircle className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            İçerik bulunamadı
          </p>
          <p className="text-xs text-muted-foreground/60">
            Lütfen sol menüden bir konu seçin.
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}
