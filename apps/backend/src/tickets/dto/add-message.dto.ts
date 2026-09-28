import { IsString, IsBoolean, IsOptional, IsEnum, Equals, MaxLength } from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

    // Retain only to explicitly reject legacy input instead of silently stripping it.
    // Files must use the authorized /attachments/upload/:messageId endpoint.
    @ApiHideProperty()
    @Equals(undefined, { message: 'Attachments must be uploaded through the attachment endpoint' })
    attachments?: unknown;
}
