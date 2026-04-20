import { IsString, IsBoolean, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
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

    @ApiPropertyOptional({
        description: 'Metadata for attachments already uploaded to storage',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                url: { type: 'string' },
                fileName: { type: 'string' },
                fileSize: { type: 'number' },
                mimeType: { type: 'string' },
            }
        }
    })
    @IsArray()
    @IsOptional()
    attachments?: Array<{
        url: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
}
