import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@aluplan.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'strongpassword' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ default: false, description: 'Persist the refresh session for 30 days.' })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}
