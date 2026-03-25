import {
    Controller, Get, Post, Patch, Param, Body,
    Request, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BulkUpdateTicketDto } from './dto/bulk-update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { EscalateTicketDto } from './dto/escalate-ticket.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions, Roles } from '../rbac/decorators/rbac.decorators';
import { TicketStatus, TicketPriority } from '@aluplan/database';
import { Delete } from '@nestjs/common';
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
    @ApiQuery({ name: 'teamId', required: false })
    @ApiQuery({ name: 'isSlaBreached', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() query: any, @Request() req: any) {
        // If user is a customer, force filter by their own userId
        const userId = (req.user.role === 'customer' || req.user.role === 'VIEWER') ? req.user.sub : query.userId;

        return this.ticketsService.findAll({
            status: query.status,
            priority: query.priority,
            assignedTo: query.assignedTo,
            teamId: query.teamId,
            userId,
            isSlaBreached: query.isSlaBreached === 'true',
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
        });
    }

    // ─── SLA STATS ──────────────────────────────
    @Get('sla/stats')
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'Get SLA statistics for dashboard' })
    getSlaStats(@Request() req: any) {
        return this.ticketsService.getSlaStats(req.user);
    }

    // ─── GET ONE ────────────────────────────────
    @Get(':id')
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'Get ticket by id' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.ticketsService.findOne(id, { id: req.user.sub, role: req.user.role });
    }

    // ─── GET BY NUMBER ──────────────────────────
    @Get('by-number/:number')
    @RequirePermissions('ticket:read')
    @ApiOperation({ summary: 'Get ticket by number (e.g. SUP-00001)' })
    findByNumber(@Param('number') number: string, @Request() req: any) {
        return this.ticketsService.findByNumber(number, { id: req.user.sub, role: req.user.role });
    }

    // ─── UPDATE ─────────────────────────────────
    @Patch(':id')
    @RequirePermissions('ticket:update')
    @ApiOperation({ summary: 'Update ticket fields' })
    async update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Request() req: any) {
        const updated = await this.ticketsService.update(id, dto, req.user.sub);
        this.notificationsGateway.emitTicketUpdated(updated);
        return updated;
    }

    @Patch('bulk')
    @RequirePermissions('ticket:update')
    @ApiOperation({ summary: 'Bulk update multiple tickets' })
    async bulkUpdate(@Body() dto: BulkUpdateTicketDto, @Request() req: any) {
        const result = await this.ticketsService.bulkUpdate(dto, req.user.sub);
        this.notificationsGateway.emitBulkUpdate(dto.ticketIds);
        return result;
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

    // ─── LINK ───────────────────────────────────
    @Post(':id/link/:parentId')
    @RequirePermissions('ticket:update')
    @ApiOperation({ summary: 'Link/merge ticket to a parent ticket' })
    async link(
        @Param('id') childId: string,
        @Param('parentId') parentId: string,
        @Request() req: any,
    ) {
        const updated = await this.ticketsService.linkTicket(childId, parentId, req.user.sub);
        this.notificationsGateway.emitTicketUpdated(updated);
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

    // ─── CSAT FEEDBACK ──────────────────────────
    @Post(':id/feedback')
    @RequirePermissions('ticket:read') // Customers should be able to submit, their ownership is checked in service
    @ApiOperation({ summary: 'Submit Customer Satisfaction (CSAT) rating and comment' })
    async submitFeedback(
        @Param('id') id: string,
        @Body() body: { score: number, comment?: string },
        @Request() req: any,
    ) {
        const updated = await this.ticketsService.submitFeedback(id, body.score, body.comment, req.user.sub);
        this.notificationsGateway.emitTicketUpdated(updated);
        return updated;
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
        const message = await this.ticketsService.addMessage(id, dto, req.user.sub, req.user.role);
        this.notificationsGateway.emitNewMessage(id, message);
        return message;
    }

    // ─── DELETE ─────────────────────────────────
    @Delete(':id')
    @Roles('ADMIN', 'DEPARTMENT_MANAGER')
    @ApiOperation({ summary: 'Delete a ticket (Hard delete)' })
    async remove(@Param('id') id: string, @Request() req: any) {
        return this.ticketsService.remove(id, req.user.sub);
    }
}
