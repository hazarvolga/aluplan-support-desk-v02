import { IsArray, IsEnum, IsOptional, IsUUID, IsString, Matches, MaxLength } from 'class-validator';
import { TicketStatus, TicketPriority } from '@aluplan/database';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BulkUpdateTicketDto {
    @ApiPropertyOptional({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'closeReason' in obj ? obj.closeReason : value)
    @IsOptional()
    @IsString()
    @Matches(/\S/)
    @MaxLength(2000)
    closeReason?: string;
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
