import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto validation with production ValidationPipe (SEC-03)', () => {
    // Real production ValidationPipe configuration from main.ts
    const productionPipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    });

    async function transformBody(payload: Record<string, any>): Promise<UpdateProfileDto> {
        return (await productionPipe.transform(payload, {
            type: 'body',
            metatype: UpdateProfileDto,
        })) as UpdateProfileDto;
    }

    describe('Normal profile updates without password change', () => {
        it('should pass with only fullName and companyName', async () => {
            const dto = await transformBody({
                fullName: 'Ahmet Yılmaz',
                companyName: 'Aluplan Ltd',
            });
            expect(dto.fullName).toBe('Ahmet Yılmaz');
            expect(dto.companyName).toBe('Aluplan Ltd');
            expect(dto.currentPassword).toBeUndefined();
            expect(dto.password).toBeUndefined();
            expect(dto.newPassword).toBeUndefined();
        });

        it('should pass with all non-password profile fields', async () => {
            const dto = await transformBody({
                fullName: 'Ayşe Demir',
                phone: '+905551234567',
                companyName: 'Demir Mimarlık',
                jobTitle: 'Mimar',
                industry: 'İnşaat',
                language: 'tr',
            });
            expect(dto.fullName).toBe('Ayşe Demir');
            expect(dto.phone).toBe('+905551234567');
            expect(dto.companyName).toBe('Demir Mimarlık');
            expect(dto.jobTitle).toBe('Mimar');
            expect(dto.industry).toBe('İnşaat');
            expect(dto.language).toBe('tr');
        });
    });

    describe('Password change fields with strict JSON type preservation', () => {
        it('should pass with valid string currentPassword and newPassword (>= 8 chars)', async () => {
            const dto = await transformBody({
                currentPassword: 'oldPassword123',
                newPassword: 'newSecurePassword456',
            });
            expect(dto.currentPassword).toBe('oldPassword123');
            expect(dto.newPassword).toBe('newSecurePassword456');
        });

        it('should pass with valid string currentPassword and legacy password alias (>= 8 chars)', async () => {
            const dto = await transformBody({
                currentPassword: 'oldPassword123',
                password: 'newSecurePassword456',
            });
            expect(dto.currentPassword).toBe('oldPassword123');
            expect(dto.password).toBe('newSecurePassword456');
        });

        it('should REJECT boolean currentPassword (e.g. currentPassword: true) without coercing to string "true"', async () => {
            await expect(transformBody({
                currentPassword: true,
                password: 'validNewPassword123',
            })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT numeric currentPassword (e.g. currentPassword: 12345678) without coercing to string "12345678"', async () => {
            await expect(transformBody({
                currentPassword: 12345678,
                password: 'validNewPassword123',
            })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT boolean password (e.g. password: true) without coercing to string "true"', async () => {
            await expect(transformBody({
                currentPassword: 'validOldPassword123',
                password: true,
            })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT numeric password (e.g. password: 12345678) without coercing to string "12345678"', async () => {
            await expect(transformBody({
                currentPassword: 'validOldPassword123',
                password: 12345678,
            })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT newPassword shorter than 8 characters', async () => {
            await expect(transformBody({
                currentPassword: 'validOldPassword123',
                newPassword: 'short',
            })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT legacy password alias shorter than 8 characters', async () => {
            await expect(transformBody({
                currentPassword: 'validOldPassword123',
                password: 'short',
            })).rejects.toThrow(BadRequestException);
        });

        it('should REJECT unexpected/unwhitelisted fields (forbidNonWhitelisted)', async () => {
            await expect(transformBody({
                fullName: 'Test User',
                isAdmin: true,
            })).rejects.toThrow(BadRequestException);
        });
    });
});
