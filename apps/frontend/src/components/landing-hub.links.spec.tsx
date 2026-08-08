import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import tr from '../../messages/tr.json';
import en from '../../messages/en.json';
import de from '../../messages/de.json';
import LandingHub from './landing-hub';

vi.mock('next-intl', async () => {
    const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
    return actual;
});

const LOCALES = [
    ['tr', tr],
    ['en', en],
    ['de', de],
] as const;

describe('LandingHub integration links', () => {
    for (const [locale, messages] of LOCALES) {
        it(`defines the canonical integration URLs for ${locale}`, () => {
            expect(messages.home.integrations.oska_link).toBe(
                'https://aluplan.com.tr/solutions/bimx5',
            );
            expect(messages.home.integrations.imar_link).toBe(
                'https://aluplan.com.tr/solutions/imar-yonetmeligi-bim-eklentisi',
            );
            expect(messages.home.integrations.bimflex_link).toBe(
                'https://aluplan.com.tr/solutions/bimflex',
            );
            expect(messages.home.integrations.bimflex_title).toBeTruthy();
            expect(messages.home.integrations.bimflex_desc).toBeTruthy();
        });
    }
});

describe('LandingHub retired sections', () => {
    it('does not render the popular solutions, platform stats, or social proof sections', () => {
        const { container } = render(
            <NextIntlClientProvider locale="tr" messages={tr}>
                <LandingHub />
            </NextIntlClientProvider>,
        );

        expect(container.querySelector('#faq-section')).not.toBeInTheDocument();
        expect(container.querySelector('#stats-section')).not.toBeInTheDocument();
        expect(container.querySelector('#social-proof-section')).not.toBeInTheDocument();
    });
});

describe('LandingHub integration cards', () => {
    it('renders a centered heading above three safe external links', () => {
        const { container } = render(
            <NextIntlClientProvider locale="tr" messages={tr}>
                <LandingHub />
            </NextIntlClientProvider>,
        );

        const heading = container.querySelector('#integrations-heading');
        expect(heading).toHaveClass('text-center');
        expect(heading?.querySelector('h2')).toHaveClass('text-sm', 'md:text-base');
        expect(heading?.querySelector('p')).toHaveClass('text-base');
        expect(container.querySelector('#integrations-grid')).toHaveClass('md:grid-cols-3');

        const links = [
            ['#integration-oska', 'https://aluplan.com.tr/solutions/bimx5'],
            ['#integration-plugins', 'https://aluplan.com.tr/solutions/imar-yonetmeligi-bim-eklentisi'],
            ['#integration-bimflex', 'https://aluplan.com.tr/solutions/bimflex'],
        ] as const;

        for (const [selector, href] of links) {
            expect(container.querySelector(selector)).toHaveAttribute('href', href);
            expect(container.querySelector(selector)).toHaveAttribute('target', '_blank');
            expect(container.querySelector(selector)).toHaveAttribute('rel', 'noopener noreferrer');
        }

        for (const iconId of [
            '#integration-oska-icon',
            '#integration-plugins-icon',
            '#integration-bimflex-icon',
        ]) {
            expect(container.querySelector(iconId)?.parentElement).toHaveClass(
                'absolute',
                'top-5',
                'right-5',
            );
        }
    });
});

describe('LandingHub designer credit', () => {
    it('renders the linked designer credit in the sub-footer', () => {
        const { container } = render(
            <NextIntlClientProvider locale="tr" messages={tr}>
                <LandingHub />
            </NextIntlClientProvider>,
        );

        const credit = container.querySelector('#footer-credit-link');
        expect(credit).toHaveTextContent('Hazar Volga Ekiz');
        expect(credit).toHaveAttribute('href', 'https://hazarvolga.com.tr/');
        expect(credit).toHaveAttribute('target', '_blank');
        expect(credit).toHaveAttribute('rel', 'noopener noreferrer');
        expect(container.querySelector('#footer-subfooter')).toHaveTextContent(
            'Designed and developed by Hazar Volga Ekiz',
        );
        const creditLine = container.querySelector('#footer-subfooter p');
        expect(creditLine).toHaveAttribute('lang', 'en');
        expect(creditLine).not.toHaveClass('uppercase');
    });
});

describe('LandingHub corporate footer link', () => {
    it('identifies the support platform without narrowing the company brand', () => {
        const { container } = render(
            <NextIntlClientProvider locale="tr" messages={tr}>
                <LandingHub />
            </NextIntlClientProvider>,
        );

        const corporateLink = container.querySelector('#footer-corporate-link');
        expect(corporateLink).toHaveAttribute('href', 'https://aluplan.com.tr/');
        expect(corporateLink).toHaveAttribute('target', '_blank');
        expect(corporateLink).toHaveAttribute('rel', 'noopener noreferrer');
        expect(corporateLink).toHaveTextContent('ALUPLAN PROGRAM SİSTEMLERİ');
        expect(corporateLink).toHaveTextContent('Müşteri Destek Platformu');
        expect(corporateLink).toHaveTextContent('Kurumsal web sitesini ziyaret edin');
    });
});
