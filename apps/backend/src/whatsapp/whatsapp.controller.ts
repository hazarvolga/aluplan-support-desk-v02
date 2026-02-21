import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
    private readonly logger = new Logger(WhatsAppController.name);

    constructor(
        private readonly whatsappService: WhatsAppService,
        private readonly configService: ConfigService,
    ) { }

    @Get('webhook')
    @ApiOperation({ summary: 'WhatsApp Webhook Verification' })
    @ApiQuery({ name: 'hub.mode', required: true })
    @ApiQuery({ name: 'hub.verify_token', required: true })
    @ApiQuery({ name: 'hub.challenge', required: true })
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('✅ WhatsApp Webhook Verified');
            return challenge;
        }

        this.logger.warn('❌ WhatsApp Webhook Verification Failed');
        return 'Forbidden';
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle incoming WhatsApp messages' })
    async handleWebhook(@Body() body: any) {
        this.logger.debug('📥 Incoming WhatsApp Webhook Payload');
        return this.whatsappService.handleIncoming(body);
    }
}
