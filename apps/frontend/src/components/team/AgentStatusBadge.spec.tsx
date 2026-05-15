import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { passesAA } from '@/lib/contrast';
import { AgentStatusBadge } from './AgentStatusBadge';

describe('AgentStatusBadge contrast classes', () => {
    it('uses stronger light-mode text for offline badges', () => {
        const { getByText } = render(<AgentStatusBadge status="OFFLINE" />);
        expect(getByText('statuses.offline')).toHaveClass('text-slate-700');
        expect(getByText('statuses.offline')).toHaveClass('dark:text-slate-400');
        expect(getByText('statuses.offline')).not.toHaveClass('text-slate-500');
    });

    it('keeps adjusted offline color above AA on white', () => {
        expect(passesAA('#334155', '#ffffff')).toBe(true);
    });
});
