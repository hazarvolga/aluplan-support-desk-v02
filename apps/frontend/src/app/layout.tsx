import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: { default: 'Aluplan Destek', template: '%s · Aluplan' },
    description: 'Aluplan müşteri destek yönetim platformu',
};

export const viewport: Viewport = {
    themeColor: '#0ea5e9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
