import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ description: 'The JWT token sent to the user email' })
    @IsString()
    token: string;

    @ApiProperty({ description: 'New password for the user', minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    newPassword: string;
}
