import { IsString, IsBoolean, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationChannel } from '@aluplan/database';

export enum MessageContentFormat {
    HTML = 'HTML',
    PLAIN_TEXT = 'PLAIN_TEXT',
}

export class AddMessageDto {
    @ApiProperty({ example: 'Sorununuzu inceliyoruz, kısa süre içinde dönüş yapacağız.' })
    @IsString()
    @MaxLength(10000)
    message: string;

    @ApiPropertyOptional({ enum: MessageContentFormat, default: MessageContentFormat.PLAIN_TEXT })
    @IsEnum(MessageContentFormat)
    @IsOptional()
    contentFormat?: MessageContentFormat;

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
