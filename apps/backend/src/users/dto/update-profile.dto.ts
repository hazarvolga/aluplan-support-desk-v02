import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({ example: '+905554443322', description: 'Phone number' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;
    
    @ApiPropertyOptional({ example: 'password123', description: 'New password' })
    @IsOptional()
    @IsString()
    password?: string;
}
