import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
    it('renders default variant', () => {
        render(<Badge>Default</Badge>);
        expect(screen.getByText('Default')).toBeDefined();
    });

    it('renders secondary variant', () => {
        render(<Badge variant="secondary">Secondary</Badge>);
        expect(screen.getByText('Secondary')).toBeDefined();
    });

    it('renders destructive variant', () => {
        render(<Badge variant="destructive">Destructive</Badge>);
        expect(screen.getByText('Destructive')).toBeDefined();
    });

    it('renders outline variant', () => {
        render(<Badge variant="outline">Outline</Badge>);
        expect(screen.getByText('Outline')).toBeDefined();
    });

    it('applies custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge.className).toContain('custom-class');
    });
});
