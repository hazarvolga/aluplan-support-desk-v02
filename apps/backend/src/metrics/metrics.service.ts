import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
    public readonly httpDuration: Histogram<string>;
    public readonly aiQueryLatency: Histogram<string>;
    public readonly ticketCounter: Counter<string>;
    public readonly websocketConnections: Gauge<string>;
    public readonly dbPoolConnections: Gauge<string>;
    public readonly cacheHitMiss: Counter<string>;

    constructor() {
        this.httpDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
        });

        this.aiQueryLatency = new Histogram({
            name: 'ai_query_latency_seconds',
            help: 'Latency of AI queries in seconds',
            labelNames: ['provider', 'model', 'status'],
            buckets: [0.5, 1, 2, 5, 10, 20],
        });

        this.ticketCounter = new Counter({
            name: 'tickets_created_total',
            help: 'Total number of tickets created',
            labelNames: ['department', 'priority'],
        });

        this.websocketConnections = new Gauge({
            name: 'websocket_connections_active',
            help: 'Number of active websocket connections',
        });

        this.dbPoolConnections = new Gauge({
            name: 'db_pool_active_connections',
            help: 'Number of active database pool connections',
        });

        this.cacheHitMiss = new Counter({
            name: 'cache_operations_total',
            help: 'Total number of cache hits and misses',
            labelNames: ['operation', 'status'], // operation: 'AI_QUERY', status: 'HIT'|'MISS'
        });
    }

    recordHttpDuration(method: string, route: string, statusCode: number, durationSec: number) {
        this.httpDuration.labels(method, route, statusCode.toString()).observe(durationSec);
    }

    recordAiQuery(provider: string, model: string, status: string, durationSec: number) {
        this.aiQueryLatency.labels(provider, model, status).observe(durationSec);
    }

    incrementTicketCreated(department: string, priority: string) {
        this.ticketCounter.labels(department, priority).inc();
    }

    setWebsocketConnections(count: number) {
        this.websocketConnections.set(count);
    }

    setDbPoolConnections(count: number) {
        this.dbPoolConnections.set(count);
    }

    recordCacheOp(operation: string, status: 'HIT' | 'MISS') {
        this.cacheHitMiss.labels(operation, status).inc();
    }
}
