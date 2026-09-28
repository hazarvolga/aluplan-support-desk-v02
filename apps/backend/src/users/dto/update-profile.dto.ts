import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
    @Transform(({ obj, value }) => (obj && 'fullName' in obj ? obj.fullName : value))
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({ example: '+905554443322', description: 'Phone number' })
    @Transform(({ obj, value }) => (obj && 'phone' in obj ? obj.phone : value))
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @ApiPropertyOptional({ example: 'Acme Corp', description: 'Company name' })
    @Transform(({ obj, value }) => (obj && 'companyName' in obj ? obj.companyName : value))
    @IsOptional()
    @IsString()
    @MaxLength(255)
    companyName?: string;

    @ApiPropertyOptional({ example: 'Software Engineer', description: 'Job title' })
    @Transform(({ obj, value }) => (obj && 'jobTitle' in obj ? obj.jobTitle : value))
    @IsOptional()
    @IsString()
    @MaxLength(255)
    jobTitle?: string;

    @ApiPropertyOptional({ example: 'Technology', description: 'Industry' })
    @Transform(({ obj, value }) => (obj && 'industry' in obj ? obj.industry : value))
    @IsOptional()
    @IsString()
    @MaxLength(255)
    industry?: string;

    @ApiPropertyOptional({ example: 'oldPassword123', description: 'Current password (required when changing password)' })
    @Transform(({ obj, value }) => (obj && 'currentPassword' in obj ? obj.currentPassword : value))
    @IsOptional()
    @IsString({ message: 'Mevcut şifre metin olmalıdır' })
    currentPassword?: string;

    @ApiPropertyOptional({ example: 'newPassword123', description: 'New password' })
    @Transform(({ obj, value }) => (obj && 'newPassword' in obj ? obj.newPassword : value))
    @IsOptional()
    @IsString({ message: 'Yeni şifre metin olmalıdır' })
    @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    newPassword?: string;

    @ApiPropertyOptional({ example: 'password123', description: 'New password (legacy alias)' })
    @Transform(({ obj, value }) => (obj && 'password' in obj ? obj.password : value))
    @IsOptional()
    @IsString({ message: 'Yeni şifre metin olmalıdır' })
    @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    password?: string;

    @ApiPropertyOptional({ example: 'tr', description: 'Preferred language' })
    @Transform(({ obj, value }) => (obj && 'language' in obj ? obj.language : value))
    @IsOptional()
    @IsString()
    @MaxLength(10)
    language?: string;
}
