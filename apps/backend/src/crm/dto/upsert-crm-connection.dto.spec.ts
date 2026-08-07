import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpsertCrmConnectionDto } from './upsert-crm-connection.dto';

const validateDto = (payload: Record<string, unknown>) => validate(
    plainToInstance(UpsertCrmConnectionDto, payload),
    { whitelist: true, forbidNonWhitelisted: true },
);

describe('UpsertCrmConnectionDto', () => {
    it('accepts the canonical camelCase Dynamics connection contract', async () => {
        const errors = await validateDto({
            provider: 'DYNAMICS_365',
            instanceUrl: 'https://org.crm4.dynamics.com',
            tenantId: 'tenant-id',
            clientId: 'client-id',
            clientSecret: 'secret',
            webhookSecret: 'webhook-secret',
            syncSettings: { accountMapping: {} },
        });

        expect(errors).toHaveLength(0);
    });

    it('rejects the stale snake_case frontend contract', async () => {
        const errors = await validateDto({
            provider: 'DYNAMICS_365',
            instance_url: 'https://org.crm4.dynamics.com',
            tenant_id: 'tenant-id',
            client_id: 'client-id',
            client_secret: 'secret',
        });

        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects unsupported providers and non-HTTPS instance URLs', async () => {
        const errors = await validateDto({
            provider: 'SALESFORCE',
            instanceUrl: 'http://org.example.com',
            tenantId: 'tenant-id',
            clientId: 'client-id',
            clientSecret: 'secret',
        });

        expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining([
            'provider',
            'instanceUrl',
        ]));
    });

    it.each([
        'https://127.0.0.1',
        'https://internal.example.com',
        'https://dynamics.com.attacker.example',
        'https://user:pass@org.crm4.dynamics.com',
        'https://org.crm4.dynamics.com/api/data/v9.2',
    ])('rejects an untrusted Dynamics target: %s', async (instanceUrl) => {
        const errors = await validateDto({
            provider: 'DYNAMICS_365',
            instanceUrl,
            tenantId: 'tenant-id',
            clientId: 'client-id',
            clientSecret: 'secret',
        });

        expect(errors.map((error) => error.property)).toContain('instanceUrl');
    });
});
