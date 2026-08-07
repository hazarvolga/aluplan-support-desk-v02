import { HEADERS_METADATA } from '@nestjs/common/constants';
import { ReviewCenterController } from './review-center.controller';

describe('ReviewCenterController', () => {
    it('passes only the authenticated user context to the summary service', async () => {
        const summary = { items: [], pendingActions: 0 };
        const service = { getSummary: jest.fn().mockResolvedValue(summary) };
        const controller = new ReviewCenterController(service as never);
        const user = {
            sub: 'user-1',
            role: 'SUPPORT_AGENT',
            permissions: ['ticket:read'],
            email: 'staff@example.test',
        };

        await expect(controller.getSummary({ user } as never)).resolves.toBe(summary);
        expect(service.getSummary).toHaveBeenCalledWith({
            role: 'SUPPORT_AGENT',
            permissions: ['ticket:read'],
        });
    });

    it('marks the authorization-scoped response as non-cacheable', () => {
        const headers = Reflect.getMetadata(
            HEADERS_METADATA,
            ReviewCenterController.prototype.getSummary,
        );

        expect(headers).toEqual(expect.arrayContaining([
            { name: 'Cache-Control', value: 'no-store, max-age=0' },
            { name: 'Pragma', value: 'no-cache' },
        ]));
    });
});
