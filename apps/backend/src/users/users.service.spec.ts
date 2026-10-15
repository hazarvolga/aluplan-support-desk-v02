import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, mockRedisService } from '../test/mock.utils';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/security.constants';

jest.mock('bcryptjs');

describe('UsersService', () => {
    let service: UsersService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: ConfigService, useValue: { get: jest.fn((_k: string, def?: any) => def ?? '24h') } },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
        prisma.role = prisma.role ?? { findFirst: jest.fn() };

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should throw ConflictException if email exists', async () => {
            // Arrange
            prisma.user.findFirst.mockResolvedValue({ id: '1' });

            // Act & Assert
            await expect(service.create({ email: 'test@t.com', password: 'pw', fullName: 'Test' }, { id: 'admin-1', role: 'ADMIN' }))
                .rejects.toThrow(ConflictException);
        });

        it('should hash password and create user', async () => {
            // Arrange
            prisma.user.findFirst.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            const createdUser = { id: '1', email: 'test@t.com', passwordHash: 'hashed_pw', fullName: 'Test' };
            prisma.user.create.mockResolvedValue(createdUser);

            // Act
            const result = await service.create({ email: 'test@t.com', password: 'pw', fullName: 'Test' }, { id: 'admin-1', role: 'ADMIN' });

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('pw', BCRYPT_ROUNDS);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).toEqual({ id: '1', email: 'test@t.com', fullName: 'Test' });
        });

        it('maps concurrent duplicate-email creation to a stable conflict response', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            prisma.user.create.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }));

            await expect(service.create(
                { email: 'duplicate@example.com', password: 'secret1', fullName: 'Duplicate' },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ConflictException);
        });

        it('returns only the canonical safe projection for newly created users', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            prisma.user.create.mockResolvedValue({
                id: '1', email: 'safe@example.com', fullName: 'Safe', status: 'ACTIVE',
                passwordHash: 'secret', refreshTokenHash: 'secret', emailVerificationJtiHash: 'secret',
                passwordResetJtiHash: 'secret', apiKeyHash: 'secret', sessionHash: 'secret',
            });

            const result = await service.create(
                { email: 'safe@example.com', password: 'secret1', fullName: 'Safe' },
                { id: 'admin-1', role: 'ADMIN' },
            );

            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                select: expect.objectContaining({ id: true, email: true, fullName: true }),
            }));
            expect(result).toEqual({ id: '1', email: 'safe@example.com', fullName: 'Safe', status: 'ACTIVE' });
        });

        it('atomically promotes an existing CUSTOMER and returns only safe fields', async () => {
            prisma.user.findFirst.mockResolvedValue({
                id: 'customer-1', fullName: 'Customer', role: { name: 'CUSTOMER' },
            });
            prisma.role.findFirst.mockResolvedValue({ id: 'role-agent', name: 'SUPPORT_AGENT' });
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            prisma.user.update.mockResolvedValue({
                id: 'customer-1', email: 'customer@example.com', fullName: 'Agent', status: 'ACTIVE',
                passwordHash: 'secret', refreshTokenHash: 'secret', emailVerificationJtiHash: 'secret',
                passwordResetJtiHash: 'secret', apiKeyHash: 'secret', sessionHash: 'secret',
            });

            const result = await service.create({
                email: 'customer@example.com', password: 'secret1', fullName: 'Agent', roles: ['support_agent'],
            }, { id: 'admin-1', role: 'ADMIN' });

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    id: 'customer-1',
                    deletedAt: null,
                    role: { is: { name: { equals: 'CUSTOMER', mode: 'insensitive' } } },
                },
                select: expect.objectContaining({ id: true, email: true, fullName: true }),
                data: expect.objectContaining({
                    passwordHash: 'hashed_pw',
                    roleId: 'role-agent',
                    sessionVersion: { increment: 1 },
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                }),
            }));
            expect(result).toEqual({
                id: 'customer-1', email: 'customer@example.com', fullName: 'Agent', status: 'ACTIVE',
            });
        });

        it('maps a concurrent CUSTOMER promotion miss to ConflictException', async () => {
            prisma.user.findFirst.mockResolvedValue({
                id: 'customer-1', fullName: 'Customer', role: { name: 'CUSTOMER' },
            });
            prisma.role.findFirst.mockResolvedValue({ id: 'role-agent', name: 'SUPPORT_AGENT' });
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            prisma.user.update.mockRejectedValue(Object.assign(new Error('Record not found'), { code: 'P2025' }));

            await expect(service.create({
                email: 'customer@example.com', password: 'secret1', fullName: 'Agent', roles: ['support_agent'],
            }, { id: 'admin-1', role: 'ADMIN' })).rejects.toThrow(ConflictException);
        });

        it('normalizes email before creating users', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
            prisma.user.create.mockResolvedValue({
                id: '1',
                email: 'mixed@example.com',
                passwordHash: 'hashed_pw',
                fullName: 'Mixed Case',
            });

            await service.create({ email: ' Mixed@Example.COM ', password: 'pw', fullName: 'Mixed Case' }, { id: 'admin-1', role: 'ADMIN' });

            expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { email: { equals: 'mixed@example.com', mode: 'insensitive' } },
            }));
            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ email: 'mixed@example.com' }),
            }));
        });

        it.each(['SUPER_ADMIN', 'SUPERUSER', 'customer', 'unknown'])('rejects non-assignable role %s before querying roles', async (role) => {
            await expect(service.create({
                email: 'new@example.com',
                password: 'secret1',
                fullName: 'New User',
                roles: [role],
            }, { id: 'admin-1', role: 'ADMIN' })).rejects.toThrow(BadRequestException);

            expect(prisma.role.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it('rejects user creation when the authenticated actor is outside the management hierarchy', async () => {
            await expect(service.create({
                email: 'new@example.com',
                password: 'secret1',
                fullName: 'New User',
                roles: ['viewer'],
            }, { id: 'manager-1', role: 'SUPPORT_MANAGER' })).rejects.toThrow(ForbiddenException);

            expect(prisma.user.findFirst).not.toHaveBeenCalled();
        });

        it('normalizes an allowed role and rejects a missing canonical database role', async () => {
            prisma.user.findFirst.mockResolvedValue(null);
            prisma.role.findFirst.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');

            await expect(service.create({
                email: 'new@example.com', password: 'secret1', fullName: 'New User', roles: ['support-manager'],
            }, { id: 'superuser-1', role: 'SUPERUSER' })).rejects.toThrow(BadRequestException);

            expect(prisma.role.findFirst).toHaveBeenCalledWith({
                where: { name: { equals: 'SUPPORT_MANAGER', mode: 'insensitive' } },
            });
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('maps the exact allowed role payload without mutating the caller DTO', async () => {
            const dto = { fullName: 'Updated User', roles: ['support_agent'] };
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.role.findFirst.mockResolvedValue({ id: 'role-agent', name: 'SUPPORT_AGENT' });
            prisma.user.update.mockResolvedValue({ id: 'user-1', fullName: 'Updated User', roleId: 'role-agent' });

            await service.update('user-1', dto, { id: 'admin-1', role: 'ADMIN' });

            expect(dto).toEqual({ fullName: 'Updated User', roles: ['support_agent'] });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 'user-1',
                    deletedAt: null,
                    NOT: {
                        role: {
                            is: {
                                name: { in: ['SUPER_ADMIN', 'SUPERUSER'], mode: 'insensitive' },
                            },
                        },
                    },
                },
                data: {
                    fullName: 'Updated User',
                    roleId: 'role-agent',
                    sessionVersion: { increment: 1 },
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                },
                select: expect.objectContaining({ id: true, email: true, fullName: true }),
            });
        });

        it('revokes existing sessions when an administrator resets another user password', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-password-hash');
            prisma.user.update.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });

            await service.update('user-1', { password: 'new-password' }, { id: 'admin-1', role: 'ADMIN' });

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: {
                    passwordHash: 'new-password-hash',
                    sessionVersion: { increment: 1 },
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                },
            }));
        });

        it('requires the current-password profile flow for an administrator changing their own password', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'admin-1', role: { name: 'ADMIN' } });

            await expect(service.update(
                'admin-1',
                { password: 'new-password' },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ForbiddenException);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('maps duplicate email races to a stable conflict response', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.user.update.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }));

            await expect(service.update(
                'user-1',
                { email: 'duplicate@example.com' },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ConflictException);
        });

        it.each(['SUPER_ADMIN', 'SUPERUSER'])('blocks updates to protected %s accounts', async (targetRole) => {
            prisma.user.findFirst.mockResolvedValue({ id: 'protected-1', role: { name: targetRole } });

            await expect(service.update(
                'protected-1',
                { fullName: 'Compromised', roles: ['viewer'] },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ForbiddenException);

            expect(prisma.role.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('prevents an administrator from changing their own role', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'admin-1', role: { name: 'ADMIN' } });

            await expect(service.update(
                'admin-1',
                { roles: ['viewer'] },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ForbiddenException);

            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('rejects an administrator sending even an apparent no-op role update for themselves', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'admin-1', role: { name: 'ADMIN' } });

            await expect(service.update(
                'admin-1',
                { roles: ['admin'] },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ForbiddenException);

            expect(prisma.role.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('revokes sessions whenever a role payload is supplied, including apparent no-op assignments', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.role.findFirst.mockResolvedValue({ id: 'role-viewer', name: 'VIEWER' });
            prisma.user.update.mockResolvedValue({ id: 'user-1', roleId: 'role-viewer' });

            await service.update('user-1', { roles: ['viewer'] }, { id: 'admin-1', role: 'ADMIN' });

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: {
                    roleId: 'role-viewer',
                    sessionVersion: { increment: 1 },
                    refreshTokenHash: null,
                    passwordResetJtiHash: null,
                },
            }));
        });

        it('rejects arbitrary role elevation through update', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });

            await expect(service.update(
                'user-1',
                { roles: ['SUPER_ADMIN'] },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(BadRequestException);

            expect(prisma.role.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('returns only the explicit safe user projection after update', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.user.update.mockResolvedValue({
                id: 'user-1',
                email: 'safe@example.com',
                fullName: 'Safe User',
                status: 'ACTIVE',
                passwordHash: 'must-never-leak',
                refreshTokenHash: 'must-never-leak',
                emailVerificationJtiHash: 'must-never-leak',
                passwordResetJtiHash: 'must-never-leak',
                apiKeyHash: 'must-never-leak',
                sessionHash: 'must-never-leak',
            });

            const result = await service.update(
                'user-1',
                { fullName: 'Safe User' },
                { id: 'admin-1', role: 'ADMIN' },
            );

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                select: expect.objectContaining({
                    id: true,
                    email: true,
                    fullName: true,
                }),
            }));
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('refreshTokenHash');
            expect(result).not.toHaveProperty('emailVerificationJtiHash');
            expect(result).not.toHaveProperty('passwordResetJtiHash');
            expect(result).not.toHaveProperty('apiKeyHash');
            expect(result).not.toHaveProperty('sessionHash');
        });

        it('fails closed when the target becomes protected concurrently', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.user.update.mockRejectedValue(Object.assign(new Error('Record not found'), { code: 'P2025' }));

            await expect(service.update(
                'user-1',
                { fullName: 'Unsafe update' },
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ConflictException);
        });
    });

    describe('findOne', () => {
        it('returns only safe user and customer profile fields', async () => {
            // Arrange
            const user = {
                id: '1', passwordHash: 'hash', refreshTokenHash: 'hash', emailVerificationJtiHash: 'hash',
                passwordResetJtiHash: 'hash', apiKeyHash: 'hash', sessionHash: 'hash', email: 'test@t.com',
                customerProfile: { id: 'profile-1', companyName: 'Safe Co', rawCrmPayload: { token: 'secret' }, hotinfoRaw: 'secret' },
            };
            prisma.user.findFirst.mockResolvedValue(user);

            // Act
            const result = await service.findOne('1');

            // Assert
            expect(result).not.toHaveProperty('passwordHash');
            expect(result.email).toBe('test@t.com');
            expect(result.customerProfile).toEqual({ id: 'profile-1', companyName: 'Safe Co' });
            expect(result).not.toHaveProperty('refreshTokenHash');
            expect(result).not.toHaveProperty('emailVerificationJtiHash');
            expect(result).not.toHaveProperty('passwordResetJtiHash');
            expect(result).not.toHaveProperty('apiKeyHash');
            expect(result).not.toHaveProperty('sessionHash');
        });

        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            prisma.user.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEmail', () => {
        it('returns only safe user and role fields', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: '1', email: 'test@t.com', fullName: 'Test', passwordHash: 'hash', refreshTokenHash: 'hash',
                emailVerificationJtiHash: 'hash', passwordResetJtiHash: 'hash', apiKeyHash: 'hash', sessionHash: 'hash',
                role: { id: 'role-1', name: 'VIEWER', description: 'Safe', internalHash: 'secret' },
            });

            const result = await service.findByEmail('test@t.com');

            expect(result).toEqual({
                id: '1', email: 'test@t.com', fullName: 'Test',
                role: { id: 'role-1', name: 'VIEWER', description: 'Safe' },
            });
        });
    });

    describe('findAll', () => {
        it('should return safe staff summaries without secret or raw CRM fields', async () => {
            const role = { id: 'role-admin', name: 'ADMIN', description: 'Admin' };
            prisma.user.findMany.mockResolvedValue([{
                id: 'agent1',
                email: 'agent@example.com',
                fullName: 'Agent One',
                role,
                teamMembers: [],
            }]);

            const result = await service.findAll('agent');

            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: 'ACTIVE',
                    role: expect.objectContaining({
                        name: expect.objectContaining({ not: 'CUSTOMER' }),
                    }),
                }),
                select: expect.not.objectContaining({
                    passwordHash: expect.anything(),
                    refreshTokenHash: expect.anything(),
                    hotinfoRaw: expect.anything(),
                    rawCrmPayload: expect.anything(),
                }),
            }));
            expect(result[0]).toEqual(expect.objectContaining({
                id: 'agent1',
                email: 'agent@example.com',
                userRoles: [{ role }],
            }));
            expect(result[0]).not.toHaveProperty('passwordHash');
            expect(result[0]).not.toHaveProperty('refreshTokenHash');
            expect(result[0]).not.toHaveProperty('customerProfile.rawCrmPayload');
        });
    });

    describe('updateProfile', () => {
        it('should update user and create customer profile if it does not exist', async () => {
            // Arrange
            const dto = { fullName: 'New Name', companyName: 'Acme Corp' };
            const existingUser = { id: '1', fullName: 'Old Name', status: 'ACTIVE', deletedAt: null, passwordHash: 'hash', customerProfile: null };
            const updatedUser = { id: '1', fullName: 'New Name', status: 'ACTIVE', deletedAt: null, passwordHash: 'hash', customerProfile: null };

            prisma.user.findUnique.mockResolvedValue(existingUser);
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

        it('filters every credential and session hash from profile responses', async () => {
            const secrets = {
                passwordHash: 'secret', refreshTokenHash: 'secret', emailVerificationJtiHash: 'secret',
                passwordResetJtiHash: 'secret', apiKeyHash: 'secret', sessionHash: 'secret',
            };
            prisma.user.findUnique
                .mockResolvedValueOnce({ id: '1', fullName: 'Old', status: 'ACTIVE', deletedAt: null, customerProfile: null, ...secrets })
                .mockResolvedValueOnce({ id: '1', email: 'safe@example.com', fullName: 'New', status: 'ACTIVE', customerProfile: null, ...secrets });
            prisma.user.update.mockResolvedValue({ id: '1', fullName: 'New', status: 'ACTIVE', customerProfile: null, ...secrets });

            const result = await service.updateProfile('1', { fullName: 'New' });

            expect(result).toEqual({
                id: '1', email: 'safe@example.com', fullName: 'New', status: 'ACTIVE',
                customerProfile: null, passwordChanged: false,
            });
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            prisma.auditLog = { create: jest.fn() };
        });

        it('soft deletes a regular user and audits the authenticated management actor', async () => {
            const deletedAt = new Date('2026-10-14T08:00:00.000Z');
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.user.update.mockResolvedValue({
                id: 'user-1',
                email: 'user@example.com',
                fullName: 'User',
                status: 'INACTIVE',
                deletedAt,
                passwordHash: 'must-never-leak',
                refreshTokenHash: 'must-never-leak',
                emailVerificationJtiHash: 'must-never-leak',
                passwordResetJtiHash: 'must-never-leak',
                apiKeyHash: 'must-never-leak',
                sessionHash: 'must-never-leak',
            });

            const result = await service.remove('user-1', { id: 'admin-1', role: 'ADMIN' });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 'user-1',
                    deletedAt: null,
                    NOT: {
                        role: {
                            is: {
                                name: { in: ['SUPER_ADMIN', 'SUPERUSER'], mode: 'insensitive' },
                            },
                        },
                    },
                },
                data: { deletedAt: expect.any(Date), status: 'INACTIVE' },
                select: expect.objectContaining({ id: true, email: true, fullName: true }),
            });
            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    action: 'user.delete',
                    actorId: 'admin-1',
                    entityType: 'USER',
                    entityId: 'user-1',
                }),
            });
            expect(result).not.toHaveProperty('passwordHash');
            expect(result).not.toHaveProperty('refreshTokenHash');
            expect(result).not.toHaveProperty('emailVerificationJtiHash');
            expect(result).not.toHaveProperty('passwordResetJtiHash');
            expect(result).not.toHaveProperty('apiKeyHash');
            expect(result).not.toHaveProperty('sessionHash');
        });

        it('rejects self deletion before any mutation or audit', async () => {
            await expect(service.remove('admin-1', { id: 'admin-1', role: 'ADMIN' }))
                .rejects.toThrow(ForbiddenException);

            expect(prisma.user.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
        });

        it.each(['SUPER_ADMIN', 'SUPERUSER'])('rejects deletion of protected %s accounts', async (targetRole) => {
            prisma.user.findFirst.mockResolvedValue({ id: 'protected-1', role: { name: targetRole } });

            await expect(service.remove(
                'protected-1',
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ForbiddenException);

            expect(prisma.user.update).not.toHaveBeenCalled();
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
        });

        it.each([
            { id: '', role: 'ADMIN' },
            { id: 'agent-1', role: 'SUPPORT_AGENT' },
            { id: 'manager-1', role: 'SUPPORT_MANAGER' },
        ])('rejects a non-canonical management actor %#', async (actor) => {
            await expect(service.remove('user-1', actor)).rejects.toThrow(ForbiddenException);

            expect(prisma.user.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
        });

        it('returns not found without mutation or audit for a missing target', async () => {
            prisma.user.findFirst.mockResolvedValue(null);

            await expect(service.remove(
                'missing-user',
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(NotFoundException);

            expect(prisma.user.update).not.toHaveBeenCalled();
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
        });

        it('fails closed and skips audit when the target changes concurrently', async () => {
            prisma.user.findFirst.mockResolvedValue({ id: 'user-1', role: { name: 'VIEWER' } });
            prisma.user.update.mockRejectedValue(Object.assign(new Error('Record not found'), { code: 'P2025' }));

            await expect(service.remove(
                'user-1',
                { id: 'admin-1', role: 'ADMIN' },
            )).rejects.toThrow(ConflictException);

            expect(prisma.auditLog.create).not.toHaveBeenCalled();
        });
    });
});
