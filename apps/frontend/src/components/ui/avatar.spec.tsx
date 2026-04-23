import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

describe('Avatar', () => {
    it('renders avatar with fallback', () => {
        render(
            <Avatar>
                <AvatarImage src="https://example.com/avatar.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByText('U')).toBeDefined();
    });

    it('renders fallback text', () => {
        render(
            <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );
        expect(screen.getByText('JD')).toBeDefined();
    });

    it('applies custom className', () => {
        render(
            <Avatar className="custom-avatar">
                <AvatarFallback>A</AvatarFallback>
            </Avatar>
        );
        const avatar = screen.getByText('A').parentElement;
        expect(avatar?.className).toContain('custom-avatar');
    });
});
