import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('Webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('admin', 'superuser')
export class WebhooksController {
    constructor(private readonly prisma: PrismaService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new outgoing webhook' })
    create(@Body() data: { name: string; url: string; events: string[]; secret?: string }) {
        return this.prisma.webhook.create({ data });
    }

    @Get()
    @ApiOperation({ summary: 'List all webhooks' })
    findAll() {
        return this.prisma.webhook.findMany();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get webhook details' })
    findOne(@Param('id') id: string) {
        return this.prisma.webhook.findUnique({ where: { id } });
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update webhook' })
    update(@Param('id') id: string, @Body() data: any) {
        return this.prisma.webhook.update({ where: { id }, data });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete webhook' })
    remove(@Param('id') id: string) {
        return this.prisma.webhook.delete({ where: { id } });
    }
}
