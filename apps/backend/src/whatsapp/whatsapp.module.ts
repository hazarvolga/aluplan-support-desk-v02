import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { TicketsModule } from '../tickets/tickets.module';
import { SettingsModule } from '../settings/settings.module';
import { WhatsAppWebhookSignatureGuard } from './guards/whatsapp-webhook-signature.guard';

@Module({
    imports: [TicketsModule, SettingsModule],
    controllers: [WhatsAppController],
    providers: [WhatsAppService, WhatsAppWebhookSignatureGuard],
    exports: [WhatsAppService],
})
export class WhatsAppModule { }
