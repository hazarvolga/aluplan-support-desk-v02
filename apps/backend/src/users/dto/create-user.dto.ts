import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ASSIGNABLE_USER_ROLES = [
    'ADMIN',
    'SUPPORT_MANAGER',
    'SUPPORT_AGENT',
    'VIEWER',
] as const;

export type AssignableUserRole = (typeof ASSIGNABLE_USER_ROLES)[number];

export function normalizeUserRole(role: string): string {
    return role.trim().replace(/-/g, '_').toUpperCase();
}

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
    @ArrayMaxSize(1)
    @Transform(({ value }) => Array.isArray(value)
        ? value.map((role) => typeof role === 'string' ? normalizeUserRole(role) : role)
        : value)
    @IsString({ each: true })
    @IsIn(ASSIGNABLE_USER_ROLES, { each: true })
    roles?: string[];
}
