import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateEmailPreferenceDto } from './dto/update-preference.dto';

@Controller('preferences/email')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getMyPreferences(@Req() req: any) {
        const userId = req.user.id;
        const preferences = await this.prisma.emailPreference.findMany({
            where: { userId }
        });

        // Ensure default values are returned even if records don't exist in DB
        const defaults = [
            { emailType: 'ANNOUNCEMENTS', enabled: true },
            { emailType: 'TICKETS', enabled: true },
            { emailType: 'SYSTEM', enabled: true },
        ];

        return defaults.map(def => {
            const existing = preferences.find(p => p.emailType === def.emailType);
            return existing ? { emailType: existing.emailType, enabled: existing.enabled } : def;
        });
    }

    @Patch()
    async updatePreference(@Req() req: any, @Body() dto: UpdateEmailPreferenceDto) {
        const userId = req.user.id;

        return this.prisma.emailPreference.upsert({
            where: {
                userId_emailType: {
                    userId,
                    emailType: dto.emailType
                }
            },
            update: {
                enabled: dto.enabled
            },
            create: {
                userId,
                emailType: dto.emailType,
                enabled: dto.enabled
            }
        });
    }
}
