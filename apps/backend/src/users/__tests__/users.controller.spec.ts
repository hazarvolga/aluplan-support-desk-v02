import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: any;

    beforeEach(async () => {
        usersService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateProfile: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: usersService }],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const expected = [{ id: 'u1', fullName: 'User 1' }];
            usersService.findAll.mockResolvedValue(expected);
            const result = await controller.findAll();
            expect(result).toEqual(expected);
            expect(usersService.findAll).toHaveBeenCalledWith(undefined);
        });

        it('should filter by type', async () => {
            await controller.findAll('agent');
            expect(usersService.findAll).toHaveBeenCalledWith('agent');
        });
    });

    describe('findOne', () => {
        it('should allow user to view their own profile', async () => {
            const expected = { id: 'u1', fullName: 'User 1' };
            usersService.findOne.mockResolvedValue(expected);
            const req = { user: { sub: 'u1', role: 'CUSTOMER' } };
            const result = await controller.findOne('u1', req);
            expect(result).toEqual(expected);
        });

        it('should allow admin to view any profile', async () => {
            const expected = { id: 'u2', fullName: 'User 2' };
            usersService.findOne.mockResolvedValue(expected);
            const req = { user: { sub: 'u1', role: 'ADMIN' } };
            const result = await controller.findOne('u2', req);
            expect(result).toEqual(expected);
        });

        it('should throw ForbiddenException for non-admin viewing others', () => {
            const req = { user: { sub: 'u1', role: 'AGENT' } };
            expect(() => controller.findOne('u2', req)).toThrow(ForbiddenException);
        });
    });

    describe('lookup', () => {
        it('should find user by email', async () => {
            const expected = { id: 'u1', email: 'test@example.com' };
            usersService.findByEmail.mockResolvedValue(expected);
            const result = await controller.lookup('test@example.com');
            expect(result).toEqual(expected);
            expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
        });
    });

    describe('create', () => {
        it('should create a user', async () => {
            const dto = { email: 'new@example.com', fullName: 'New User', password: 'secret' };
            const expected = { id: 'u-new', ...dto };
            usersService.create.mockResolvedValue(expected);
            const result = await controller.create(dto as any);
            expect(result).toEqual(expected);
            expect(usersService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('updateProfile', () => {
        it('should update own profile', async () => {
            const dto = { fullName: 'Updated Name' };
            const expected = { id: 'u1', fullName: 'Updated Name' };
            usersService.updateProfile.mockResolvedValue(expected);
            const req = { user: { id: 'u1' } };
            const result = await controller.updateProfile(req, dto as any);
            expect(result).toEqual(expected);
            expect(usersService.updateProfile).toHaveBeenCalledWith('u1', dto);
        });
    });

    describe('update', () => {
        it('should update user by admin', async () => {
            const dto = { roleId: 'role-1' };
            const expected = { id: 'u1', roleId: 'role-1' };
            usersService.update.mockResolvedValue(expected);
            const result = await controller.update('u1', dto as any);
            expect(result).toEqual(expected);
            expect(usersService.update).toHaveBeenCalledWith('u1', dto);
        });
    });

    describe('remove', () => {
        it('should remove user by admin', async () => {
            const expected = { id: 'u1' };
            usersService.remove.mockResolvedValue(expected);
            const result = await controller.remove('u1');
            expect(result).toEqual(expected);
            expect(usersService.remove).toHaveBeenCalledWith('u1');
        });
    });
});
