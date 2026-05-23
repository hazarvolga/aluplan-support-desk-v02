import { BadRequestException } from '@nestjs/common';
import { FaqController } from './faq.controller';

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
        it('validates nonnumeric pagination before querying Prisma', () => {
            expect(() => controller.findAll({ page: 'abc', limit: '20' })).toThrow(BadRequestException);
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
});
