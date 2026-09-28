import { Module } from '@nestjs/common';
import { OmniChannelController } from './omni-channel.controller';
import { OmniChannelService } from './omni-channel.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketsModule } from '../tickets/tickets.module';
import { SettingsModule } from '../settings/settings.module';
import { InboundEmailWebhookSignatureGuard } from './guards/inbound-email-webhook-signature.guard';

@Module({
  imports: [PrismaModule, TicketsModule, SettingsModule],
  controllers: [OmniChannelController],
  providers: [OmniChannelService, InboundEmailWebhookSignatureGuard]
})
export class OmniChannelModule { }
