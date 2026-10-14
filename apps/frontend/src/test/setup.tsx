import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import React from 'react';

type MockElementProps = React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode;
};

type MockLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children?: React.ReactNode;
    href: React.AnchorHTMLAttributes<HTMLAnchorElement>['href'];
};

// ── Next.js Mocks ──────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    useParams: () => ({ locale: 'tr' }),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
    notFound: vi.fn(),
}));

// ── next-intl Mocks ────────────────────────────────────────────────────
vi.mock('next-intl', () => {
    const t = (key: string) => key;
    t.has = () => true;
    t.rich = (key: string) => key;
    t.raw = (key: string) => key;
    return {
        useTranslations: () => t,
        useLocale: () => 'tr',
        useTimeZone: () => 'UTC',
        useFormatter: () => ({
            dateTime: vi.fn(d => d.toString()),
            number: vi.fn(n => n.toString()),
        }),
    };
});

// ── Framer Motion Mock ─────────────────────────────────────────────────
vi.mock('framer-motion', async (importOriginal) => {
    const actual = await importOriginal<typeof import('framer-motion')>();
    return {
        ...actual,
        AnimatePresence: ({ children }: Pick<MockElementProps, 'children'>) => children,
        motion: {
            div: ({ children, ...props }: MockElementProps) => React.createElement('div', props, children),
            span: ({ children, ...props }: MockElementProps) => React.createElement('span', props, children),
            h1: ({ children, ...props }: MockElementProps) => React.createElement('h1', props, children),
            p: ({ children, ...props }: MockElementProps) => React.createElement('p', props, children),
        }
    };
});

// ── i18n Routing Mock ──────────────────────────────────────────────────
vi.mock('@/i18n/routing', () => ({
    routing: { locales: ['tr', 'en', 'de'] },
    Link: ({ children, href, ...props }: MockLinkProps) => React.createElement('a', { href, ...props }, children),
    redirect: vi.fn(),
    usePathname: () => '/',
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
}));

// ── MSW Server Setup ──────────────────────────────────────────────────
const server = setupServer(...handlers);

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

export { server };
