import type { Metadata, Viewport } from 'next';
import { DM_Sans, IBM_Plex_Mono, Barlow_Condensed } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    display: 'swap',
});

const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-ibm-plex-mono',
    display: 'swap',
});

const condensed = Barlow_Condensed({
    subsets: ['latin'],
    weight: ['700', '800'],
    variable: '--font-barlow-condensed',
    display: 'swap',
});

export const metadata: Metadata = {
    title: { default: 'Aluplan Support Desk — Allplan Technical Hub', template: '%s · Aluplan' },
    description: 'Advanced technical support and resource management platform for Allplan engineering and BIM solutions in Turkey and beyond.',
    openGraph: {
        title: 'Aluplan Support Desk — Professional Allplan Solutions',
        description: 'BIM, Engineering, and Technical Support Hub for Allplan users. Turkey authorized dealer resources.',
        url: 'https://destek.aluplan.com.tr',
        siteName: 'Aluplan Support',
        locale: 'tr_TR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Aluplan Support Desk',
        description: 'Advanced technical support for Allplan engineering solutions.',
    },
};

export const viewport: Viewport = {
    themeColor: '#00FFD1', // Cyan Active
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { AuthProvider } from '@/components/auth/role-guard';
import { CommandMenu } from '@/components/command-menu';
import { Toaster } from '@/components/ui/toaster';

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning className={`${dmSans.variable} ${mono.variable} ${condensed.variable}`}>
            <body suppressHydrationWarning className="antialiased min-h-screen">
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        {children}
                        <CommandMenu />
                        <Toaster />
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

