import {
  Home,
  LayoutDashboard,
  Megaphone,
  Bot,
  Sparkles,
  Lightbulb,
  Ticket,
  Plus,
  Paperclip,
  Clock,
  BookOpen,
  Library,
  User,
  Settings,
  ListChecks,
  Inbox,
  StickyNote,
  Database,
  HardDrive,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Layers,
  Package,
  Tag,
  Users,
  UserCheck,
  Building2,
  Send,
  FileText,
  Network,
  Sliders,
  UserCircle,
} from 'lucide-react';

import type { DocNode, DocTree, BreadcrumbItem } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Customer tree
// ─────────────────────────────────────────────────────────────────────────────

export const CUSTOMER_TREE: DocNode[] = [
  {
    id: 'customer_getting_started',
    labelKey: 'help.docs.nav.customer.getting_started',
    icon: Home,
    children: [
      {
        id: 'customer_getting_started_dashboard',
        labelKey: 'help.docs.nav.customer.getting_started_dashboard',
        contentKey: 'help.docs.customer.getting_started',
        icon: LayoutDashboard,
      },
      {
        id: 'customer_getting_started_announcements',
        labelKey: 'help.docs.nav.customer.getting_started_announcements',
        contentKey: 'help.docs.customer.getting_started_announcements',
        icon: Megaphone,
      },
    ],
  },
  {
    id: 'customer_ai_assistant',
    labelKey: 'help.docs.nav.customer.ai_assistant',
    icon: Bot,
    children: [
      {
        id: 'customer_ai_assistant_overview',
        labelKey: 'help.docs.nav.customer.ai_assistant_overview',
        contentKey: 'help.docs.customer.ai_assistant',
        icon: Sparkles,
      },
      {
        id: 'customer_ai_assistant_tips',
        labelKey: 'help.docs.nav.customer.ai_assistant_tips',
        contentKey: 'help.docs.customer.ai_assistant_tips',
        icon: Lightbulb,
      },
    ],
  },
  {
    id: 'customer_my_tickets',
    labelKey: 'help.docs.nav.customer.my_tickets',
    icon: Ticket,
    children: [
      {
        id: 'customer_my_tickets_create',
        labelKey: 'help.docs.nav.customer.my_tickets_create',
        contentKey: 'help.docs.customer.my_tickets',
        icon: Plus,
      },
      {
        id: 'customer_my_tickets_attachments',
        labelKey: 'help.docs.nav.customer.my_tickets_attachments',
        contentKey: 'help.docs.customer.my_tickets_attachments',
        icon: Paperclip,
      },
      {
        id: 'customer_my_tickets_tracking',
        labelKey: 'help.docs.nav.customer.my_tickets_tracking',
        contentKey: 'help.docs.customer.my_tickets_tracking',
        icon: Clock,
      },
    ],
  },
  {
    id: 'customer_knowledge_base',
    labelKey: 'help.docs.nav.customer.knowledge_base',
    icon: BookOpen,
    children: [
      {
        id: 'customer_knowledge_base_overview',
        labelKey: 'help.docs.nav.customer.knowledge_base_overview',
        contentKey: 'help.docs.customer.knowledge_base',
        icon: Library,
      },
    ],
  },
  {
    id: 'customer_profile',
    labelKey: 'help.docs.nav.customer.profile',
    icon: User,
    children: [
      {
        id: 'customer_profile_settings',
        labelKey: 'help.docs.nav.customer.profile_settings',
        contentKey: 'help.docs.customer.profile',
        icon: Settings,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Admin / Agent tree
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_TREE: DocNode[] = [
  {
    id: 'admin_tickets',
    labelKey: 'help.docs.nav.admin.tickets',
    icon: ListChecks,
    children: [
      {
        id: 'admin_tickets_overview',
        labelKey: 'help.docs.nav.admin.tickets_overview',
        contentKey: 'help.docs.admin.tickets',
        icon: Inbox,
      },
      {
        id: 'admin_tickets_ai_copilot',
        labelKey: 'help.docs.nav.admin.tickets_ai_copilot',
        contentKey: 'help.docs.admin.tickets_ai_copilot',
        icon: Bot,
      },
      {
        id: 'admin_tickets_internal_notes',
        labelKey: 'help.docs.nav.admin.tickets_internal_notes',
        contentKey: 'help.docs.admin.tickets_internal_notes',
        icon: StickyNote,
      },
    ],
  },
  {
    id: 'admin_ai_knowledge',
    labelKey: 'help.docs.nav.admin.ai_knowledge',
    icon: Database,
    children: [
      {
        id: 'admin_ai_knowledge_pool',
        labelKey: 'help.docs.nav.admin.ai_knowledge_pool',
        contentKey: 'help.docs.admin.ai_knowledge',
        icon: HardDrive,
      },
      {
        id: 'admin_ai_knowledge_learning_cycle',
        labelKey: 'help.docs.nav.admin.ai_knowledge_learning_cycle',
        contentKey: 'help.docs.admin.ai_knowledge_learning_cycle',
        icon: RefreshCw,
      },
      {
        id: 'admin_ai_knowledge_approvals',
        labelKey: 'help.docs.nav.admin.ai_knowledge_approvals',
        contentKey: 'help.docs.admin.ai_knowledge_approvals',
        icon: CheckCircle,
      },
      {
        id: 'admin_ai_knowledge_faq',
        labelKey: 'help.docs.nav.admin.ai_knowledge_faq',
        contentKey: 'help.docs.admin.ai_knowledge_faq',
        icon: HelpCircle,
      },
    ],
  },
  {
    id: 'admin_crm_products',
    labelKey: 'help.docs.nav.admin.crm_products',
    icon: Layers,
    children: [
      {
        id: 'admin_crm_products_products',
        labelKey: 'help.docs.nav.admin.crm_products_products',
        contentKey: 'help.docs.admin.crm_products',
        icon: Package,
      },
      {
        id: 'admin_crm_products_taxonomy',
        labelKey: 'help.docs.nav.admin.crm_products_taxonomy',
        contentKey: 'help.docs.admin.crm_products_taxonomy',
        icon: Tag,
      },
    ],
  },
  {
    id: 'admin_team_customers',
    labelKey: 'help.docs.nav.admin.team_customers',
    icon: Users,
    children: [
      {
        id: 'admin_team_customers_customers',
        labelKey: 'help.docs.nav.admin.team_customers_customers',
        contentKey: 'help.docs.admin.team_customers',
        icon: UserCheck,
      },
      {
        id: 'admin_team_customers_teams',
        labelKey: 'help.docs.nav.admin.team_customers_teams',
        contentKey: 'help.docs.admin.team_customers_teams',
        icon: Building2,
      },
      {
        id: 'admin_team_customers_sla',
        labelKey: 'help.docs.nav.admin.team_customers_sla',
        contentKey: 'help.docs.admin.team_customers_sla',
        icon: Clock,
      },
    ],
  },
  {
    id: 'admin_announcements',
    labelKey: 'help.docs.nav.admin.announcements',
    icon: Megaphone,
    children: [
      {
        id: 'admin_announcements_overview',
        labelKey: 'help.docs.nav.admin.announcements_overview',
        contentKey: 'help.docs.admin.announcements',
        icon: Send,
      },
      {
        id: 'admin_announcements_templates',
        labelKey: 'help.docs.nav.admin.announcements_templates',
        contentKey: 'help.docs.admin.announcements_templates',
        icon: FileText,
      },
    ],
  },
  {
    id: 'admin_system_settings',
    labelKey: 'help.docs.nav.admin.system_settings',
    icon: Settings,
    children: [
      {
        id: 'admin_system_settings_topology',
        labelKey: 'help.docs.nav.admin.system_settings_topology',
        contentKey: 'help.docs.admin.system_settings',
        icon: Network,
      },
      {
        id: 'admin_system_settings_settings',
        labelKey: 'help.docs.nav.admin.system_settings_settings',
        contentKey: 'help.docs.admin.system_settings_settings',
        icon: Sliders,
      },
      {
        id: 'admin_system_settings_profile',
        labelKey: 'help.docs.nav.admin.system_settings_profile',
        contentKey: 'help.docs.admin.system_settings_profile',
        icon: UserCircle,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions (task 2.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively search a tree for a node with the given id.
 * Returns the node or null if not found.
 */
export function findNode(tree: DocNode[], nodeId: string): DocNode | null {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Build the breadcrumb trail from the root of the tree to the node
 * identified by `activeNodeId`.
 *
 * Returns an array ordered root → … → leaf, e.g.:
 *   [{ label: 'Yardım', nodeId: undefined }, { label: 'Başlarken' }, { label: 'Dashboard' }]
 *
 * Labels are the raw `labelKey` strings — callers should translate them with
 * `useTranslations` before rendering.
 */
export function getBreadcrumbPath(
  tree: DocNode[],
  activeNodeId: string,
): BreadcrumbItem[] {
  function search(nodes: DocNode[], path: BreadcrumbItem[]): BreadcrumbItem[] | null {
    for (const node of nodes) {
      const current: BreadcrumbItem = { label: node.labelKey, nodeId: node.id };
      const newPath = [...path, current];

      if (node.id === activeNodeId) return newPath;

      if (node.children) {
        const found = search(node.children, newPath);
        if (found) return found;
      }
    }
    return null;
  }

  return search(tree, []) ?? [];
}

/**
 * Determine whether a user has admin or agent privileges.
 *
 * Handles both plain-string roles (`user.role`) and array roles
 * (`user.roles`) as returned by the API.
 */
export function isAdminOrAgent(user: { role?: string; roles?: string[] } | null): boolean {
  if (!user) return false;

  const STAFF_ROLES = [
    'admin',
    'agent',
    'super_admin',
    'support_agent',
    'senior_agent',
    'team_lead',
    'department_manager',
    'manager',
  ];

  // Check the primary `role` field
  const primaryRole = (user.role ?? '').toLowerCase();
  if (STAFF_ROLES.includes(primaryRole)) return true;

  // Check the `roles` array (some API responses include this)
  if (Array.isArray(user.roles)) {
    return user.roles.some((r) => STAFF_ROLES.includes(r.toLowerCase()));
  }

  return false;
}

/**
 * Build the combined DocTree for the current user.
 *
 * - Customers see only the customer tree.
 * - Admins / agents see both trees (admin tree first, then customer tree).
 */
export function buildDocTree(isStaff: boolean): DocTree {
  return {
    customer: CUSTOMER_TREE,
    admin: isStaff ? ADMIN_TREE : [],
  };
}

/**
 * Flat list of every leaf node id across both trees.
 * Useful for property-based tests and default-node resolution.
 */
export function getAllNodeIds(tree: DocTree): string[] {
  function collect(nodes: DocNode[]): string[] {
    return nodes.flatMap((n) =>
      n.children ? collect(n.children) : [n.id],
    );
  }
  return [...collect(tree.customer), ...collect(tree.admin)];
}
