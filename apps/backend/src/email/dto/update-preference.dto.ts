import { IsBoolean, IsString, IsEnum } from 'class-validator';

export class UpdateEmailPreferenceDto {
    @IsString()
    @IsEnum(['ANNOUNCEMENTS', 'TICKETS', 'SYSTEM'])
    emailType: string;

    @IsBoolean()
    enabled: boolean;
}
