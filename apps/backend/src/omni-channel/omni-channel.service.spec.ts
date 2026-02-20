import { Test, TestingModule } from '@nestjs/testing';
import { OmniChannelService } from './omni-channel.service';

describe('OmniChannelService', () => {
  let service: OmniChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OmniChannelService],
    }).compile();

    service = module.get<OmniChannelService>(OmniChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
