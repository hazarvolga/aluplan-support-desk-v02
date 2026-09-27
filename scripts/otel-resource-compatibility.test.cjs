'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const ts = require('typescript');

const backendRequire = createRequire(path.join(__dirname, '../apps/backend/package.json'));
// Only passive resource libraries are real; never load SDKs, exporters or instrumentations.
const resources = backendRequire('@opentelemetry/resources');
const conventions = backendRequire('@opentelemetry/semantic-conventions');
const sourcePath = path.join(__dirname, '../apps/backend/src/otel.ts');
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

function exercise(env = {}, startError) {
  const observed = { sdkOptions: [], exporterOptions: [], instrumentationOptions: [],
    starts: 0, logs: [], errors: [], handlers: [], exits: [] };
  class MockNodeSDK {
    constructor(options) { observed.sdkOptions.push(options); }
    start() {
      observed.starts += 1;
      if (startError) throw startError;
    }
    shutdown() { throw new Error('Shutdown must not run during isolated initialization'); }
  }
  class MockExporter {
    constructor(options) { observed.exporterOptions.push(options); }
  }
  class MockLogger {
    constructor(context) { assert.equal(context, 'OTel'); }
    log(...args) { observed.logs.push(args); }
    error(...args) { observed.errors.push(args); }
  }
  const allowed = new Map([
    ['@opentelemetry/resources', resources],
    ['@opentelemetry/semantic-conventions', conventions],
    ['@opentelemetry/sdk-node', { NodeSDK: MockNodeSDK }],
    ['@opentelemetry/exporter-trace-otlp-http', { OTLPTraceExporter: MockExporter }],
    ['@opentelemetry/auto-instrumentations-node', {
      getNodeAutoInstrumentations(options) {
        observed.instrumentationOptions.push(options);
        return 'mock-instrumentations';
      },
    }],
    ['@nestjs/common', { Logger: MockLogger }],
  ]);
  const fakeProcess = {
    env: Object.freeze({ ...env }),
    on: (signal, callback) => observed.handlers.push({ signal, callback }),
    exit: code => observed.exits.push(code),
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, Error, process: fakeProcess,
    require(name) {
      assert.ok(allowed.has(name), `Unexpected import: ${name}`);
      return allowed.get(name);
    },
  }, { filename: sourcePath, timeout: 1000 });
  assert.equal(observed.sdkOptions.length, 1);
  assert.equal(observed.exporterOptions.length, 1);
  assert.equal(observed.starts, 1);
  assert.ok(exports.default instanceof MockNodeSDK);
  assert.deepEqual(observed.handlers.map(({ signal }) => signal), ['SIGTERM']);
  assert.deepEqual(observed.exits, []);
  assert.equal(observed.instrumentationOptions.length, 1);
  assert.equal(observed.instrumentationOptions[0]['@opentelemetry/instrumentation-fs'].enabled, false);
  assert.equal(observed.sdkOptions[0].instrumentations[0], 'mock-instrumentations');
  return observed;
}

test('actual OTel source creates a compatible resource with existing defaults', () => {
  for (const env of [{}, { NODE_ENV: '', OTEL_EXPORTER_OTLP_ENDPOINT: '' }]) {
    const result = exercise(env);
    assert.deepEqual({ ...result.sdkOptions[0].resource.attributes }, {
      'service.name': 'aluplan-backend',
      'service.version': '1.0.0',
      'deployment.environment': 'development',
    });
    assert.equal(result.exporterOptions[0].url, 'http://tempo:4318/v1/traces');
    assert.equal(result.logs.length, 1);
    assert.deepEqual(result.errors, []);
  }
});

test('actual OTel source preserves explicit environment and exporter settings', () => {
  const result = exercise({ NODE_ENV: 'staging',
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://telemetry.invalid:4318/custom-traces' });
  assert.deepEqual({ ...result.sdkOptions[0].resource.attributes }, {
    'service.name': 'aluplan-backend',
    'service.version': '1.0.0',
    'deployment.environment': 'staging',
  });
  assert.equal(result.exporterOptions[0].url, 'http://telemetry.invalid:4318/custom-traces');
});

test('synchronous mocked SDK start failure is logged without escaping initialization', () => {
  const failure = new Error('synthetic SDK start failure');
  const result = exercise({}, failure);
  assert.deepEqual(result.logs, []);
  assert.deepEqual(result.errors, [['❌ Error initializing tracing', failure.stack]]);
});
