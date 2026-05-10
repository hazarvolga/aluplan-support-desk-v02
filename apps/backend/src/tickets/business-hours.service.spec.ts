import { Test, TestingModule } from '@nestjs/testing';
import { BusinessHoursService } from './business-hours.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BusinessHoursService', () => {
    let service: BusinessHoursService;
    let prisma: { businessHours: { findMany: jest.Mock }; holiday: { findMany: jest.Mock } };

    const mockBusinessHours = [
        { dayOfWeek: 1, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 6, isWorkingDay: false },
        { dayOfWeek: 0, isWorkingDay: false },
    ];

    beforeEach(async () => {
        prisma = {
            businessHours: { findMany: jest.fn().mockResolvedValue(mockBusinessHours) },
            holiday: { findMany: jest.fn().mockResolvedValue([]) },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [BusinessHoursService, { provide: PrismaService, useValue: prisma }],
        }).compile();

        service = module.get<BusinessHoursService>(BusinessHoursService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should cache business hours on first call', async () => {
        await service.calculateDeadline(new Date(), 1);
        expect(prisma.businessHours.findMany).toHaveBeenCalled();
    });

    it('should use cached data on second call', async () => {
        await service.calculateDeadline(new Date(), 1);
        await service.calculateDeadline(new Date(), 1);
        expect(prisma.businessHours.findMany).toHaveBeenCalledTimes(1);
    });
});