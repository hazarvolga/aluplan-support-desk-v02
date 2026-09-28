const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// SDK metadata resolution only: never start NodeSDK, instrumentation or a listener.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const sdk = createRequire(backend.resolve('@opentelemetry/sdk-node/package.json'));
const { PrometheusExporter } = sdk('@opentelemetry/exporter-prometheus');
const { MeterProvider } = sdk('@opentelemetry/sdk-metrics');
const { resourceFromAttributes } = sdk('@opentelemetry/resources');

function fixture() {
    const reader = new PrometheusExporter({ preventServerStart: true, host: '127.0.0.1',
        port: 9464, appendTimestamp: false });
    const provider = new MeterProvider({ readers: [reader],
        resource: resourceFromAttributes({ 'service.name': 'synthetic-fixture' }) });
    return { reader, provider, meter: provider.getMeter('fixture') };
}

function request(reader, url) {
    return new Promise((resolve, reject) => {
        const response = { statusCode: 0, setHeader() {},
            end(body = '') { resolve({ status: this.statusCode, body }); } };
        try { reader._requestHandler({ url }, response); }
        catch (error) { reject(error); }
    });
}

test('SDK retains its metrics family and resolves the patched exporter', () => {
    assert.equal(sdk('@opentelemetry/exporter-prometheus/package.json').version, '0.217.0');
    assert.equal(sdk('@opentelemetry/sdk-metrics/package.json').version, '2.6.0');
    const exporter = createRequire(sdk.resolve('@opentelemetry/exporter-prometheus/package.json'));
    assert.equal(exporter('@opentelemetry/sdk-metrics/package.json').version, '2.7.1');
    assert.equal(backend('@opentelemetry/sdk-node/package.json').version, '0.213.0');
});

test('malformed URL is rejected without throwing or starting a listener', { timeout: 3000 }, async () => {
    const { reader, provider } = fixture();
    try {
        assert.equal(reader._server.listening, false);
        assert.equal((await request(reader, 'http://')).status, 400);
        assert.equal((await request(reader, '/unknown')).status, 404);
        assert.equal((await request(reader, '/metrics')).status, 200);
        assert.equal(reader._server.listening, false);
    } finally { await provider.shutdown(); }
});

test('parent metrics provider collects counters, histograms and observations through new reader', { timeout: 3000 }, async () => {
    const { reader, provider, meter } = fixture();
    try {
        const counter = meter.createCounter('fixture_requests');
        counter.add(3, { route: 'fixture' });
        meter.createHistogram('fixture_latency').record(5);
        meter.createObservableGauge('fixture_depth').addCallback((result) => result.observe(7));
        const collection = await reader.collect();
        assert.deepEqual(collection.errors, []);
        assert.equal(collection.resourceMetrics.resource.attributes['service.name'], 'synthetic-fixture');
        const metrics = collection.resourceMetrics.scopeMetrics.flatMap((scope) => scope.metrics);
        assert.equal(metrics.find((m) => m.descriptor.name === 'fixture_requests').dataPoints[0].value, 3);
        assert.equal(metrics.find((m) => m.descriptor.name === 'fixture_depth').dataPoints[0].value, 7);
        const histogram = metrics.find((m) => m.descriptor.name === 'fixture_latency').dataPoints[0].value;
        assert.equal(histogram.count, 1);
        assert.equal(histogram.sum, 5);
        counter.add(2, { route: 'fixture' });
        await provider.forceFlush();
        const output = await request(reader, '/metrics');
        assert.equal(output.status, 200);
        assert.match(output.body, /fixture_requests_total\{route="fixture",otel_scope_name="fixture"\} 5/);
        assert.match(output.body, /fixture_depth\{otel_scope_name="fixture"\} 7/);
        assert.match(output.body, /fixture_latency_count\{otel_scope_name="fixture"\} 1/);
        assert.doesNotMatch(output.body, /failed to export metrics/);
    } finally { await provider.shutdown(); }
    assert.equal(reader._server.listening, false);
    await assert.rejects(reader.collect(), /shutdown/i);
    await provider.shutdown();
});
