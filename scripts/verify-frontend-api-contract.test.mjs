import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeContractPath,
  operationMatches,
  verifyOperationSet,
} from './verify-frontend-api-contract.mjs';

test('normalizes query strings and dynamic path parameters', () => {
  assert.equal(normalizeContractPath('/tickets/${id}/messages?limit=${limit}'), '/tickets/{param}/messages');
  assert.equal(normalizeContractPath('/tickets{query}'), '/tickets');
  assert.equal(normalizeContractPath('/files${id}'), '/files{param}');
  assert.equal(normalizeContractPath('/api/v1/products/{id}'), '/products/{param}');
});

test('matches frontend parameters to OpenAPI parameters but preserves HTTP methods', () => {
  assert.equal(operationMatches(
    { method: 'POST', path: '/tickets/{param}/messages' },
    { method: 'POST', path: '/tickets/{param}/messages' },
  ), true);
  assert.equal(operationMatches(
    { method: 'GET', path: '/tickets/{param}/messages' },
    { method: 'POST', path: '/tickets/{param}/messages' },
  ), false);
  assert.equal(operationMatches(
    { method: 'GET', path: '/users/me' },
    { method: 'GET', path: '/users/{param}' },
  ), false);
});

test('reports unknown frontend operations unless an explained allowlist entry exists', () => {
  const frontend = [
    { method: 'POST', path: '/crm/connections', source: 'api.ts:10' },
    { method: 'POST', path: '/auth/mfa/setup', source: 'api.ts:20' },
  ];
  const backend = [{ method: 'POST', path: '/crm/connections' }];

  assert.deepEqual(verifyOperationSet(frontend, backend, []), [frontend[1]]);
  assert.deepEqual(verifyOperationSet(frontend, backend, [{
    method: 'POST',
    path: '/auth/mfa/setup',
    reason: 'Temporary compatibility contract',
  }]), []);
  assert.throws(() => verifyOperationSet(frontend, backend, [{
    method: 'POST',
    path: '/auth/mfa/setup',
    reason: '',
  }]), /reason/);
});
