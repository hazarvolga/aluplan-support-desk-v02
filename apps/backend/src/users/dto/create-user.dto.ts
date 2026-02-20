import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@aluplan.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiPropertyOptional({ example: ['support_agent'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];
}
