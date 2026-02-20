import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMessageDto {
    @ApiProperty({ example: 'Sorununuzu inceliyoruz, kısa süre içinde dönüş yapacağız.' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'Internal note — not visible to customer', default: false })
    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;
}
