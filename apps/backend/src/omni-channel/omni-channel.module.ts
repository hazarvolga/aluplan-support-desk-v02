import { Module } from '@nestjs/common';
import { OmniChannelController } from './omni-channel.controller';
import { OmniChannelService } from './omni-channel.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [PrismaModule, TicketsModule],
  controllers: [OmniChannelController],
  providers: [OmniChannelService]
})
export class OmniChannelModule { }
