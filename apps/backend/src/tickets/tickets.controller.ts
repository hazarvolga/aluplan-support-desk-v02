import {
    Controller, Get, Post, Patch, Param, Body,
    Request, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { EscalateTicketDto } from './dto/escalate-ticket.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles, RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { TicketStatus, TicketPriority } from '@aluplan/database';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('tickets')
export class TicketsController {
    constructor(
        private readonly ticketsService: TicketsService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    // ─── CREATE ─────────────────────────────────
    @Post()
    @RequirePermissions('ticket:create')
    @ApiOperation({ summary: 'Open a new support ticket' })
    async create(@Body() dto: CreateTicketDto, @Request() req: any) {
        const ticket = await this.ticketsService.create(dto, req.user.sub);
        this.notificationsGateway.emitTicketCreated(ticket);
        return ticket;
    }

    // ─── LIST ───────────────────────────────────
    @Get()
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'List tickets with filters' })
    @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
    @ApiQuery({ name: 'priority', required: false, enum: TicketPriority })
    @ApiQuery({ name: 'assignedTo', required: false })
    @ApiQuery({ name: 'isSlaBreached', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() query: any) {
        return this.ticketsService.findAll({
            status: query.status,
            priority: query.priority,
            assignedTo: query.assignedTo,
            isSlaBreached: query.isSlaBreached === 'true',
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
        });
    }

    // ─── SLA STATS ──────────────────────────────
    @Get('sla/stats')
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'Get SLA statistics for dashboard' })
    getSlaStats() {
        return this.ticketsService.getSlaStats();
    }

    // ─── GET ONE ────────────────────────────────
    @Get(':id')
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'Get ticket by id' })
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(id);
    }

    // ─── GET BY NUMBER ──────────────────────────
    @Get('by-number/:number')
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'Get ticket by number (e.g. SUP-00001)' })
    findByNumber(@Param('number') number: string) {
        return this.ticketsService.findByNumber(number);
    }

    // ─── UPDATE ─────────────────────────────────
    @Patch(':id')
    @RequirePermissions('ticket:update')
    @ApiOperation({ summary: 'Update ticket fields' })
    update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Request() req: any) {
        return this.ticketsService.update(id, dto, req.user.sub);
    }

    // ─── TRANSITION ─────────────────────────────
    @Patch(':id/status/:status')
    @RequirePermissions('ticket:update')
    @ApiOperation({ summary: 'Transition ticket status (state machine)' })
    async transition(
        @Param('id') id: string,
        @Param('status') status: TicketStatus,
        @Request() req: any,
    ) {
        const updated = await this.ticketsService.transition(id, status, req.user.sub);
        this.notificationsGateway.emitTicketUpdated(updated);
        return updated;
    }

    // ─── ASSIGN ─────────────────────────────────
    @Patch(':id/assign/:userId')
    @RequirePermissions('ticket:assign')
    @ApiOperation({ summary: 'Assign ticket to a support agent' })
    async assign(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Request() req: any,
    ) {
        const updated = await this.ticketsService.assign(id, userId, req.user.sub);
        this.notificationsGateway.emitTicketUpdated(updated);
        return updated;
    }

    // ─── ESCALATE ───────────────────────────────
    @Post(':id/escalate')
    @RequirePermissions('ticket:escalate')
    @ApiOperation({ summary: 'Escalate ticket priority' })
    async escalate(
        @Param('id') id: string,
        @Body() dto: EscalateTicketDto,
        @Request() req: any,
    ) {
        const updated = await this.ticketsService.escalate(id, dto, req.user.sub);
        this.notificationsGateway.emitTicketEscalated(updated);
        return updated;
    }

    // ─── CLOSE ──────────────────────────────────
    @Patch(':id/close')
    @RequirePermissions('ticket:close')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Close a resolved ticket' })
    async close(@Param('id') id: string, @Request() req: any) {
        return this.ticketsService.transition(id, TicketStatus.CLOSED, req.user.sub);
    }

    // ─── MESSAGE ────────────────────────────────
    @Post(':id/messages')
    @RequirePermissions('ticket:update')
    @ApiOperation({ summary: 'Add a message or internal note to a ticket' })
    async addMessage(
        @Param('id') id: string,
        @Body() dto: AddMessageDto,
        @Request() req: any,
    ) {
        const message = await this.ticketsService.addMessage(id, dto, req.user.sub);
        this.notificationsGateway.emitNewMessage(id, message);
        return message;
    }
}
