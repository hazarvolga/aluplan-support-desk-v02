import { getTranslations } from 'next-intl/server';
import DashboardClient from './DashboardClient';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'dashboard' });

    return {
        title: t('title'),
        description: t('telemetry_version'),
    };
}

export default function DashboardPage() {
    return <DashboardClient />;
}


