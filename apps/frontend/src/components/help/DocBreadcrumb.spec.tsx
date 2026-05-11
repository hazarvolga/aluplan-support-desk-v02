import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocBreadcrumb } from './DocBreadcrumb';
import type { BreadcrumbItem } from './types';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('DocBreadcrumb component (task 8.3)', () => {
  const mockPath: BreadcrumbItem[] = [
    { label: 'help.docs.nav.customer_getting_started', nodeId: 'customer_getting_started' },
    { label: 'help.docs.nav.customer_getting_started_dashboard', nodeId: 'customer_getting_started_dashboard' },
  ];

  it('returns null for empty path', () => {
    const { container } = render(<DocBreadcrumb path={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders static root "Yardım" label', () => {
    render(<DocBreadcrumb path={mockPath} />);
    expect(screen.getByText('Yardım')).toBeInTheDocument();
  });

  it('renders all path items except root', () => {
    const onSelect = vi.fn();
    render(<DocBreadcrumb path={mockPath} onNodeSelect={onSelect} />);
    // Should have: 1 clickable button (path items except last) + 1 current page span
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1); // customer_getting_started is clickable, last is current page
  });

  it('marks last item with aria-current="page"', () => {
    render(<DocBreadcrumb path={mockPath} />);
    const currentPage = screen.getByText('help.docs.nav.customer_getting_started_dashboard');
    expect(currentPage.getAttribute('aria-current')).toBe('page');
  });

  it('calls onNodeSelect when clickable item is clicked', () => {
    const onSelect = vi.fn();
    render(<DocBreadcrumb path={mockPath} onNodeSelect={onSelect} />);
    
    // Get the clickable buttons (all except last)
    const buttons = screen.getAllByRole('button');
    const clickableButton = buttons[0]; // First path item
    
    clickableButton.click();
    expect(onSelect).toHaveBeenCalledWith('customer_getting_started');
  });

  it('renders without onNodeSelect (all non-clickable)', () => {
    const { container } = render(<DocBreadcrumb path={mockPath} />);
    // Should not throw
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders single path item as current page', () => {
    const singlePath: BreadcrumbItem[] = [
      { label: 'customer.dashboard', nodeId: 'customer.dashboard' },
    ];
    render(<DocBreadcrumb path={singlePath} />);
    expect(screen.getByText('customer.dashboard')).toBeInTheDocument();
  });

  it('has nav element with aria-label', () => {
    const { container } = render(<DocBreadcrumb path={mockPath} />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});