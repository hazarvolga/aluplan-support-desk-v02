import { Controller, Post, Body, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OmniChannelService } from './omni-channel.service';

@ApiTags('OmniChannel')
@Controller('omni-channel')
export class OmniChannelController {
    private readonly logger = new Logger(OmniChannelController.name);

    constructor(private readonly omniChannelService: OmniChannelService) { }

    @Post('webhook/email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Receive inbound email webhook (e.g., Mailgun, Resend)' })
    async handleInboundEmail(@Body() payload: any) {
        this.logger.debug(`Received inbound email webhook payload`);
        // In a real scenario, you'd want to verify webhook signatures here
        await this.omniChannelService.handleInboundEmailWebhook(payload);
        return { success: true };
    }
}
