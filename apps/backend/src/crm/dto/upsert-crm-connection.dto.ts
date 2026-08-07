import { Transform } from 'class-transformer';
import { Equals, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { CrmProvider, Prisma } from '@aluplan/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const trimString = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpsertCrmConnectionDto {
    @ApiProperty({ enum: [CrmProvider.DYNAMICS_365] })
    @Equals(CrmProvider.DYNAMICS_365)
    provider: CrmProvider;

    @ApiProperty({ maxLength: 255 })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    tenantId: string;

    @ApiProperty({ maxLength: 255 })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    clientId: string;

    @ApiProperty({ maxLength: 4096, writeOnly: true })
    @IsString()
    @IsNotEmpty()
    @MaxLength(4096)
    clientSecret: string;

    @ApiPropertyOptional({ maxLength: 4096, writeOnly: true })
    @IsOptional()
    @IsString()
    @MaxLength(4096)
    webhookSecret?: string;

    @ApiProperty({ example: 'https://org.crm4.dynamics.com', maxLength: 2048 })
    @Transform(trimString)
    @IsUrl({ protocols: ['https'], require_protocol: true })
    @Matches(/^https:\/\/(?:[a-z0-9-]+\.)+dynamics\.com\/?$/i, {
        message: 'instanceUrl must be a trusted Dynamics 365 origin',
    })
    @MaxLength(2048)
    instanceUrl: string;

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsOptional()
    @IsObject()
    syncSettings?: Prisma.InputJsonValue;
}
