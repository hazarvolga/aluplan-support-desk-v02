import { z } from 'zod';

export const EmailSchema = z.string().email('Geçerli bir e-posta adresi giriniz.');

export const PasswordSchema = z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .max(128, 'Şifre en fazla 128 karakter olabilir.')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir.')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.')
    .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir.');

export const LoginSchema = z.object({
    email: EmailSchema,
    password: z.string().min(1, 'Şifre gereklidir.'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, 'Token gereklidir.'),
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor.',
    path: ['confirmPassword'],
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
