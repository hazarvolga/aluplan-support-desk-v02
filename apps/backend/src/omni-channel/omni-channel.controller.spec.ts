import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelController } from './omni-channel.controller';

describe('OmniChannelController', () => {
  let controller: OmniChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OmniChannelController],
    }).compile();

    controller = module.get<OmniChannelController>(OmniChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
