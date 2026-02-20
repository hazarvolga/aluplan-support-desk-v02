import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@aluplan/database';

export class EscalateTicketDto {
    @ApiProperty({ enum: TicketPriority, example: TicketPriority.URGENT })
    @IsEnum(TicketPriority)
    toPriority: TicketPriority;

    @ApiPropertyOptional({ example: 'Müşteri 3 kez aradı, çözüm bekliyor.' })
    @IsString()
    @IsOptional()
    reason?: string;
}
