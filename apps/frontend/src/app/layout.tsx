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
    title: { default: 'Aluplan Destek', template: '%s · Aluplan' },
    description: 'Aluplan müşteri destek yönetim platformu',
};

export const viewport: Viewport = {
    themeColor: '#00FFD1', // Cyan Active
};

import { AuthProvider } from '@/components/auth/role-guard';
import { CommandMenu } from '@/components/command-menu';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" suppressHydrationWarning className={`${dmSans.variable} ${mono.variable} ${condensed.variable}`}>
            <body suppressHydrationWarning className="antialiased industrial-grid min-h-screen">
                <AuthProvider>
                    {children}
                    <CommandMenu />
                </AuthProvider>
            </body>
        </html>
    );
}
