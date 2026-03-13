import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sistem Ayarları — Aluplan Control Panel',
    description: 'Platform genelindeki teknik yapılandırmalar, e-posta servisleri, AI model ayarları ve güvenlik protokolleri.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-full bg-background/50">
            {children}
        </div>
    );
}
