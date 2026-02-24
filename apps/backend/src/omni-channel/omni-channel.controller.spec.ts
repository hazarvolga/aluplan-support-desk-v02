import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelController } from './omni-channel.controller';
import { OmniChannelService } from './omni-channel.service';

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
      ],
    }).compile();

    controller = module.get<OmniChannelController>(OmniChannelController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
