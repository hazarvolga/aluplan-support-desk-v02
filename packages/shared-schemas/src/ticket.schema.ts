import { z } from 'zod';

export const UuidSchema = z.string().uuid();

export const CreateTicketSchema = z.object({
    subject: z
        .string()
        .min(5, 'Konu en az 5 karakter olmalıdır.')
        .max(255, 'Konu en fazla 255 karakter olabilir.'),
    description: z
        .string()
        .min(10, 'Açıklama en az 10 karakter olmalıdır.')
        .max(5000, 'Açıklama en fazla 5000 karakter olabilir.'),
    productId: UuidSchema.nullish(),
    category: z.string().max(100).nullish(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    attachments: z.array(z.string().url()).max(10).optional(),
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;

export const AddMessageSchema = z.object({
    ticketId: UuidSchema,
    message: z
        .string()
        .min(1, 'Mesaj boş olamaz.')
        .max(10000, 'Mesaj en fazla 10000 karakter olabilir.'),
    isInternal: z.boolean().default(false),
    attachments: z.array(z.string().url()).max(10).optional(),
});

export type AddMessageDto = z.infer<typeof AddMessageSchema>;

export const UpdateTicketSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignedToId: UuidSchema.nullish(),
    teamId: UuidSchema.nullish(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    dueDate: z.string().datetime().nullish(),
}).strict();

export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
