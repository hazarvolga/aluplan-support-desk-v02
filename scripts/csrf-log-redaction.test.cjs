'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Execute only the actual inline middleware, never import main.ts/bootstrap or AppModule.
const source = fs.readFileSync(path.join(__dirname, '../apps/backend/src/main.ts'), 'utf8');
const ast = ts.createSourceFile('main.ts', source, ts.ScriptTarget.Latest, true);
const matches = [];
function visit(node) {
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
    && node.expression.expression.getText(ast) === 'app' && node.expression.name.text === 'use'
    && node.arguments.length === 1 && ts.isArrowFunction(node.arguments[0])) {
    const arrow = node.arguments[0];
    if (arrow.body.statements?.some(statement => ts.isVariableStatement(statement)
      && statement.declarationList.declarations.some(declaration => declaration.name.getText(ast) === 'csrfBypassPaths'))) matches.push(arrow);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
assert.equal(matches.length, 1, 'Expected exactly one inline CSRF middleware');
const compiled = ts.transpileModule(`(${matches[0].getText(ast)})`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

function exercise(options = {}) {
  const { method, pathname, cookie, header, requestedWith, production } = {
    method: 'POST', pathname: '/api/v1/tickets/private-path-canary', cookie: 'cookie-canary',
    header: 'header-canary', production: true, ...options,
  };
  const warnings = [], cookies = [];
  let status, body, nextCalls = 0;
  const middleware = vm.runInNewContext(compiled, {
    configService: { get: name => { assert.equal(name, 'NODE_ENV'); return production ? 'production' : 'development'; } },
    logger: { warn: (...args) => warnings.push(args) },
    crypto: { randomBytes: size => { assert.equal(size, 32); return Buffer.alloc(32, 7); } },
  }, { timeout: 1000 });
  const req = { method, path: pathname, cookies: cookie ? { 'XSRF-TOKEN': cookie } : {},
    headers: { 'x-xsrf-token': header, 'x-requested-with': requestedWith, authorization: 'authorization-canary' } };
  const res = { cookie: (...args) => cookies.push(args), status: value => { status = value; return res; },
    json: value => { body = JSON.parse(JSON.stringify(value)); return res; } };
  middleware(req, res, () => { nextCalls += 1; });
  return { warnings, cookies: JSON.parse(JSON.stringify(cookies)), status, body, nextCalls };
}

test('mismatched or missing CSRF headers retain403 and emit only a fixed rejection reason', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    for (const header of [undefined, '', 'header-canary', ['cookie-canary']]) {
      const result = exercise({ method, header, requestedWith: 'requested-with-canary' });
      assert.equal(result.status, 403);
      assert.deepEqual(result.body, { statusCode: 403, message: 'CSRF validation failed', error: 'Forbidden' });
      assert.equal(result.nextCalls, 0);
      assert.deepEqual(result.warnings, [['[CSRF] REJECTED - CSRF token missing or mismatched']]);
    }
  }
});

test('missing or wrong custom header retains403 without exposing request material', () => {
  for (const requestedWith of [undefined, '', 'requested-with-canary', ['XMLHttpRequest']]) {
    const result = exercise({ header: 'cookie-canary', requestedWith });
    assert.equal(result.status, 403);
    assert.deepEqual(result.body, { statusCode: 403, message: 'Missing required security headers', error: 'Forbidden' });
    assert.equal(result.nextCalls, 0);
    assert.deepEqual(result.warnings, [['[CSRF] REJECTED - Missing required security headers']]);
  }
});

test('new CSRF cookies preserve environment-specific attributes without logging their value', () => {
  for (const production of [true, false]) {
    const result = exercise({ cookie: null, production });
    assert.equal(result.status, 403);
    const options = { httpOnly: false, secure: production, sameSite: 'lax', path: '/',
      ...(production ? { domain: '.allplan.net.tr' } : {}) };
    assert.deepEqual(result.cookies, [['XSRF-TOKEN', Buffer.alloc(32, 7).toString('hex'), options]]);
    assert.deepEqual(result.warnings, [['[CSRF] REJECTED - CSRF token missing or mismatched']]);
    assert.equal(result.nextCalls, 0);
  }
});

test('valid protected writes, existing auth bypasses and safe reads remain unchanged', () => {
  const cases = ['POST', 'PUT', 'PATCH', 'DELETE'].map(method => ({method,header:'cookie-canary',requestedWith:'XMLHttpRequest'}));
  for (const route of ['login','refresh','logout','forgot-password','resend-verification','reset-password','verify-email']) {
    cases.push({ pathname: `/api/v1/auth/${route}` });
  }
  cases.push({pathname:'/api/v1/email/unsubscribe'}, ...['GET','HEAD','OPTIONS'].map(method=>({method})));
  for (const input of cases) {
    const result = exercise(input);
    assert.equal(result.nextCalls, 1);
    assert.equal(result.status, undefined);
    assert.equal(result.body, undefined);
    assert.deepEqual(result.warnings, []);
  }
});
