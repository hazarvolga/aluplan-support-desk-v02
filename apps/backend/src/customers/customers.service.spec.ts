import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { HotinfoParserService } from './hotinfo-parser.service';

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn() },
            role: { findUnique: jest.fn(), create: jest.fn() },
            customerProfile: { update: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
            $transaction: jest.fn(),
          },
        },
        {
          provide: HotinfoParserService,
          useValue: {
            parseHotinfo: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
