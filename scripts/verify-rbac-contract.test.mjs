import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import {
  extractRbacDecoratorsFromSource,
  normalizeRoleName,
  validateCanonicalContract,
  verifyDatabaseSnapshot,
  verifySourceSnapshot,
} from "./verify-rbac-contract.mjs";

const canonicalContract = Object.freeze({
  version: 1,
  roles: ["ADMIN", "SUPPORT_AGENT", "CUSTOMER"],
  permissions: [
    ["*", "ADMIN"],
    ["ticket:read", "TICKETS"],
    ["ticket:close", "TICKETS"],
    ["kb:read", "KNOWLEDGE"],
    ["kb:approve", "KNOWLEDGE"],
    ["kb:delete", "KNOWLEDGE"],
    ["faq:manage", "KNOWLEDGE"],
    ["settings:write", "ADMIN"],
    ["users:manage", "ADMIN"],
  ].map(([name, group]) => ({
    name,
    group,
    description: `${name} test permission`,
  })),
  rolePermissions: {
    ADMIN: ["*"],
    SUPPORT_AGENT: [
      "ticket:read",
      "ticket:close",
      "kb:read",
      "kb:approve",
      "faq:manage",
    ],
    CUSTOMER: ["ticket:read", "kb:read"],
  },
  roleBoundaries: {
    SUPPORT_AGENT: {
      required: ["ticket:close", "kb:approve", "faq:manage"],
      forbidden: ["*", "kb:delete", "settings:write", "users:manage"],
    },
  },
});

test("normalizes role aliases to the canonical uppercase underscore form", () => {
  assert.equal(normalizeRoleName("support-agent"), "SUPPORT_AGENT");
  assert.equal(normalizeRoleName("support_agent"), "SUPPORT_AGENT");
  assert.equal(normalizeRoleName("SUPPORT_AGENT"), "SUPPORT_AGENT");
});

test("extracts only executable RBAC decorators through the TypeScript AST", () => {
  const source = `
        // @Roles('COMMENT_ONLY')
        @Controller('example')
        @Roles('admin', 'support-agent')
        export class ExampleController {
            @Get()
            @RequirePermissions('ticket:read', 'ticket:close')
            list() {}
        }
    `;

  assert.deepEqual(
    extractRbacDecoratorsFromSource(source, "example.controller.ts"),
    {
      permissions: ["ticket:close", "ticket:read"],
      roles: ["ADMIN", "SUPPORT_AGENT"],
      nonLiteralDecorators: [],
    },
  );
});

test("rejects canonical role mappings that violate SUPPORT_AGENT boundaries", () => {
  const unsafeContract = structuredClone(canonicalContract);
  unsafeContract.rolePermissions.SUPPORT_AGENT.push("kb:delete");

  assert.throws(
    () => validateCanonicalContract(unsafeContract),
    /SUPPORT_AGENT.*forbidden permission.*kb:delete/i,
  );
});

test("fails when source code requests an unknown role or permission", () => {
  assert.throws(
    () =>
      verifySourceSnapshot(canonicalContract, {
        permissions: ["ticket:read", "ticket:unknown"],
        roles: ["ADMIN", "UNKNOWN_ROLE"],
        nonLiteralDecorators: [],
      }),
    /unknown permissions.*ticket:unknown.*unknown roles.*UNKNOWN_ROLE/is,
  );
});

test("fails closed when an RBAC decorator contains a non-literal value", () => {
  assert.throws(
    () =>
      verifySourceSnapshot(canonicalContract, {
        permissions: ["ticket:read"],
        roles: ["ADMIN"],
        nonLiteralDecorators: ["example.controller.ts:4 @Roles(dynamicRole)"],
      }),
    /non-literal RBAC decorators/i,
  );
});

test("database verification requires the exact SUPPORT_AGENT permission boundary", () => {
  const validSnapshot = {
    permissions: canonicalContract.permissions.map(({ name }) => name),
    rolePermissions: structuredClone(canonicalContract.rolePermissions),
  };

  assert.doesNotThrow(() =>
    verifyDatabaseSnapshot(canonicalContract, validSnapshot),
  );

  const overPrivileged = structuredClone(validSnapshot);
  overPrivileged.rolePermissions.SUPPORT_AGENT.push("users:manage");
  assert.throws(
    () => verifyDatabaseSnapshot(canonicalContract, overPrivileged),
    /SUPPORT_AGENT.*unexpected permission.*users:manage/i,
  );
});

test("real canonical contract rejects CUSTOMER0 and excess CUSTOMER grants", async () => {
  const contract = JSON.parse(await readFile(
    new URL('../packages/database/prisma/rbac-canonical.json', import.meta.url),
    'utf8',
  ));
  const validSnapshot = {
    permissions: contract.permissions.map(({ name }) => name),
    rolePermissions: structuredClone(contract.rolePermissions),
  };
  assert.doesNotThrow(() => verifyDatabaseSnapshot(contract, validSnapshot));

  const emptyCustomer = structuredClone(validSnapshot);
  emptyCustomer.rolePermissions.CUSTOMER = [];
  assert.throws(() => verifyDatabaseSnapshot(contract, emptyCustomer), /CUSTOMER.*missing permission/i);

  for (const extra of ['faq:read', 'faq:review', 'faq:manage', '*', 'users:manage']) {
    const excessCustomer = structuredClone(validSnapshot);
    excessCustomer.rolePermissions.CUSTOMER = [...(excessCustomer.rolePermissions.CUSTOMER ?? []), extra];
    assert.throws(() => verifyDatabaseSnapshot(contract, excessCustomer), /CUSTOMER.*unexpected permission/i);
  }
});
