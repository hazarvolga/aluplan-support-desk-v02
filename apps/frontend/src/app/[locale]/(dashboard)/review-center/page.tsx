import { getTranslations } from 'next-intl/server';
import ReviewCenterClient from './ReviewCenterClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'review_center' });
    return { title: t('title'), description: t('description') };
}

export default function ReviewCenterPage() {
    return <ReviewCenterClient />;
}
