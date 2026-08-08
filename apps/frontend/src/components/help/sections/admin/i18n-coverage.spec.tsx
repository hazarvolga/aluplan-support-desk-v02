import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import tr from '../../../../../messages/tr.json';

// The global test setup (src/test/setup.tsx) mocks next-intl's useTranslations
// to always echo back the key it was given, which is exactly why the missing-key
// bug this spec guards against was never caught by the existing suite. Restore
// the real implementation here so translations actually resolve against the
// message catalogs below.
vi.mock('next-intl', async () => {
    const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
    return actual;
});
import en from '../../../../../messages/en.json';
import de from '../../../../../messages/de.json';
import { CrmProducts } from './CrmProducts';
import { CrmTaxonomy } from './CrmTaxonomy';
import { TeamCustomers } from './TeamCustomers';
import { TeamTeams } from './TeamTeams';
import { TeamSla } from './TeamSla';
import { AiKnowledgePool } from './AiKnowledgePool';
import { AnnouncementsOverview } from './AnnouncementsOverview';
import { AnnouncementsTemplates } from './AnnouncementsTemplates';
import { TicketsOverview } from './TicketsOverview';
import { TicketsAiCopilot } from './TicketsAiCopilot';
import { TicketsInternalNotes } from './TicketsInternalNotes';

// These 11 components were refactored from hardcoded Turkish text to
// useTranslations() calls (commit a587ea89) without the matching keys ever
// being added to the message catalogs, so next-intl fell back to rendering
// the raw dotted key path (e.g. "help.docs.admin.crm_products.add_title")
// as visible text. This spec renders each component against the real
// message catalogs for all three locales and fails if any raw key leaks
// into the DOM, which is the only reliable way to prove the catalogs are
// actually complete for what the components call (pnpm i18n:check only
// proves tr/en/de have identical key sets relative to each other).
const COMPONENTS = [
    ['CrmProducts', CrmProducts],
    ['CrmTaxonomy', CrmTaxonomy],
    ['TeamCustomers', TeamCustomers],
    ['TeamTeams', TeamTeams],
    ['TeamSla', TeamSla],
    ['AiKnowledgePool', AiKnowledgePool],
    ['AnnouncementsOverview', AnnouncementsOverview],
    ['AnnouncementsTemplates', AnnouncementsTemplates],
    ['TicketsOverview', TicketsOverview],
    ['TicketsAiCopilot', TicketsAiCopilot],
    ['TicketsInternalNotes', TicketsInternalNotes],
] as const;

const LOCALES = [
    ['tr', tr],
    ['en', en],
    ['de', de],
] as const;

describe('Admin help doc components render without leaking raw i18n keys', () => {
    for (const [componentName, Component] of COMPONENTS) {
        for (const [locale, messages] of LOCALES) {
            it(`${componentName} resolves every translation key for locale "${locale}"`, () => {
                const { container } = render(
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Component />
                    </NextIntlClientProvider>,
                );

                const text = container.textContent ?? '';
                expect(text).not.toContain('help.docs.admin');
                expect(text.trim().length).toBeGreaterThan(0);
            });
        }
    }
});
