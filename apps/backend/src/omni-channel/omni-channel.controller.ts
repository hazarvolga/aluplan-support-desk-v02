import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OmniChannelService } from './omni-channel.service';
import { Public } from '../auth/decorators/public.decorator';
import { InboundEmailWebhookSignatureGuard } from './guards/inbound-email-webhook-signature.guard';

@ApiTags('OmniChannel')
@Controller('omni-channel')
export class OmniChannelController {
    private readonly logger = new Logger(OmniChannelController.name);

    constructor(private readonly omniChannelService: OmniChannelService) { }

    @Post('webhook/email')
    @Public()
    @UseGuards(InboundEmailWebhookSignatureGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Receive inbound email webhook (e.g., Mailgun, Resend)' })
    async handleInboundEmail(@Body() payload: any) {
        this.logger.debug(`Received inbound email webhook payload`);
        await this.omniChannelService.handleInboundEmailWebhook(payload);
        return { success: true };
    }
}
