import type { LucideIcon } from 'lucide-react';

/**
 * A single navigable node in the documentation tree.
 * Can be a category (with children) or a leaf page (with contentKey).
 */
export interface DocNode {
  /** Unique identifier, e.g. 'customer.getting_started.dashboard' */
  id: string;
  /** i18n key for the sidebar label, e.g. 'help.docs.nav.customer.getting_started' */
  labelKey: string;
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Child nodes (sub-sections under a category) */
  children?: DocNode[];
  /**
   * i18n namespace for the content panel.
   * Present on leaf nodes only, e.g. 'help.docs.customer.getting_started'
   */
  contentKey?: string;
  /** Access control — which role(s) can see this node */
  role?: 'customer' | 'admin' | 'agent' | 'all';
}

/**
 * The full documentation tree split by audience.
 */
export interface DocTree {
  customer: DocNode[];
  admin: DocNode[];
}

/**
 * A single crumb in the breadcrumb trail.
 */
export interface BreadcrumbItem {
  /** Human-readable label (already translated) */
  label: string;
  /** If set, clicking this crumb navigates to the node */
  nodeId?: string;
}
