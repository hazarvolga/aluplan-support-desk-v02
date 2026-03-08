import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';


import * as resources from '@opentelemetry/resources';
const Resource = (resources as any).Resource;

// EXPLAIN: OTel must be initialized BEFORE any other imports to wrap dependencies.
// Endpoint points to Grafana Tempo (OTLP HTTP) for distributed tracing.
const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://tempo:4318/v1/traces',
});

const sdk = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'aluplan-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            // We can fine-tune instrumentations here (e.g., disable specific ones)
            '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
    ],
});

// Start the SDK
try {
    sdk.start();
    console.log('[OTel] 🛰️ Tracing initialized');
} catch (error) {
    console.error('[OTel] ❌ Error initializing tracing', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('[OTel] 🛡️ Tracing terminated'))
        .catch((error) => console.error('[OTel] ❌ Error terminating tracing', error))
        .finally(() => process.exit(0));
});

export default sdk;
