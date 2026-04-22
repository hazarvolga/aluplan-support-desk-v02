import { useTranslations } from 'next-intl';
import { AiIntelligenceBoard } from '@/components/admin/AiIntelligenceBoard';

export default function AiIntelligencePage() {
    const t = useTranslations('admin.ai_intelligence');

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 overflow-y-auto h-full scroll-smooth no-scrollbar">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
            </div>
            <AiIntelligenceBoard />
        </div>
    );
}
