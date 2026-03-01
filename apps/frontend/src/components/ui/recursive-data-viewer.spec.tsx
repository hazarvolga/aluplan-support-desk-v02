import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecursiveDataViewer } from './recursive-data-viewer';

describe('RecursiveDataViewer Component', () => {
    it('should render simple key-value pairs correctly and format camelCase keys', () => {
        const mockData = {
            allplanVersion: '2024.1',
            osVersion: 'Windows 10',
        };

        render(<RecursiveDataViewer data={mockData} />);

        expect(screen.getByText(/ALLPLAN VERSION/i)).toBeInTheDocument();
        expect(screen.getByText(/2024\.1/i)).toBeInTheDocument();

        expect(screen.getByText(/OS VERSION/i)).toBeInTheDocument();
        expect(screen.getByText(/Windows 10/i)).toBeInTheDocument();
    });

    it('should recursively render objects bypassing initial closed state for root', () => {
        const mockNestedData = {
            systemInfo: {
                cpu: 'Intel Core i9',
            }
        };

        // Omitting 'name' on the outer prop means it defaults to expanded state (isExpanded = true)
        render(<RecursiveDataViewer data={mockNestedData} />);

        // The inner child 'systemInfo' gets generated as a sub-component with name="systemInfo".
        // It will be collapsed by default because it has a name. But the name itself must be rendered!
        const sysInfoButton = screen.getByRole('button', { name: /SYSTEM INFO/i });
        expect(sysInfoButton).toBeInTheDocument();

        // We verified recursion created the nested child element.
    });

    it('should render empty arrays properly without crashing', () => {
        const emptyData = {
            emptyList: []
        };

        render(<RecursiveDataViewer data={emptyData} />);

        expect(screen.getByText(/EMPTY LIST/i)).toBeInTheDocument();
        expect(screen.getByText(/\[\]/i)).toBeInTheDocument();
    });
});
