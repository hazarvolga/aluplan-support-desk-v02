import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HelpDocsSidebar } from './HelpDocsSidebar';

const tree = {
  customer: [{
    id: 'category',
    labelKey: 'category_label',
    children: [{ id: 'leaf', labelKey: 'leaf_label', contentKey: 'leaf_content' }],
  }],
  admin: [],
};

describe('HelpDocsSidebar', () => {
  it('marks expandable tree items as unselected while preserving expansion behavior', () => {
    const { container } = render(
      <HelpDocsSidebar
        tree={tree}
        activeNodeId=""
        onNodeSelect={vi.fn()}
        isOpen={false}
        onToggle={vi.fn()}
      />,
    );

    const categories = container.querySelectorAll('[role="treeitem"][aria-expanded]');
    expect(categories.length).toBeGreaterThan(0);
    categories.forEach((category) => expect(category).toHaveAttribute('aria-selected', 'false'));

    fireEvent.click(screen.getAllByRole('button', { name: 'category_label' })[0]);
    expect(screen.getAllByRole('treeitem', { name: 'leaf_label' }).length).toBeGreaterThan(0);
  });
});
