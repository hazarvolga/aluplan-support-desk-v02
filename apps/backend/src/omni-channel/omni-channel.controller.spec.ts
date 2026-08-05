import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelController } from './omni-channel.controller';
import { OmniChannelService } from './omni-channel.service';
import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator';
import { InboundEmailWebhookSignatureGuard } from './guards/inbound-email-webhook-signature.guard';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

describe('OmniChannelController', () => {
  let controller: OmniChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OmniChannelController],
      providers: [
        {
          provide: OmniChannelService,
          useValue: {
            handleInboundEmailWebhook: jest.fn(),
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
