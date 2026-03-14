import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('crm')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('admin') // CRM management is restricted to admins
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @Get('connections')
    async getConnections() {
        return this.crmService.getAllConnections();
    }

    @Post('connections')
    async upsertConnection(@Body() dto: any) {
        return this.crmService.upsertConnection(dto);
    }

    @Post('verify-connection/:id')
    async verifyConnection(@Param('id') id: string) {
        return this.crmService.verifyConnectionById(id);
    }

    @Post('sync/:id')
    async triggerSync(@Param('id') id: string) {
        return this.crmService.triggerSync(id);
    }

    @Get('logs/:connectionId')
    async getLogs(@Param('connectionId') connectionId: string) {
        return this.crmService.getSyncLogs(connectionId);
    }

    @Get('accounts')
    async getAccounts() {
        return this.crmService.getAccounts();
    }

    @Get('accounts/:id')
    async getAccount(@Param('id') id: string) {
        return this.crmService.getAccountById(id);
    }

    @Post('accounts/bulk-delete')
    async bulkDeleteAccounts(@Body('ids') ids: string[]) {
        return this.crmService.bulkDeleteAccounts(ids);
    }
}
