import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { passesAA } from '@/lib/contrast';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge contrast classes', () => {
    it('uses stronger light-mode text for agent and viewer badges', () => {
        const { getByText, rerender } = render(<RoleBadge role="AGENT" />);
        expect(getByText('roles.agent')).toHaveClass('text-slate-700');
        expect(getByText('roles.agent')).toHaveClass('dark:text-slate-400');
        expect(getByText('roles.agent')).not.toHaveClass('text-slate-500');

        rerender(<RoleBadge role="VIEWER" />);
        expect(getByText('roles.viewer')).toHaveClass('text-stone-700');
        expect(getByText('roles.viewer')).toHaveClass('dark:text-stone-400');
        expect(getByText('roles.viewer')).not.toHaveClass('text-stone-500');
    });

    it('keeps adjusted role colors above AA on white', () => {
        expect(passesAA('#334155', '#ffffff')).toBe(true);
        expect(passesAA('#44403c', '#ffffff')).toBe(true);
    });
});
