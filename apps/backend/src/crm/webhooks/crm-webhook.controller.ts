import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { CrmService } from '../crm.service';
import { CrmWebhookGuard } from '../guards/crm-webhook.guard';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('crm/webhooks')
export class CrmWebhookController {
    private readonly logger = new Logger(CrmWebhookController.name);

    constructor(private readonly crmService: CrmService) { }

    @Post('dynamics365')
    @Public()
    @UseGuards(CrmWebhookGuard)
    @HttpCode(HttpStatus.OK)
    async handleDynamics365Webhook(@Body() payload: any) {
        this.logger.log(`Received Dynamics 365 Webhook for ${payload.entity}`);

        try {
            await this.crmService.processDynamics365Webhook(payload);
            return { status: 'success', message: 'Webhook processed' };
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
}
