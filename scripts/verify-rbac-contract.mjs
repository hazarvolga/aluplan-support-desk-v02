import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const contractPath = path.join(
  projectDirectory,
  "packages/database/prisma/rbac-canonical.json",
);
const controllersDirectory = path.join(projectDirectory, "apps/backend/src");

export function normalizeRoleName(roleName) {
  return String(roleName).trim().replace(/-/g, "_").toUpperCase();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function decoratorName(expression) {
  if (!ts.isCallExpression(expression)) return null;
  if (ts.isIdentifier(expression.expression)) return expression.expression.text;
  return null;
}

export function extractRbacDecoratorsFromSource(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const roles = [];
  const permissions = [];
  const nonLiteralDecorators = [];

  function visit(node) {
    const decorators = ts.canHaveDecorators(node)
      ? (ts.getDecorators(node) ?? [])
      : [];

    for (const decorator of decorators) {
      const expression = decorator.expression;
      const name = decoratorName(expression);
      if (name !== "Roles" && name !== "RequirePermissions") continue;

      for (const argument of expression.arguments) {
        if (
          ts.isStringLiteral(argument) ||
          ts.isNoSubstitutionTemplateLiteral(argument)
        ) {
          if (name === "Roles") roles.push(normalizeRoleName(argument.text));
          else permissions.push(argument.text);
          continue;
        }

        const position = sourceFile.getLineAndCharacterOfPosition(
          argument.getStart(sourceFile),
        );
        nonLiteralDecorators.push(
          `${fileName}:${position.line + 1} @${name}(${argument.getText(sourceFile)})`,
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return {
    permissions: uniqueSorted(permissions),
    roles: uniqueSorted(roles),
    nonLiteralDecorators: uniqueSorted(nonLiteralDecorators),
  };
}

function assertUnique(values, label) {
  const duplicates = uniqueSorted(
    values.filter((value, index) => values.indexOf(value) !== index),
  );
  if (duplicates.length > 0) {
    throw new Error(
      `Canonical RBAC contract has duplicate ${label}: ${duplicates.join(", ")}`,
    );
  }
}

export function validateCanonicalContract(contract) {
  if (!Number.isInteger(contract?.version) || contract.version < 1) {
    throw new Error(
      "Canonical RBAC contract version must be a positive integer",
    );
  }

  const roles = contract.roles?.map(normalizeRoleName) ?? [];
  const permissions =
    contract.permissions?.map((permission) => permission.name) ?? [];
  assertUnique(roles, "roles");
  assertUnique(permissions, "permissions");

  const roleSet = new Set(roles);
  const permissionSet = new Set(permissions);
  for (const permission of contract.permissions ?? []) {
    if (!permission.name || !permission.group || !permission.description) {
      throw new Error(
        "Every canonical permission requires name, group, and description",
      );
    }
  }

  for (const [rawRole, assignedPermissions] of Object.entries(
    contract.rolePermissions ?? {},
  )) {
    const role = normalizeRoleName(rawRole);
    if (!roleSet.has(role)) {
      throw new Error(
        `Canonical role permission mapping references unknown role: ${role}`,
      );
    }
    assertUnique(assignedPermissions, `${role} permissions`);
    const unknown = assignedPermissions.filter(
      (permission) => !permissionSet.has(permission),
    );
    if (unknown.length > 0) {
      throw new Error(
        `${role} references unknown permissions: ${unknown.join(", ")}`,
      );
    }
  }

  for (const [rawRole, boundary] of Object.entries(
    contract.roleBoundaries ?? {},
  )) {
    const role = normalizeRoleName(rawRole);
    const assigned = new Set(contract.rolePermissions?.[role] ?? []);
    const missing = (boundary.required ?? []).filter(
      (permission) => !assigned.has(permission),
    );
    const forbidden = (boundary.forbidden ?? []).filter((permission) =>
      assigned.has(permission),
    );
    if (missing.length > 0) {
      throw new Error(
        `${role} is missing required permission: ${missing.join(", ")}`,
      );
    }
    if (forbidden.length > 0) {
      throw new Error(
        `${role} has forbidden permission: ${forbidden.join(", ")}`,
      );
    }
  }

  return contract;
}

export function verifySourceSnapshot(contract, snapshot) {
  validateCanonicalContract(contract);
  if (snapshot.nonLiteralDecorators.length > 0) {
    throw new Error(
      `Non-literal RBAC decorators are forbidden: ${snapshot.nonLiteralDecorators.join(", ")}`,
    );
  }

  const knownPermissions = new Set(
    contract.permissions.map((permission) => permission.name),
  );
  const knownRoles = new Set(contract.roles.map(normalizeRoleName));
  const unknownPermissions = snapshot.permissions.filter(
    (permission) => !knownPermissions.has(permission),
  );
  const unknownRoles = snapshot.roles
    .map(normalizeRoleName)
    .filter((role) => !knownRoles.has(role));

  if (unknownPermissions.length > 0 || unknownRoles.length > 0) {
    throw new Error(
      `Unknown permissions: ${uniqueSorted(unknownPermissions).join(", ") || "-"}; ` +
        `unknown roles: ${uniqueSorted(unknownRoles).join(", ") || "-"}`,
    );
  }

  return snapshot;
}

export function verifyDatabaseSnapshot(contract, snapshot) {
  validateCanonicalContract(contract);
  const databasePermissions = new Set(snapshot.permissions);
  const missingPermissions = contract.permissions
    .map((permission) => permission.name)
    .filter((permission) => !databasePermissions.has(permission));
  if (missingPermissions.length > 0) {
    throw new Error(
      `Database is missing canonical permissions: ${missingPermissions.join(", ")}`,
    );
  }

  for (const [rawRole, expectedPermissions] of Object.entries(
    contract.rolePermissions,
  )) {
    const role = normalizeRoleName(rawRole);
    const actualPermissions = uniqueSorted(
      snapshot.rolePermissions[role] ?? [],
    );
    const expected = uniqueSorted(expectedPermissions);
    const missing = expected.filter(
      (permission) => !actualPermissions.includes(permission),
    );
    const unexpected = actualPermissions.filter(
      (permission) => !expected.includes(permission),
    );
    if (missing.length > 0) {
      throw new Error(`${role} is missing permission: ${missing.join(", ")}`);
    }
    if (unexpected.length > 0) {
      throw new Error(
        `${role} has unexpected permission: ${unexpected.join(", ")}`,
      );
    }
  }

  return snapshot;
}

async function listControllerFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listControllerFiles(entryPath);
      if (entry.isFile() && entry.name.endsWith(".controller.ts"))
        return [entryPath];
      return [];
    }),
  );
  return nested.flat().sort((left, right) => left.localeCompare(right));
}

async function loadContract() {
  return validateCanonicalContract(
    JSON.parse(await readFile(contractPath, "utf8")),
  );
}

async function buildSourceSnapshot() {
  const aggregate = {
    permissions: [],
    roles: [],
    nonLiteralDecorators: [],
  };
  for (const controllerPath of await listControllerFiles(
    controllersDirectory,
  )) {
    const relativePath = path.relative(projectDirectory, controllerPath);
    const snapshot = extractRbacDecoratorsFromSource(
      await readFile(controllerPath, "utf8"),
      relativePath,
    );
    aggregate.permissions.push(...snapshot.permissions);
    aggregate.roles.push(...snapshot.roles);
    aggregate.nonLiteralDecorators.push(...snapshot.nonLiteralDecorators);
  }
  return {
    permissions: uniqueSorted(aggregate.permissions),
    roles: uniqueSorted(aggregate.roles),
    nonLiteralDecorators: uniqueSorted(aggregate.nonLiteralDecorators),
  };
}

async function loadDatabaseSnapshot(databaseUrl) {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const permissions = await client.query(
      "SELECT name FROM permissions ORDER BY name",
    );
    const mappings = await client.query(
      `SELECT r.name AS role_name, p.name AS permission_name
             FROM roles r
             LEFT JOIN role_permissions rp ON rp.role_id = r.id
             LEFT JOIN permissions p ON p.id = rp.permission_id
             ORDER BY r.name, p.name`,
    );
    const rolePermissions = {};
    for (const row of mappings.rows) {
      const role = normalizeRoleName(row.role_name);
      rolePermissions[role] ??= [];
      if (row.permission_name) rolePermissions[role].push(row.permission_name);
    }
    return {
      permissions: permissions.rows.map((row) => row.name),
      rolePermissions,
    };
  } finally {
    await client.end();
  }
}

async function main() {
  const contract = await loadContract();
  const sourceSnapshot = verifySourceSnapshot(
    contract,
    await buildSourceSnapshot(),
  );
  console.log(
    `RBAC source contract verified: roles=${sourceSnapshot.roles.length}, permissions=${sourceSnapshot.permissions.length}`,
  );

  if (process.argv.includes("--database")) {
    if (!process.env.DATABASE_URL) {
      const { config } = await import("dotenv");
      config({ path: path.join(projectDirectory, ".env") });
    }
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for --database verification");
    }
    const databaseSnapshot = await loadDatabaseSnapshot(
      process.env.DATABASE_URL,
    );
    verifyDatabaseSnapshot(contract, databaseSnapshot);
    console.log("RBAC database contract verified");
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
