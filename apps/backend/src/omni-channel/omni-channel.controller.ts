import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards, ServiceUnavailableException } from '@nestjs/common';
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
        const outcome = await this.omniChannelService.handleInboundEmailWebhook(payload);
        // A durable hold marker is not recoverable message content. Do not acknowledge it.
        // Provider retention and manual recovery remain separate release requirements.
        if (outcome !== 'completed') {
            throw new ServiceUnavailableException({
                code: 'INBOUND_EMAIL_REVIEW_REQUIRED',
                message: 'Inbound email requires operator review; delivery not acknowledged.',
            });
        }
        return { success: true };
    }
}
