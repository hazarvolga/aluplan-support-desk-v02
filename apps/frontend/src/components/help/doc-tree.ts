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
    id: 'customer.getting_started',
    labelKey: 'help.docs.nav.customer.getting_started',
    icon: Home,
    children: [
      {
        id: 'customer.getting_started.dashboard',
        labelKey: 'help.docs.nav.customer.getting_started.dashboard',
        contentKey: 'help.docs.customer.getting_started',
        icon: LayoutDashboard,
      },
      {
        id: 'customer.getting_started.announcements',
        labelKey: 'help.docs.nav.customer.getting_started.announcements',
        contentKey: 'help.docs.customer.getting_started.announcements',
        icon: Megaphone,
      },
    ],
  },
  {
    id: 'customer.ai_assistant',
    labelKey: 'help.docs.nav.customer.ai_assistant',
    icon: Bot,
    children: [
      {
        id: 'customer.ai_assistant.overview',
        labelKey: 'help.docs.nav.customer.ai_assistant.overview',
        contentKey: 'help.docs.customer.ai_assistant',
        icon: Sparkles,
      },
      {
        id: 'customer.ai_assistant.tips',
        labelKey: 'help.docs.nav.customer.ai_assistant.tips',
        contentKey: 'help.docs.customer.ai_assistant.tips',
        icon: Lightbulb,
      },
    ],
  },
  {
    id: 'customer.my_tickets',
    labelKey: 'help.docs.nav.customer.my_tickets',
    icon: Ticket,
    children: [
      {
        id: 'customer.my_tickets.create',
        labelKey: 'help.docs.nav.customer.my_tickets.create',
        contentKey: 'help.docs.customer.my_tickets',
        icon: Plus,
      },
      {
        id: 'customer.my_tickets.attachments',
        labelKey: 'help.docs.nav.customer.my_tickets.attachments',
        contentKey: 'help.docs.customer.my_tickets.attachments',
        icon: Paperclip,
      },
      {
        id: 'customer.my_tickets.tracking',
        labelKey: 'help.docs.nav.customer.my_tickets.tracking',
        contentKey: 'help.docs.customer.my_tickets.tracking',
        icon: Clock,
      },
    ],
  },
  {
    id: 'customer.knowledge_base',
    labelKey: 'help.docs.nav.customer.knowledge_base',
    icon: BookOpen,
    children: [
      {
        id: 'customer.knowledge_base.overview',
        labelKey: 'help.docs.nav.customer.knowledge_base.overview',
        contentKey: 'help.docs.customer.knowledge_base',
        icon: Library,
      },
    ],
  },
  {
    id: 'customer.profile',
    labelKey: 'help.docs.nav.customer.profile',
    icon: User,
    children: [
      {
        id: 'customer.profile.settings',
        labelKey: 'help.docs.nav.customer.profile.settings',
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
    id: 'admin.tickets',
    labelKey: 'help.docs.nav.admin.tickets',
    icon: ListChecks,
    children: [
      {
        id: 'admin.tickets.overview',
        labelKey: 'help.docs.nav.admin.tickets.overview',
        contentKey: 'help.docs.admin.tickets',
        icon: Inbox,
      },
      {
        id: 'admin.tickets.ai_copilot',
        labelKey: 'help.docs.nav.admin.tickets.ai_copilot',
        contentKey: 'help.docs.admin.tickets.ai_copilot',
        icon: Bot,
      },
      {
        id: 'admin.tickets.internal_notes',
        labelKey: 'help.docs.nav.admin.tickets.internal_notes',
        contentKey: 'help.docs.admin.tickets.internal_notes',
        icon: StickyNote,
      },
    ],
  },
  {
    id: 'admin.ai_knowledge',
    labelKey: 'help.docs.nav.admin.ai_knowledge',
    icon: Database,
    children: [
      {
        id: 'admin.ai_knowledge.pool',
        labelKey: 'help.docs.nav.admin.ai_knowledge.pool',
        contentKey: 'help.docs.admin.ai_knowledge',
        icon: HardDrive,
      },
      {
        id: 'admin.ai_knowledge.learning_cycle',
        labelKey: 'help.docs.nav.admin.ai_knowledge.learning_cycle',
        contentKey: 'help.docs.admin.ai_knowledge.learning_cycle',
        icon: RefreshCw,
      },
      {
        id: 'admin.ai_knowledge.approvals',
        labelKey: 'help.docs.nav.admin.ai_knowledge.approvals',
        contentKey: 'help.docs.admin.ai_knowledge.approvals',
        icon: CheckCircle,
      },
      {
        id: 'admin.ai_knowledge.faq',
        labelKey: 'help.docs.nav.admin.ai_knowledge.faq',
        contentKey: 'help.docs.admin.ai_knowledge.faq',
        icon: HelpCircle,
      },
    ],
  },
  {
    id: 'admin.crm_products',
    labelKey: 'help.docs.nav.admin.crm_products',
    icon: Layers,
    children: [
      {
        id: 'admin.crm_products.products',
        labelKey: 'help.docs.nav.admin.crm_products.products',
        contentKey: 'help.docs.admin.crm_products',
        icon: Package,
      },
      {
        id: 'admin.crm_products.taxonomy',
        labelKey: 'help.docs.nav.admin.crm_products.taxonomy',
        contentKey: 'help.docs.admin.crm_products.taxonomy',
        icon: Tag,
      },
    ],
  },
  {
    id: 'admin.team_customers',
    labelKey: 'help.docs.nav.admin.team_customers',
    icon: Users,
    children: [
      {
        id: 'admin.team_customers.customers',
        labelKey: 'help.docs.nav.admin.team_customers.customers',
        contentKey: 'help.docs.admin.team_customers',
        icon: UserCheck,
      },
      {
        id: 'admin.team_customers.teams',
        labelKey: 'help.docs.nav.admin.team_customers.teams',
        contentKey: 'help.docs.admin.team_customers.teams',
        icon: Building2,
      },
      {
        id: 'admin.team_customers.sla',
        labelKey: 'help.docs.nav.admin.team_customers.sla',
        contentKey: 'help.docs.admin.team_customers.sla',
        icon: Clock,
      },
    ],
  },
  {
    id: 'admin.announcements',
    labelKey: 'help.docs.nav.admin.announcements',
    icon: Megaphone,
    children: [
      {
        id: 'admin.announcements.overview',
        labelKey: 'help.docs.nav.admin.announcements.overview',
        contentKey: 'help.docs.admin.announcements',
        icon: Send,
      },
      {
        id: 'admin.announcements.templates',
        labelKey: 'help.docs.nav.admin.announcements.templates',
        contentKey: 'help.docs.admin.announcements.templates',
        icon: FileText,
      },
    ],
  },
  {
    id: 'admin.system_settings',
    labelKey: 'help.docs.nav.admin.system_settings',
    icon: Settings,
    children: [
      {
        id: 'admin.system_settings.topology',
        labelKey: 'help.docs.nav.admin.system_settings.topology',
        contentKey: 'help.docs.admin.system_settings',
        icon: Network,
      },
      {
        id: 'admin.system_settings.settings',
        labelKey: 'help.docs.nav.admin.system_settings.settings',
        contentKey: 'help.docs.admin.system_settings.settings',
        icon: Sliders,
      },
      {
        id: 'admin.system_settings.profile',
        labelKey: 'help.docs.nav.admin.system_settings.profile',
        contentKey: 'help.docs.admin.system_settings.profile',
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

  const STAFF_ROLES = ['admin', 'agent'];

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
