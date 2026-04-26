import { register } from 'prom-client';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
    let service: MetricsService;

    beforeEach(() => {
        // prom-client uses a single global registry — must clear between tests
        // or the constructor throws "metric is already registered".
        register.clear();
        service = new MetricsService();
    });

    afterAll(() => register.clear());

    it('exposes the expected metric instruments', () => {
        expect(service.httpDuration).toBeDefined();
        expect(service.aiQueryLatency).toBeDefined();
        expect(service.ticketCounter).toBeDefined();
        expect(service.websocketConnections).toBeDefined();
        expect(service.dbPoolConnections).toBeDefined();
        expect(service.cacheHitMiss).toBeDefined();
    });

    it('records http request duration with method/route/status labels', async () => {
        service.recordHttpDuration('GET', '/api/v1/tickets', 200, 0.42);
        const text = await register.metrics();
        expect(text).toContain('http_request_duration_seconds_count{method="GET",route="/api/v1/tickets",status_code="200"} 1');
    });

    it('counts ticket creations by department + priority', async () => {
        service.incrementTicketCreated('support', 'HIGH');
        service.incrementTicketCreated('support', 'HIGH');
        service.incrementTicketCreated('support', 'LOW');
        const text = await register.metrics();
        expect(text).toContain('tickets_created_total{department="support",priority="HIGH"} 2');
        expect(text).toContain('tickets_created_total{department="support",priority="LOW"} 1');
    });

    it('reflects websocket gauge changes', async () => {
        service.setWebsocketConnections(7);
        const text = await register.metrics();
        expect(text).toContain('websocket_connections_active 7');
    });

    it('records cache hit/miss with operation label', async () => {
        service.recordCacheOp('AI_QUERY', 'HIT');
        service.recordCacheOp('AI_QUERY', 'MISS');
        service.recordCacheOp('AI_QUERY', 'HIT');
        const text = await register.metrics();
        expect(text).toContain('cache_operations_total{operation="AI_QUERY",status="HIT"} 2');
        expect(text).toContain('cache_operations_total{operation="AI_QUERY",status="MISS"} 1');
    });
});
