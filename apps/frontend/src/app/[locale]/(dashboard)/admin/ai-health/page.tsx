'use client';

export const dynamic = "force-dynamic";

import { AiTelemetryDashboard } from '@/components/admin/AiTelemetryDashboard';
import { useTranslations } from 'next-intl';
import { Bot, Activity } from 'lucide-react';

export default function AiHealthPage() {
    const t = useTranslations('admin.ai_health');

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
                <div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[16px] md:text-[18px] font-bold tracking-tight text-foreground uppercase truncate">{t('title')}</h1>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{t('subtitle')}</p>
                    </div>
                </div>
            </div>

            <AiTelemetryDashboard />
        </div>
    );
}
