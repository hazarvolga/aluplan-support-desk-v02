import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND_SRC = path.join(ROOT, 'apps/frontend/src');
const DASHBOARD_SRC = path.join(FRONTEND_SRC, 'app/[locale]/(dashboard)');
const OPENAPI_PATH = path.join(ROOT, 'apps/backend/openapi.json');
const ALLOWLIST_PATH = path.join(ROOT, 'scripts/frontend-api-contract-allowlist.json');
const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export function normalizeContractPath(input) {
  const withoutOrigin = input.replace(/^https?:\/\/[^/]+/i, '');
  const withoutPrefix = withoutOrigin.replace(/^\/api\/v1(?=\/|$)/, '');
  const withoutQuery = withoutPrefix.split('?')[0];
  const normalizedParams = withoutQuery
    .replace(/\{query\}/g, '')
    .replace(/\$\{[^}]+\}/g, '{param}')
    .replace(/\{[^}/]+\}/g, '{param}')
    .replace(/\*[^/]+/g, '{param}');
  const normalizedSlashes = normalizedParams.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return normalizedSlashes || '/';
}

export function operationMatches(frontendOperation, backendOperation) {
  if (frontendOperation.method !== backendOperation.method) return false;
  const frontendSegments = normalizeContractPath(frontendOperation.path).split('/').filter(Boolean);
  const backendSegments = normalizeContractPath(backendOperation.path).split('/').filter(Boolean);
  if (frontendSegments.length !== backendSegments.length) return false;
  return frontendSegments.every((segment, index) => (
    segment === backendSegments[index]
    || (segment === '{param}' && backendSegments[index] === '{param}')
  ));
}

export function verifyOperationSet(frontendOperations, backendOperations, allowlistEntries) {
  for (const entry of allowlistEntries) {
    if (!entry.reason || !entry.reason.trim()) {
      throw new Error(`Frontend API allowlist entry requires a reason: ${entry.method} ${entry.path}`);
    }
  }

  return frontendOperations.filter((frontendOperation) => {
    const exists = backendOperations.some((backendOperation) => operationMatches(frontendOperation, backendOperation));
    if (exists) return false;
    return !allowlistEntries.some((entry) => operationMatches(frontendOperation, {
      method: entry.method.toUpperCase(),
      path: entry.path,
    }));
  });
}

function walkSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkSourceFiles(absolute);
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.(spec|test)\.(ts|tsx)$/.test(entry.name)) return [];
    return [absolute];
  });
}

function staticPathFromExpression(expression) {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (!ts.isTemplateExpression(expression)) return null;
  return expression.templateSpans.reduce(
    (value, span) => {
      const expressionText = span.expression.getText();
      const isQuerySuffix = /^(?:q|query|queryString|querySuffix)$/i.test(expressionText)
        || expressionText.includes('?');
      return `${value}${isQuerySuffix ? '{query}' : '{param}'}${span.literal.text}`;
    },
    expression.head.text,
  );
}

function methodFromOptions(options, fallback = 'GET') {
  if (!options || !ts.isObjectLiteralExpression(options)) return fallback;
  const methodProperty = options.properties.find((property) => (
    ts.isPropertyAssignment(property)
    && property.name.getText().replace(/['"]/g, '') === 'method'
  ));
  if (!methodProperty || !ts.isPropertyAssignment(methodProperty)) return fallback;
  if (!ts.isStringLiteral(methodProperty.initializer)) return fallback;
  return methodProperty.initializer.text.toUpperCase();
}

function extractFrontendOperations() {
  const operations = [];
  for (const filename of walkSourceFiles(FRONTEND_SRC)) {
    const source = fs.readFileSync(filename, 'utf8');
    const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
    const relative = path.relative(ROOT, filename);

    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        let method = null;
        let pathExpression = null;

        if (ts.isIdentifier(node.expression) && ['request', 'downloadRequest'].includes(node.expression.text)) {
          method = node.expression.text === 'downloadRequest' ? 'GET' : methodFromOptions(node.arguments[1]);
          pathExpression = node.arguments[0];
        } else if (
          ts.isPropertyAccessExpression(node.expression)
          && ts.isIdentifier(node.expression.expression)
          && node.expression.expression.text === 'api'
          && ['get', 'post', 'patch', 'delete'].includes(node.expression.name.text)
        ) {
          method = node.expression.name.text.toUpperCase();
          pathExpression = node.arguments[0];
        }

        const staticPath = pathExpression ? staticPathFromExpression(pathExpression) : null;
        if (method && HTTP_METHODS.has(method) && staticPath?.startsWith('/')) {
          const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          operations.push({
            method,
            path: normalizeContractPath(staticPath),
            source: `${relative}:${location.line + 1}`,
          });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return operations;
}

function extractBackendOperations() {
  const openapi = JSON.parse(fs.readFileSync(OPENAPI_PATH, 'utf8'));
  return Object.entries(openapi.paths).flatMap(([operationPath, definitions]) => (
    Object.keys(definitions)
      .map((method) => method.toUpperCase())
      .filter((method) => HTTP_METHODS.has(method))
      .map((method) => ({ method, path: normalizeContractPath(operationPath) }))
  ));
}

function enclosingFunctionName(node) {
  let current = node.parent;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if ((ts.isFunctionExpression(current) || ts.isArrowFunction(current)) && current.parent) {
      if (ts.isVariableDeclaration(current.parent) && ts.isIdentifier(current.parent.name)) {
        return current.parent.name.text;
      }
      if (ts.isPropertyAssignment(current.parent)) return current.parent.name.getText().replace(/['"]/g, '');
    }
    if (ts.isMethodDeclaration(current) && current.name) return current.name.getText().replace(/['"]/g, '');
    current = current.parent;
  }
  return '<module>';
}

function networkCallee(node) {
  if (!ts.isCallExpression(node)) return null;
  if (ts.isIdentifier(node.expression) && ['fetch', 'axios'].includes(node.expression.text)) {
    return node.expression.text;
  }
  if (ts.isPropertyAccessExpression(node.expression)) {
    const owner = node.expression.expression.getText();
    const method = node.expression.name.text;
    if ((owner === 'window' || owner === 'globalThis') && method === 'fetch') return `${owner}.fetch`;
    if (owner === 'axios') return `axios.${method}`;
  }
  return null;
}

function findDashboardRawNetworkCalls(allowlistEntries) {
  for (const entry of allowlistEntries) {
    if (!entry.reason?.trim() || !entry.file || !entry.function || !entry.callee) {
      throw new Error(`Raw network allowlist entry requires file, function, callee and reason: ${entry.file ?? '<unknown>'}`);
    }
  }
  const violations = [];

  for (const filename of walkSourceFiles(DASHBOARD_SRC)) {
    const relative = path.relative(ROOT, filename);
    const source = fs.readFileSync(filename, 'utf8');
    const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      const callee = networkCallee(node);
      if (callee) {
        const functionName = enclosingFunctionName(node);
        const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const allowed = allowlistEntries.some((entry) => (
          entry.file === relative && entry.function === functionName && entry.callee === callee
        ));
        if (!allowed) violations.push(`${relative}:${location.line + 1} (${functionName}, ${callee})`);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return violations;
}

function run() {
  const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  const frontendOperations = extractFrontendOperations();
  const backendOperations = extractBackendOperations();
  const unknownOperations = verifyOperationSet(frontendOperations, backendOperations, allowlist.operations ?? []);
  const rawFetchViolations = findDashboardRawNetworkCalls(allowlist.rawNetworkCalls ?? []);

  if (unknownOperations.length || rawFetchViolations.length) {
    for (const operation of unknownOperations) {
      console.error(`[frontend-api-contract] Missing backend operation: ${operation.method} ${operation.path} (${operation.source})`);
    }
    for (const source of rawFetchViolations) {
      console.error(`[frontend-api-route-contract] Dashboard raw network call must use the central API client: ${source}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[frontend-api-route-contract] PASS: frontend=${frontendOperations.length}, openapi=${backendOperations.length}, missing=0, raw-network=0`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
