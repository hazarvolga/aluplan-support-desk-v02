import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Logger } from '@nestjs/common';


import * as resources from '@opentelemetry/resources';
const Resource = (resources as any).Resource;
const logger = new Logger('OTel');

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
    logger.log('🛰️ Tracing initialized');
} catch (error) {
    logger.error('❌ Error initializing tracing', error instanceof Error ? error.stack : String(error));
}

// Graceful shutdown
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => logger.log('🛡️ Tracing terminated'))
        .catch((error) => logger.error('❌ Error terminating tracing', error instanceof Error ? error.stack : String(error)))
        .finally(() => process.exit(0));
});

export default sdk;
