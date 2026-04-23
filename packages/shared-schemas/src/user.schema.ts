import { z } from 'zod';
import { EmailSchema, PasswordSchema } from './auth.schema';

export const UuidSchema = z.string().uuid();

export const CreateUserSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
    fullName: z
        .string()
        .min(2, 'İsim en az 2 karakter olmalıdır.')
        .max(255, 'İsim en fazla 255 karakter olabilir.'),
    roleId: UuidSchema.nullish(),
    departmentId: UuidSchema.nullish(),
    language: z.string().max(10).default('tr'),
    timezone: z.string().max(50).default('Europe/Istanbul'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateProfileSchema = z.object({
    fullName: z.string().min(2).max(255).optional(),
    avatarUrl: z.string().url().nullish(),
    language: z.string().max(10).optional(),
    timezone: z.string().max(50).optional(),
    bio: z.string().max(2000).nullish(),
}).strict();

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
