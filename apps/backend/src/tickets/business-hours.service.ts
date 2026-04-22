import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    addMinutes,
    isBefore,
    isAfter,
    setHours,
    setMinutes,
    addDays,
    getDay,
    startOfDay,
} from 'date-fns';

@Injectable()
export class BusinessHoursService {
    private readonly logger = new Logger(BusinessHoursService.name);

    constructor(private readonly prisma: PrismaService) { }

    private cachedBusinessHours: any[] | null = null;
    private cachedHolidays: any[] | null = null;
    private lastCacheUpdate: number = 0;
    private readonly CACHE_TTL = 300000; // 5 minutes

    /**
     * Calculates a deadline date by adding business hours to a starting date,
     * skipping weekends, holidays, and non-working hours.
     * Uses a short-term cache for config to prevent N+1 bottlenecks.
     */
    async calculateDeadline(from: Date, hoursToAdd: number): Promise<Date> {
        const now = Date.now();
        if (!this.cachedBusinessHours || !this.cachedHolidays || (now - this.lastCacheUpdate > this.CACHE_TTL)) {
            const [bh, h] = await Promise.all([
                this.prisma.businessHours.findMany(),
                this.prisma.holiday.findMany(),
            ]);
            this.cachedBusinessHours = bh;
            this.cachedHolidays = h;
            this.lastCacheUpdate = now;
            this.logger.debug('✨ Business hours and holidays cache refreshed');
        }

        const businessHours = this.cachedBusinessHours;
        const holidays = this.cachedHolidays;

        let current = new Date(from);
        let minutesLeft = hoursToAdd * 60;

        // Default schedule if DB is empty: Mon-Fri, 09:00-18:00
        const getDefaultSchedule = (dow: number) => {
            if (dow === 0 || dow === 6) return { isWorkingDay: false };
            return { isWorkingDay: true, startTime: '09:00', endTime: '18:00' };
        };

        let iterations = 0;
        const MAX_DAYS_AHEAD = 365; // Safety break

        while (minutesLeft > 0 && iterations < MAX_DAYS_AHEAD) {
            const dayOfWeek = getDay(current);
            const dbSchedule = businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
            const schedule = dbSchedule || getDefaultSchedule(dayOfWeek);

            const isHoliday = holidays.some((h) => {
                const hDate = new Date(h.date);
                return (
                    hDate.getUTCDate() === current.getUTCDate() &&
                    hDate.getUTCMonth() === current.getUTCMonth() &&
                    (h.isRecurring || hDate.getUTCFullYear() === current.getUTCFullYear())
                );
            });

            if (!schedule.isWorkingDay || isHoliday) {
                // Move to start of next day
                current = startOfDay(addDays(current, 1));
                iterations++;
                continue;
            }

            // Parse start/end times (default to 09:00-18:00 if strings are missing)
            const [startH, startM] = (schedule.startTime || '09:00').split(':').map(Number);
            const [endH, endM] = (schedule.endTime || '18:00').split(':').map(Number);

            const dayStart = setMinutes(setHours(startOfDay(current), startH), startM);
            const dayEnd = setMinutes(setHours(startOfDay(current), endH), endM);

            // If current time is before working hours today, move to start of working hours
            if (isBefore(current, dayStart)) {
                current = dayStart;
            }

            // If current time is after working hours today, move to tomorrow
            if (isAfter(current, dayEnd)) {
                current = startOfDay(addDays(current, 1));
                iterations++;
                continue;
            }

            // Calculate remaining minutes in today's working window
            const remainingMinutesInWindow = (dayEnd.getTime() - current.getTime()) / (60 * 1000);

            if (minutesLeft <= remainingMinutesInWindow) {
                // Deadline is within today's window
                return addMinutes(current, minutesLeft);
            } else {
                // Consume today's window and move to tomorrow
                minutesLeft -= remainingMinutesInWindow;
                current = startOfDay(addDays(current, 1));
                iterations++;
            }
        }

        this.logger.warn(`Deadline calculation exceeded ${MAX_DAYS_AHEAD} days limit. Returning partial calculation.`);
        return current;
    }
}
