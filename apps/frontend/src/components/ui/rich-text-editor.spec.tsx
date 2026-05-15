import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RichTextEditor } from './rich-text-editor';

describe('RichTextEditor', () => {
    it('renders the six expected toolbar buttons', () => {
        render(<RichTextEditor value="" onChange={() => undefined} placeholder="Write" />);

        expect(screen.getByRole('button', { name: 'bold' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'italic' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'bulletList' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'orderedList' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'heading2' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'heading3' })).toBeInTheDocument();
    });

    it('disables toolbar buttons when disabled', () => {
        render(<RichTextEditor value="<p>Read only</p>" onChange={() => undefined} disabled />);

        expect(screen.getByRole('button', { name: 'bold' })).toBeDisabled();
    });

    it('calls onSubmit on Ctrl+Enter', () => {
        const onSubmit = vi.fn();
        render(<RichTextEditor value="<p>Hello</p>" onChange={() => undefined} onSubmit={onSubmit} />);

        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true });

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});

