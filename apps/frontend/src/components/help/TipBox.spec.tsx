import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TipBox, tipBoxVariants, iconVariants } from './TipBox';

describe('TipBox component (task 8.2)', () => {
  // ─────────────────────────────────────────────────────────────────────────
  // Variant CSS tests (task 8.8)
  // ─────────────────────────────────────────────────────────────────────────

  describe('tipBoxVariants', () => {
    it('returns tip variant classes', () => {
      const result = tipBoxVariants({ variant: 'tip' });
      expect(result).toContain('bg-amber-900/20');
      expect(result).toContain('border-amber-500/20');
      expect(result).toContain('text-amber-100');
    });

    it('returns warning variant classes', () => {
      const result = tipBoxVariants({ variant: 'warning' });
      expect(result).toContain('bg-red-900/20');
      expect(result).toContain('border-red-500/20');
      expect(result).toContain('text-red-100');
    });

    it('returns info variant classes', () => {
      const result = tipBoxVariants({ variant: 'info' });
      expect(result).toContain('bg-blue-900/20');
      expect(result).toContain('border-blue-500/20');
      expect(result).toContain('text-blue-100');
    });

    it('defaults to info when variant is undefined', () => {
      const result = tipBoxVariants({ variant: undefined });
      expect(result).toContain('bg-blue-900/20');
    });
  });

  describe('iconVariants', () => {
    it('returns tip icon color', () => {
      const result = iconVariants({ variant: 'tip' });
      expect(result).toContain('text-amber-400');
    });

    it('returns warning icon color', () => {
      const result = iconVariants({ variant: 'warning' });
      expect(result).toContain('text-red-400');
    });

    it('returns info icon color', () => {
      const result = iconVariants({ variant: 'info' });
      expect(result).toContain('text-blue-400');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Render tests (task 8.2)
  // ─────────────────────────────────────────────────────────────────────────

  it('renders children content', () => {
    render(<TipBox>This is a tip</TipBox>);
    expect(screen.getByText('This is a tip')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<TipBox title="Important!">Read this</TipBox>);
    expect(screen.getByText('Important!')).toBeInTheDocument();
  });

  it('does not render title element when title is undefined', () => {
    render(<TipBox>Just content</TipBox>);
    const title = screen.queryByRole('heading');
    expect(title).not.toBeInTheDocument();
  });

  it('renders tip variant correctly', () => {
    const { container } = render(<TipBox variant="tip">Tip content</TipBox>);
    const box = container.firstChild as HTMLElement;
    expect(box.className).toContain('bg-amber-900/20');
  });

  it('renders warning variant correctly', () => {
    const { container } = render(<TipBox variant="warning">Warning content</TipBox>);
    const box = container.firstChild as HTMLElement;
    expect(box.className).toContain('bg-red-900/20');
  });

  it('renders info variant correctly', () => {
    const { container } = render(<TipBox variant="info">Info content</TipBox>);
    const box = container.firstChild as HTMLElement;
    expect(box.className).toContain('bg-blue-900/20');
  });

  it('applies custom className', () => {
    const { container } = render(<TipBox className="custom-class">Content</TipBox>);
    const box = container.firstChild as HTMLElement;
    expect(box.className).toContain('custom-class');
  });

  it('has role="note" for accessibility', () => {
    const { container } = render(<TipBox>Content</TipBox>);
    const box = container.firstChild as HTMLElement;
    expect(box.getAttribute('role')).toBe('note');
  });
});