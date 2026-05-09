import {
    Controller, Get, Post, Patch, Param, Body,
    Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProactiveChatService } from './proactive-chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@ApiTags('Proactive Chat')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('proactive-chat')
export class ProactiveChatController {
    constructor(private readonly proactiveChatService: ProactiveChatService) {}

    @Post('sessions')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent')
    @ApiOperation({ summary: 'Create a new proactive chat session (agent only)' })
    createSession(@Body() dto: CreateSessionDto, @Request() req: any) {
        return this.proactiveChatService.createSession(req.user.sub, dto.customerId);
    }

    @Patch('sessions/:id/accept')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent', 'customer')
    @ApiOperation({ summary: 'Customer accepts a proactive chat session' })
    acceptSession(@Param('id') id: string, @Request() req: any) {
        return this.proactiveChatService.acceptSession(id, req.user.sub);
    }

    @Patch('sessions/:id/decline')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent', 'customer')
    @ApiOperation({ summary: 'Customer declines a proactive chat session' })
    declineSession(@Param('id') id: string, @Request() req: any) {
        return this.proactiveChatService.declineSession(id, req.user.sub);
    }

    @Patch('sessions/:id/end')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent', 'customer')
    @ApiOperation({ summary: 'End a proactive chat session (agent or customer)' })
    endSession(@Param('id') id: string, @Request() req: any) {
        return this.proactiveChatService.endSession(id, req.user.sub);
    }

    @Post('sessions/:id/messages')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent', 'customer')
    @ApiOperation({ summary: 'Send a message in a proactive chat session' })
    sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto, @Request() req: any) {
        return this.proactiveChatService.sendMessage(id, req.user.sub, dto.content);
    }

    @Get('sessions/:id/messages')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent', 'customer')
    @ApiOperation({ summary: 'Get message history for a proactive chat session' })
    getMessages(@Param('id') id: string, @Request() req: any) {
        return this.proactiveChatService.getMessages(id, req.user.sub);
    }

    @Post('sessions/:id/convert')
    @Roles('admin', 'super-admin', 'department-manager', 'team-lead', 'agent')
    @ApiOperation({ summary: 'Convert a proactive chat session to a ticket' })
    convertToTicket(@Param('id') id: string, @Request() req: any) {
        return this.proactiveChatService.convertToTicket(id, req.user.sub);
    }

    @Get('sessions')
    @ApiOperation({ summary: 'List proactive chat sessions for the current user' })
    listSessions(@Request() req: any) {
        return this.proactiveChatService.listSessions(req.user.sub, req.user.role);
    }
}
