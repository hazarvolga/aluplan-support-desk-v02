import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

function createDto<T>(Type: new () => T, value: Partial<T>): T {
    return plainToInstance(Type, value);
}

describe('user role DTO boundary', () => {
    it.each(['admin', 'support_manager', 'support-agent', 'viewer'])('accepts assignable role %s', async (role) => {
        const dto = createDto(CreateUserDto, {
            email: 'user@example.com', password: 'secret1', fullName: 'User', roles: [role],
        });

        await expect(validate(dto)).resolves.toEqual([]);
    });

    it.each(['SUPER_ADMIN', 'SUPERUSER', 'CUSTOMER', 'unknown'])('rejects protected or arbitrary role %s', async (role) => {
        const dto = createDto(CreateUserDto, {
            email: 'user@example.com', password: 'secret1', fullName: 'User', roles: [role],
        });

        const errors = await validate(dto);
        expect(errors.some(error => error.property === 'roles')).toBe(true);
    });

    it('rejects multiple simultaneous roles on create and update', async () => {
        const roles = ['admin', 'viewer'];
        const createErrors = await validate(createDto(CreateUserDto, {
            email: 'user@example.com', password: 'secret1', fullName: 'User', roles,
        }));
        const updateErrors = await validate(createDto(UpdateUserDto, { roles }));

        expect(createErrors.some(error => error.property === 'roles')).toBe(true);
        expect(updateErrors.some(error => error.property === 'roles')).toBe(true);
    });
});
