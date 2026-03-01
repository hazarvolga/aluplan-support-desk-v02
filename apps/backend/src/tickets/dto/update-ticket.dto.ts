import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, ChatStatus } from '@aluplan/database';

export class UpdateTicketDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TicketPriority })
    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;

    @ApiPropertyOptional({ enum: ChatStatus })
    @IsEnum(ChatStatus)
    @IsOptional()
    chatStatus?: ChatStatus;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    assignedTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    tags?: string[];
}
