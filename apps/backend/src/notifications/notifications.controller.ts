import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getMyNotifications(@Req() req: any) {
        return this.prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    @Patch(':id/read')
    async markAsRead(@Req() req: any, @Param('id') id: string) {
        // Mark as read only if it belongs to user
        return this.prisma.notification.updateMany({
            where: { id, userId: req.user.id },
            data: { isRead: true },
        });
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        return this.prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });
    }
}
