import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RequirementAccordion from './requirement-accordion';

vi.mock('@/lib/env', () => ({ env: { apiUrl: 'https://api.example.com/' } }));

const requirements = [
    { title: 'ALLPLAN 2026', sections: [{ name: 'OS', items: ['Windows **11**', null] }] },
    { title: 'FRILO Suite', sections: [{ name: 'CPU', items: ['Modern CPU'] }] },
    { title: 'Virtual Desktop', sections: [{ name: 'VM', items: ['Enabled'] }] },
    { title: 'Exchange Service', sections: [{ name: 'Network', items: ['Online'] }] },
    { title: 'Mobile', sections: [{ name: 'Device', items: ['Phone'] }] },
];

describe('RequirementAccordion', () => {
    beforeEach(() => vi.restoreAllMocks());

    it('fetches the localized endpoint, renders every requirement type, and toggles panels', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => requirements });
        vi.stubGlobal('fetch', fetchMock);
        render(<RequirementAccordion locale="tr TR" />);

        expect(await screen.findByText('ALLPLAN 2026')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/api/v1/auth/system-requirements?locale=tr%20TR');
        for (const title of ['FRILO Suite', 'Virtual Desktop', 'Exchange Service', 'Mobile']) {
            expect(screen.getByText(title)).toBeInTheDocument();
        }
        expect(screen.getByText('11', { selector: 'strong' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /ALLPLAN 2026/ }));
        expect(screen.queryByText('Windows')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /FRILO Suite/ }));
        expect(screen.getByText('Modern CPU')).toBeInTheDocument();
    });

    it.each([
        ['https://api.example.com/api', 'https://api.example.com/api/v1/auth/system-requirements?locale=en'],
        ['https://api.example.com/api/v2', 'https://api.example.com/api/v2/auth/system-requirements?locale=en'],
    ])('normalizes API bases such as %s', async (apiUrl, expected) => {
        vi.doMock('@/lib/env', () => ({ env: { apiUrl } }));
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
        vi.stubGlobal('fetch', fetchMock);
        vi.resetModules();
        const { default: DynamicAccordion } = await import('./requirement-accordion');
        const { container } = render(<DynamicAccordion locale="en" />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expected));
        await waitFor(() => expect(container).toBeEmptyDOMElement());
    });

    it('fails closed for HTTP and network errors', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
        const { container } = render(<RequirementAccordion locale="de" />);
        await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
        await waitFor(() => expect(container).toBeEmptyDOMElement());
        consoleSpy.mockRestore();
    });
});
