import { describe, it, expect } from 'vitest';
import {
  findNode,
  getBreadcrumbPath,
  isAdminOrAgent,
  buildDocTree,
  getAllNodeIds,
  CUSTOMER_TREE,
  ADMIN_TREE,
} from './doc-tree';
import type { DocNode, DocTree } from './types';

describe('doc-tree.ts helper functions', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // findNode tests (task 8.1)
  // ─────────────────────────────────────────────────────────────────────────

  describe('findNode', () => {
    it('finds root-level node', () => {
      const result = findNode(CUSTOMER_TREE, 'customer_getting_started');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('customer_getting_started');
    });

    it('finds nested child node', () => {
      const result = findNode(CUSTOMER_TREE, 'customer_getting_started_dashboard');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('customer_getting_started_dashboard');
    });

    it('returns null for non-existent node', () => {
      const result = findNode(CUSTOMER_TREE, 'nonexistent_node');
      expect(result).toBeNull();
    });

    it('finds in admin tree', () => {
      const result = findNode(ADMIN_TREE, 'admin_tickets_overview');
      expect(result).not.toBeNull();
    });

    it('finds in different trees independently', () => {
      // Each tree has its own nodes
      const customerResult = findNode(CUSTOMER_TREE, 'customer_getting_started_dashboard');
      const adminResult = findNode(ADMIN_TREE, 'admin_tickets_overview');
      expect(customerResult?.id).toBe('customer_getting_started_dashboard');
      expect(adminResult?.id).toBe('admin_tickets_overview');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getBreadcrumbPath tests (task 8.1, 8.7)
  // ─────────────────────────────────────────────────────────────────────────

  describe('getBreadcrumbPath', () => {
    it('returns single-item path for root node', () => {
      const result = getBreadcrumbPath(CUSTOMER_TREE, 'customer_getting_started');
      expect(result).toHaveLength(1);
      expect(result[0].nodeId).toBe('customer_getting_started');
    });

    it('returns full path for nested node', () => {
      const result = getBreadcrumbPath(
        CUSTOMER_TREE,
        'customer_my_tickets_attachments'
      );
      expect(result).toHaveLength(2);
      expect(result[0].nodeId).toBe('customer_my_tickets');
      expect(result[1].nodeId).toBe('customer_my_tickets_attachments');
    });

    it('returns empty array for non-existent node', () => {
      const result = getBreadcrumbPath(CUSTOMER_TREE, 'nonexistent_id');
      expect(result).toHaveLength(0);
    });

    it('preserves order from root to leaf', () => {
      const result = getBreadcrumbPath(CUSTOMER_TREE, 'customer_ai_assistant_overview');
      // root → category → leaf
      expect(result).toHaveLength(2);
      expect(result[0].nodeId).toBe('customer_ai_assistant');
      expect(result[1].nodeId).toBe('customer_ai_assistant_overview');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // isAdminOrAgent tests (task 8.1)
  // ─────────────────────────────────────────────────────────────────────────

  describe('isAdminOrAgent', () => {
    it('returns false for null user', () => {
      expect(isAdminOrAgent(null)).toBe(false);
    });

    it('returns true for admin role string', () => {
      expect(isAdminOrAgent({ role: 'admin' })).toBe(true);
    });

    it('returns true for agent role string', () => {
      expect(isAdminOrAgent({ role: 'agent' })).toBe(true);
    });

    it('returns false for customer role', () => {
      expect(isAdminOrAgent({ role: 'customer' })).toBe(false);
    });

    it('returns false for viewer role', () => {
      expect(isAdminOrAgent({ role: 'viewer' })).toBe(false);
    });

    it('is case-insensitive for role string', () => {
      expect(isAdminOrAgent({ role: 'ADMIN' })).toBe(true);
      expect(isAdminOrAgent({ role: 'Agent' })).toBe(true);
    });

    it('checks roles array for admin', () => {
      expect(isAdminOrAgent({ roles: ['admin'] })).toBe(true);
    });

    it('checks roles array for agent', () => {
      expect(isAdminOrAgent({ roles: ['agent'] })).toBe(true);
    });

    it('checks roles array for multiple roles', () => {
      expect(isAdminOrAgent({ roles: ['viewer', 'agent'] })).toBe(true);
    });

    it('is case-insensitive for roles array', () => {
      expect(isAdminOrAgent({ roles: ['ADMIN'] })).toBe(true);
    });

    it.each(['SUPER_ADMIN', 'SUPPORT_AGENT', 'SENIOR_AGENT', 'TEAM_LEAD', 'DEPARTMENT_MANAGER', 'MANAGER'])('recognizes canonical staff role %s', (role) => {
      expect(isAdminOrAgent({ role })).toBe(true);
    });

    it('returns false for roles array without staff role', () => {
      expect(isAdminOrAgent({ roles: ['customer', 'viewer'] })).toBe(false);
    });

    it('returns true if either role or roles array has staff', () => {
      // If either has staff role, returns true
      expect(isAdminOrAgent({ role: 'customer', roles: ['admin'] })).toBe(true);
      expect(isAdminOrAgent({ role: 'admin', roles: ['viewer'] })).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // buildDocTree tests (task 8.1)
  // ─────────────────────────────────────────────────────────────────────────

  describe('buildDocTree', () => {
    it('returns customer tree only for non-staff', () => {
      const result = buildDocTree(false);
      expect(result.customer).toHaveLength(CUSTOMER_TREE.length);
      expect(result.admin).toHaveLength(0);
    });

    it('returns both trees for staff', () => {
      const result = buildDocTree(true);
      expect(result.customer).toHaveLength(CUSTOMER_TREE.length);
      expect(result.admin).toHaveLength(ADMIN_TREE.length);
    });

    it('returns same customer tree reference', () => {
      const result = buildDocTree(true);
      expect(result.customer).toBe(CUSTOMER_TREE);
    });

    it('returns admin tree for staff', () => {
      const result = buildDocTree(true);
      expect(result.admin).toBe(ADMIN_TREE);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getAllNodeIds tests (task 8.1, 8.6)
  // ─────────────────────────────────────────────────────────────────────────

  describe('getAllNodeIds', () => {
    it('collects all leaf node IDs from customer tree', () => {
      const tree: DocTree = { customer: CUSTOMER_TREE, admin: [] };
      const ids = getAllNodeIds(tree);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain('customer_getting_started_dashboard');
    });

    it('collects all leaf node IDs from admin tree', () => {
      const tree: DocTree = { customer: [], admin: ADMIN_TREE };
      const ids = getAllNodeIds(tree);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain('admin_tickets_overview');
    });

    it('collects from both trees when combined', () => {
      const tree: DocTree = { customer: CUSTOMER_TREE, admin: ADMIN_TREE };
      const ids = getAllNodeIds(tree);
      const customerIds = getAllNodeIds({ customer: CUSTOMER_TREE, admin: [] });
      const adminIds = getAllNodeIds({ customer: [], admin: ADMIN_TREE });
      expect(ids.length).toBe(customerIds.length + adminIds.length);
    });

    it('returns unique IDs (no duplicates)', () => {
      const tree: DocTree = { customer: CUSTOMER_TREE, admin: ADMIN_TREE };
      const ids = getAllNodeIds(tree);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
