import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelService } from './omni-channel.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

describe('OmniChannelService', () => {
  let service: OmniChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmniChannelService,
        {
          provide: PrismaService,
          useValue: {
            inboundEmailLog: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
            ticket: { findUnique: jest.fn() },
            user: { findUnique: jest.fn(), create: jest.fn() },
          },
        },
        {
          provide: TicketsService,
          useValue: {
            addMessage: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OmniChannelService>(OmniChannelService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
