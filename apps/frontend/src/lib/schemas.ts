/**
 * Frontend Zod Schema Imports
 * 
 * Centralizes shared Zod schema imports from @aluplan/shared-schemas
 * for use in React components, forms, and API clients.
 */

export {
    LoginSchema,
    ResetPasswordSchema,
    CreateTicketSchema,
    AddMessageSchema,
    UpdateTicketSchema,
    CreateUserSchema,
    UpdateProfileSchema,
    // Type exports
    type LoginDto,
    type ResetPasswordDto,
    type CreateTicketDto,
    type AddMessageDto,
    type UpdateTicketDto,
    type CreateUserDto,
    type UpdateProfileDto,
    // Helper schemas
    EmailSchema,
    PasswordSchema,
    UuidSchema,
} from '@aluplan/shared-schemas';
