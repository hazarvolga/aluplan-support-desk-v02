import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../test/mock.utils';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
    let service: UsersService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should throw ConflictException if email exists', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue({ id: '1' });

            // Act & Assert
            await expect(service.create({ email: 'test@t.com', password: 'pw', fullName: 'Test' }))
                .rejects.toThrow(ConflictException);
        });

        it('should hash password and create user', async () => {
            // Arrange
            prisma.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            const createdUser = { id: '1', email: 'test@t.com', passwordHash: 'hashed_pw', fullName: 'Test' };
            prisma.user.create.mockResolvedValue(createdUser);

            // Act
            const result = await service.create({ email: 'test@t.com', password: 'pw', fullName: 'Test' });

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).toEqual({ id: '1', email: 'test@t.com', fullName: 'Test' });
        });
    });

    describe('findOne', () => {
        it('should return user without password hash', async () => {
            // Arrange
            const user = { id: '1', passwordHash: 'hash', email: 'test@t.com' };
            prisma.user.findFirst.mockResolvedValue(user);

            // Act
            const result = await service.findOne('1');

            // Assert
            expect(result).not.toHaveProperty('passwordHash');
            expect(result.email).toBe('test@t.com');
        });

        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            prisma.user.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateProfile', () => {
        it('should update user and create customer profile if it does not exist', async () => {
            // Arrange
            const dto = { fullName: 'New Name', companyName: 'Acme Corp' };
            const updatedUser = { id: '1', fullName: 'New Name', passwordHash: 'hash', customerProfile: null };

            prisma.user.update.mockResolvedValue(updatedUser);
            prisma.customerProfile = { count: jest.fn(), create: jest.fn(), update: jest.fn() };
            prisma.customerProfile.count.mockResolvedValue(0);
            prisma.customerProfile.create.mockResolvedValue({ id: 'cp1' });

            // Act
            const result = await service.updateProfile('1', dto);

            // Assert
            expect(prisma.user.update).toHaveBeenCalled();
            expect(prisma.customerProfile.create).toHaveBeenCalled();
            expect(result).not.toHaveProperty('passwordHash');
        });
    });

    describe('remove', () => {
        it('should soft delete user and create audit log', async () => {
            // Arrange
            const user = { id: '1', deletedAt: new Date() };
            prisma.user.update.mockResolvedValue(user);
            prisma.auditLog = { create: jest.fn() }; // Inline mock for audit log if not in mock.utils

            // Act
            await service.remove('1', 'admin1');

            // Assert
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { deletedAt: expect.any(Date), status: 'INACTIVE' }
            });
            expect(prisma.auditLog.create).toHaveBeenCalled();
        });
    });
});
