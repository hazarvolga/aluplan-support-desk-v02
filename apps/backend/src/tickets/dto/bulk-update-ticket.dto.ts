import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TicketStatus, TicketPriority } from '@aluplan/database';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BulkUpdateTicketDto {
    @IsArray()
    @IsUUID('all', { each: true })
    ticketIds: string[];

    @IsOptional()
    @IsEnum(TicketStatus)
    @ApiPropertyOptional({ enum: TicketStatus })
    status?: TicketStatus;

    @IsOptional()
    @IsEnum(TicketPriority)
    @ApiPropertyOptional({ enum: TicketPriority })
    priority?: TicketPriority;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    assignedTo?: string;
}
