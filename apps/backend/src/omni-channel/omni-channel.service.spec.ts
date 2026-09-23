import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelService } from './omni-channel.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

describe('OmniChannelService', () => {
  let service: OmniChannelService;
  let prismaService: any;
  let ticketsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmniChannelService,
        {
          provide: PrismaService,
          useValue: {
            inboundEmailLog: { findUnique: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
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
    prismaService = module.get<PrismaService>(PrismaService);
    ticketsService = module.get<TicketsService>(TicketsService);

    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should ignore delivery status notifications without creating a ticket', async () => {
    prismaService.inboundEmailLog.findUnique.mockResolvedValue(null);
    prismaService.inboundEmailLog.create.mockImplementation(async ({ data }) => ({ id: 'log-bounce', ...data }));
    prismaService.inboundEmailLog.updateMany.mockResolvedValue({ count: 1 });

    await service.handleInboundEmailWebhook({
      from: 'MAILER-DAEMON@mail.allplan.net.tr',
      subject: 'Undelivered Mail Returned to Sender',
      text: [
        'This is the mail system at host mail.allplan.net.tr.',
        'Reporting-MTA: dns; mail.allplan.net.tr',
        'Final-Recipient: rfc822; admin@example.com',
        'Action: failed',
        'Status: 5.1.0',
        'Diagnostic-Code: X-Postfix; Domain example.com does not accept mail (nullMX)',
      ].join('\n'),
      messageId: 'msg-bounce',
      headers: { 'content-type': 'multipart/report; report-type=delivery-status' },
    });

    expect(ticketsService.create).not.toHaveBeenCalled();
    expect(ticketsService.addMessage).not.toHaveBeenCalled();
    expect(prismaService.user.create).not.toHaveBeenCalled();
    expect(prismaService.inboundEmailLog.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: 'log-bounce', processed: false }),
      data: expect.objectContaining({
        processed: true,
        error: expect.stringContaining('IGNORED_DSN'),
      }),
    });
  });
});
