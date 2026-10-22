import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', async () => {
    const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
    return actual;
});

import de from '../../../../../messages/de.json';
import en from '../../../../../messages/en.json';
import tr from '../../../../../messages/tr.json';
import { AiAssistantOverview } from './AiAssistantOverview';
import { AiAssistantTips } from './AiAssistantTips';
import { GettingStartedAnnouncements } from './GettingStartedAnnouncements';
import { GettingStartedDashboard } from './GettingStartedDashboard';
import { KnowledgeBaseOverview } from './KnowledgeBaseOverview';
import { MyTicketsAttachments } from './MyTicketsAttachments';
import { MyTicketsCreate } from './MyTicketsCreate';
import { MyTicketsTracking } from './MyTicketsTracking';
import { ProfileSettings } from './ProfileSettings';

const COMPONENTS = [
    ['GettingStartedDashboard', GettingStartedDashboard],
    ['GettingStartedAnnouncements', GettingStartedAnnouncements],
    ['AiAssistantOverview', AiAssistantOverview],
    ['AiAssistantTips', AiAssistantTips],
    ['MyTicketsCreate', MyTicketsCreate],
    ['MyTicketsAttachments', MyTicketsAttachments],
    ['MyTicketsTracking', MyTicketsTracking],
    ['KnowledgeBaseOverview', KnowledgeBaseOverview],
    ['ProfileSettings', ProfileSettings],
] as const;

const LOCALES = [
    ['tr', tr],
    ['en', en],
    ['de', de],
] as const;

describe('Customer help doc components', () => {
    for (const [componentName, Component] of COMPONENTS) {
        for (const [locale, messages] of LOCALES) {
            it(`${componentName} resolves every translation key for locale "${locale}"`, () => {
                const { container } = render(
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Component />
                    </NextIntlClientProvider>,
                );

                const text = container.textContent ?? '';
                expect(text).not.toContain('help.docs.customer');
                expect(text.trim().length).toBeGreaterThan(0);
            });
        }
    }
});
