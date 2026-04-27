import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateCustomerProfileDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    jobTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contractStatus?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subscriptionModel?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customerNo?: string;

    @ApiPropertyOptional({ description: 'Mark customer as VIP' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === true || value === 'true')
    isVip?: boolean;
}
