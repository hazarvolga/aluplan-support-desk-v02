-- GAP-11: Soft Delete Remediation
-- deleted_at columns already exist from baseline migration;
-- this migration ensures Prisma schema tracking is consistent.
SELECT 1;
