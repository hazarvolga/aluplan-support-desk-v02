import { BadRequestException } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { PERMISSIONS_KEY } from '../rbac/decorators/rbac.decorators';

describe('FaqController', () => {
    const faqService = {
        getPublished: jest.fn(),
        findAll: jest.fn(),
    };

    let controller: FaqController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new FaqController(faqService as any);
    });

    describe('findAll', () => {
        it('requires the dedicated FAQ review permission', () => {
            expect(Reflect.getMetadata(PERMISSIONS_KEY, controller.findAll)).toEqual(['faq:review']);
        });

        it('validates nonnumeric pagination before querying Prisma', () => {
            expect(() => controller.findAll({ page: 'abc', limit: '20' })).toThrow(BadRequestException);
            expect(faqService.findAll).not.toHaveBeenCalled();
        });

        it('rejects pagination limits above 100', () => {
            expect(() => controller.findAll({ limit: '101' })).toThrow(BadRequestException);
            expect(faqService.findAll).not.toHaveBeenCalled();
        });

        it('validates status before querying Prisma', () => {
            expect(() => controller.findAll({ status: 'invalid-status-value' })).toThrow(BadRequestException);
            expect(faqService.findAll).not.toHaveBeenCalled();
        });

        it('normalizes valid query params before passing them to the service', async () => {
            faqService.findAll.mockResolvedValue({ data: [], total: 0, page: 2, limit: 10, pages: 0 });

            await controller.findAll({ status: 'published', page: '2', limit: '10' });

            expect(faqService.findAll).toHaveBeenCalledWith({
                status: 'PUBLISHED',
                page: 2,
                limit: 10,
            });
        });
    });

    describe('getPublished', () => {
        it('does not expose internal FAQs to anonymous or customer requests', async () => {
            faqService.getPublished.mockResolvedValue([]);

            await controller.getPublished('tr', { user: undefined });
            await controller.getPublished('tr', { user: { role: 'CUSTOMER' } });

            expect(faqService.getPublished).toHaveBeenNthCalledWith(1, 'tr', 50, false);
            expect(faqService.getPublished).toHaveBeenNthCalledWith(2, 'tr', 50, false);
        });

        it('allows explicit staff roles to include internal FAQs', async () => {
            faqService.getPublished.mockResolvedValue([]);

            await controller.getPublished('tr', { user: { role: { name: 'support-agent' } } });

            expect(faqService.getPublished).toHaveBeenCalledWith('tr', 50, true);
        });
    });
});
