const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve SDK metadata only; never activate instrumentation or exporters.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const sdk = createRequire(backend.resolve('@opentelemetry/sdk-node/package.json'));
const { JaegerPropagator } = sdk('@opentelemetry/propagator-jaeger');
const api = backend('@opentelemetry/api');
const propagator = new JaegerPropagator();
const extract = (carrier) => propagator.extract(api.ROOT_CONTEXT, carrier, api.defaultTextMapGetter);

test('patched Jaeger resolves with the aligned patched OpenTelemetry SDK family', () => {
    assert.equal(sdk('@opentelemetry/propagator-jaeger/package.json').version, '2.9.0');
    assert.equal(backend('@opentelemetry/sdk-node/package.json').version, '0.217.0');
});

test('frontend Sentry remains on a compatible patched OpenTelemetry Core 2.x release', () => {
    const frontend = createRequire(path.resolve(__dirname, '../apps/frontend/package.json'));
    const sentry = createRequire(frontend.resolve('@sentry/nextjs/package.json'));
    const telemetry = createRequire(sentry.resolve('@sentry/opentelemetry/package.json'));
    const version = telemetry('@opentelemetry/core/package.json').version;
    const [major, minor] = version.split('.').map(Number);
    assert.equal(major, 2);
    assert.ok(minor >= 6, `Core ${version} must remain compatible with Sentry's ^2.6 peer range`);
});

test('malformed trace and baggage encoding never escapes extraction', () => {
    for (const header of ['uber-trace-id', 'uberctx-fixture']) {
        for (const value of ['%', '%GG', '%E0%A4%A']) {
            assert.doesNotThrow(() => extract({ [header]: value }));
        }
    }
});

test('valid trace and Unicode baggage survive injection and extraction', () => {
    const span = { traceId: '1234567890abcdef1234567890abcdef',
        spanId: '1234567890abcdef', traceFlags: api.TraceFlags.SAMPLED };
    const context = api.propagation.setBaggage(api.trace.setSpanContext(api.ROOT_CONTEXT, span),
        api.propagation.createBaggage({ fixture: { value: 'Çağrı %' } }));
    const carrier = {};
    propagator.inject(context, carrier, api.defaultTextMapSetter);
    const restored = extract(carrier);
    assert.deepEqual(api.trace.getSpanContext(restored), { ...span, isRemote: true });
    assert.equal(api.propagation.getBaggage(restored).getEntry('fixture').value, 'Çağrı %');
    assert.equal(api.trace.getSpanContext(api.ROOT_CONTEXT), undefined);
});
