import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSlaPerformance(startDate: Date, endDate: Date) {
        const total = await this.prisma.ticket.count({
            where: { createdAt: { gte: startDate, lte: endDate } }
        });

        const breached = await this.prisma.ticket.count({
            where: { isSlaBreached: true, createdAt: { gte: startDate, lte: endDate } }
        });

        const met = total - breached;
        const complianceRate = total > 0 ? (met / total) * 100 : 100;

        return {
            total,
            breached,
            met,
            complianceRate: complianceRate.toFixed(2)
        };
    }

    async getAgentPerformance(startDate: Date, endDate: Date) {
        // Group resolved tickets by assignee
        const resolvedStats = await this.prisma.ticket.groupBy({
            by: ['assignedTo'],
            where: {
                status: 'RESOLVED',
                resolvedAt: { gte: startDate, lte: endDate }
            },
            _count: { id: true },
            _avg: { satisfactionScore: true } // Assuming CSAT is collected
        });

        // 2. Resolve user profiles in bulk
        const agentIds = resolvedStats.map(s => s.assignedTo).filter(id => !!id) as string[];
        const agents = await this.prisma.user.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, fullName: true, email: true }
        });

        const results = resolvedStats.map((stat) => {
            if (!stat.assignedTo) return null;
            const user = agents.find(a => a.id === stat.assignedTo);
            return {
                agent: user || { id: stat.assignedTo, fullName: 'Unknown', email: '' },
                ticketsResolved: stat._count.id,
                averageCsat: stat._avg.satisfactionScore ? stat._avg.satisfactionScore.toFixed(2) : null
            };
        });

        return results.filter(Boolean);
    }
}
