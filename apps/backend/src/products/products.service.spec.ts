import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockEventEmitter: { emitAsync: jest.Mock };

  beforeEach(async () => {
    mockEventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            productCategory: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
            faqEntry: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
            $queryRaw: jest.fn().mockResolvedValue([{ id: 'locked-row' }]),
            $transaction: jest.fn(),
          },
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('invalidates FAQ-backed answers when restoring public FAQ content', async () => {
    const prisma = (service as any).prisma;
    prisma.product.findFirst.mockResolvedValue({ id: 'product-1' });
    prisma.productCategory.findFirst.mockResolvedValue({ id: 'category-1', productId: 'product-1' });
    prisma.faqEntry.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'faq-2' });
    prisma.faqEntry.create.mockResolvedValue({ id: 'faq-1' });
    prisma.faqEntry.update.mockResolvedValue({ id: 'faq-2' });

    await service.restoreAllplanFaqs();

    expect(prisma.faqEntry.create).toHaveBeenCalledTimes(1);
    expect(prisma.faqEntry.update).toHaveBeenCalledTimes(1);
    expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('faq.changed');
  });
});
