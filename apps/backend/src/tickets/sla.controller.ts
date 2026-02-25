import {
    Controller, Get, Post, Patch, Delete, Param, Body,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';
import { UpdateSlaPolicyDto } from './dto/update-sla-policy.dto';

@ApiTags('SLA Policies')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('tickets/sla/policies')
export class SlaController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @RequirePermissions('admin:settings')
    @ApiOperation({ summary: 'List all SLA policies' })
    findAll() {
        return this.prisma.slaPolicy.findMany({
            include: { department: true },
            orderBy: { priority: 'asc' }
        });
    }

    @Post()
    @RequirePermissions('admin:settings')
    @ApiOperation({ summary: 'Create a new SLA policy' })
    async create(@Body() dto: CreateSlaPolicyDto) {
        return this.prisma.slaPolicy.create({
            data: dto,
            include: { department: true }
        });
    }

    @Patch(':id')
    @RequirePermissions('admin:settings')
    @ApiOperation({ summary: 'Update an existing SLA policy' })
    async update(@Param('id') id: string, @Body() dto: UpdateSlaPolicyDto) {
        return this.prisma.slaPolicy.update({
            where: { id },
            data: dto,
            include: { department: true }
        });
    }

    @Delete(':id')
    @RequirePermissions('admin:settings')
    @ApiOperation({ summary: 'Delete an SLA policy' })
    async remove(@Param('id') id: string) {
        await this.prisma.slaPolicy.delete({ where: { id } });
        return { success: true };
    }
}
