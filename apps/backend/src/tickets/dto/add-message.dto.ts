import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationChannel } from '@aluplan/database';

export class AddMessageDto {
    @ApiProperty({ example: 'Sorununuzu inceliyoruz, kısa süre içinde dönüş yapacağız.' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'Internal note — not visible to customer', default: false })
    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;

    @ApiPropertyOptional({ enum: CommunicationChannel, default: CommunicationChannel.WEB })
    @IsEnum(CommunicationChannel)
    @IsOptional()
    channel?: CommunicationChannel;
}
