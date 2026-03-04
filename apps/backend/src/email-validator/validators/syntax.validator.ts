import { Injectable } from '@nestjs/common';

@Injectable()
export class SyntaxValidator {
    private readonly emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    validate(email: string): { isValid: boolean; error?: string } {
        if (!email) return { isValid: false, error: 'Email is required' };

        const isValid = this.emailRegex.test(email);
        return {
            isValid,
            error: isValid ? undefined : 'Invalid syntax'
        };
    }

    extractDomain(email: string): string | null {
        const parts = email.split('@');
        return parts.length === 2 ? parts[1].toLowerCase() : null;
    }

    isRoleBased(email: string): boolean {
        const roles = ['info', 'admin', 'sales', 'support', 'contact', 'billing', 'noreply', 'jobs', 'office', 'webmaster'];
        const localPart = email.split('@')[0].toLowerCase();
        return roles.some(role => localPart === role || localPart.startsWith(role + '.'));
    }
}
