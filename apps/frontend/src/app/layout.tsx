import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: { default: 'Aluplan Destek', template: '%s · Aluplan' },
    description: 'Aluplan müşteri destek yönetim platformu',
};

export const viewport: Viewport = {
    themeColor: '#0ea5e9',
};

import { AuthProvider } from '@/components/auth/role-guard';
import { CommandMenu } from '@/components/command-menu';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider>
                    {children}
                    <CommandMenu />
                </AuthProvider>
            </body>
        </html>
    );
}
