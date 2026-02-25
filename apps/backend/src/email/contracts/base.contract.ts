import { z } from 'zod';

export const BrandSchema = z.object({
    name: z.string(),
    help_center_url: z.string().url(),
    primary_color: z.string(),
    logo_url: z.string(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    social_linkedin: z.string().optional(),
    social_twitter: z.string().optional(),
    social_facebook: z.string().optional(),
    social_instagram: z.string().optional(),
    social_pinterest: z.string().optional(),
});

export const BaseEmailSchema = z.object({
    userId: z.string().optional(),
    brand: BrandSchema,
    t: z.record(z.any()), // Translation map
    unsubscribe_url: z.string().url().optional(),
});

export const TicketEmailSchema = BaseEmailSchema.extend({
    ticketId: z.string(),
    ticketNumber: z.string().optional(),
    ticketSubject: z.string().optional(),
    ticketPriority: z.string().optional(),
    ticketUrl: z.string().url(),
});

export type BaseEmailData = z.infer<typeof BaseEmailSchema>;
export type TicketEmailData = z.infer<typeof TicketEmailSchema>;
