import { z } from 'zod';
import { BaseEmailSchema } from '../email/contracts/base.contract';

/**
 * Canonical shape for `{{customer.*}}` variables in announcement emails.
 * Both the broadcast path (AnnouncementsService.broadcast) and the preview
 * path (admin announcement editor / template library) must build their
 * `customer` context through `buildAnnouncementEmailContext` so a template
 * that renders correctly in preview renders identically for real recipients.
 */
export const AnnouncementCustomerContextSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    companyName: z.string(),
    customerNo: z.string(),
    email: z.string().email(),
    userEmail: z.string().email(),
}).strict();

export type AnnouncementEmailCustomerContext = z.infer<typeof AnnouncementCustomerContextSchema>;

export const AnnouncementEmailSchema = BaseEmailSchema.extend({
    customer: AnnouncementCustomerContextSchema,
});

/**
 * Minimal shape this builder needs from a Prisma CustomerProfile record.
 * CustomerProfile has no email column of its own — the recipient's address
 * always comes from the related User.
 */
export interface AnnouncementEmailCustomerSource {
    firstName: string;
    lastName: string;
    companyName: string;
    customerNo: string;
    user: { email: string };
}

export function buildAnnouncementEmailContext(
    customer: AnnouncementEmailCustomerSource,
): AnnouncementEmailCustomerContext {
    const firstName = customer.firstName ?? '';
    const lastName = customer.lastName ?? '';

    return {
        firstName,
        lastName,
        fullName: [firstName, lastName].filter((part) => part.trim().length > 0).join(' '),
        companyName: customer.companyName ?? '',
        customerNo: customer.customerNo ?? '',
        email: customer.user.email,
        userEmail: customer.user.email,
    };
}
