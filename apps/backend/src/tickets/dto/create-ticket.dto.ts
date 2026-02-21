import { IsString, IsEnum, IsOptional, IsUUID, MinLength, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, CommunicationChannel } from '@aluplan/database';

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

    @ApiPropertyOptional({ description: 'ID of the related product for smart AI triage' })
    @IsUUID()
    @IsOptional()
    productId?: string;

    @ApiPropertyOptional({ description: 'System information from Hotinfo for AI context' })
    @IsObject()
    @IsOptional()
    hotinfoContext?: any;

    @ApiPropertyOptional({ enum: CommunicationChannel, default: CommunicationChannel.WEB })
    @IsEnum(CommunicationChannel)
    @IsOptional()
    channel?: CommunicationChannel;
}
