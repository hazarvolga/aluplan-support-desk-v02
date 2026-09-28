import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelController } from './omni-channel.controller';
import { OmniChannelService } from './omni-channel.service';
import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator';
import { InboundEmailWebhookSignatureGuard } from './guards/inbound-email-webhook-signature.guard';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { ServiceUnavailableException } from '@nestjs/common';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';

describe('OmniChannelController', () => {
  let controller: OmniChannelController;
  let ingest: jest.Mock;

  beforeEach(async () => {
    ingest = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OmniChannelController],
      providers: [
        {
          provide: OmniChannelService,
          useValue: {
            handleInboundEmailWebhook: ingest,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getValue: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OmniChannelController>(OmniChannelController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('acknowledges only explicit completion', async () => {
    ingest.mockResolvedValue('completed');
    await expect(controller.handleInboundEmail({})).resolves.toEqual({ success: true });
    expect(ingest).toHaveBeenCalledTimes(1);
  });

  it.each(['held', undefined, null, 'unexpected'])('does not acknowledge outcome %s', async outcome => {
    ingest.mockResolvedValue(outcome);
    await expect(controller.handleInboundEmail({ body: 'PRIVATE_MESSAGE' })).rejects.toMatchObject({
      status: 503, response: { code: 'INBOUND_EMAIL_REVIEW_REQUIRED' },
    });
  });

  it('propagates service failure without converting it to success', async () => {
    const failure = new Error('synthetic database failure');
    ingest.mockRejectedValue(failure);
    await expect(controller.handleInboundEmail({})).rejects.toBe(failure);
  });

  it('waits for service completion before acknowledgement', async () => {
    let complete!: (value: string) => void;
    ingest.mockReturnValue(new Promise<string>(resolve => { complete = resolve; }));
    let settled = false;
    const result = controller.handleInboundEmail({}).then(value => { settled = true; return value; });
    await Promise.resolve();
    expect(settled).toBe(false);
    complete('completed');
    await expect(result).resolves.toEqual({ success: true });
  });

  it('serializes held status as a redacted 503 through the production exception filter', async () => {
    ingest.mockResolvedValue('held');
    let exception: unknown;
    try { await controller.handleInboundEmail({ body: 'PRIVATE_MESSAGE' }); }
    catch (error) { exception = error; }
    expect(exception).toBeInstanceOf(ServiceUnavailableException);
    const reply = jest.fn();
    const logError = jest.fn().mockResolvedValue(undefined);
    const filter = new GlobalExceptionFilter({ httpAdapter: {
      getRequestUrl: () => '/omni-channel/webhook/email', reply,
    } } as any, { logError } as any, new MaintenanceWorkService());
    await filter.catch(exception, { switchToHttp: () => ({
      getRequest: () => ({ method: 'POST', body: { body: 'PRIVATE_MESSAGE' } }),
      getResponse: () => ({}),
    }) } as any);
    expect(reply).toHaveBeenCalledWith({}, expect.objectContaining({
      statusCode: 503, code: 'INBOUND_EMAIL_REVIEW_REQUIRED',
    }), 503);
    expect(JSON.stringify([reply.mock.calls, logError.mock.calls])).not.toContain('PRIVATE_MESSAGE');
  });

  it('keeps inbound email webhook public while retaining signature guard', () => {
    const publicMetadata = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      OmniChannelController.prototype.handleInboundEmail,
    );
    const guards = Reflect.getMetadata(
      '__guards__',
      OmniChannelController.prototype.handleInboundEmail,
    );

    expect(publicMetadata).toBe(true);
    expect(guards).toContain(InboundEmailWebhookSignatureGuard);
  });
});
