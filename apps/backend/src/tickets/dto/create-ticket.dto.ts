import { IsString, IsEnum, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@aluplan/database';

export class CreateTicketDto {
    @ApiProperty({ example: 'Login sayfasında hata alıyorum' })
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    subject: string;

    @ApiPropertyOptional({ example: 'Sisteme giriş yapmaya çalışırken 500 hatası alıyorum.' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;

    @ApiPropertyOptional({ example: ['login', 'hata'] })
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ description: 'If created from an AI interaction' })
    @IsUUID()
    @IsOptional()
    interactionId?: string;
}
