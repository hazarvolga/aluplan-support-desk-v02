import { IsString, IsEnum, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, ChatStatus, TicketStatus } from '@aluplan/database';
import { Transform } from 'class-transformer';

export class UpdateTicketDto {
    @ApiPropertyOptional({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'closeReason' in obj ? obj.closeReason : value)
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    closeReason?: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TicketStatus })
    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;

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
