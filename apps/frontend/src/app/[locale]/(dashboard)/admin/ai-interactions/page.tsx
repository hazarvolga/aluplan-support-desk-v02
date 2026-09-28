'use client';

import { Brain } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { AiInteractionHistory } from '@/components/admin/ai-interaction-history';
import { RoleGuard } from '@/components/auth/role-guard';

export default function AiInteractionsPage() {
    const t = useTranslations('admin.ai_interactions');

    return (
        <RoleGuard allowedRoles={['ADMIN', 'SUPERUSER', 'SUPER_ADMIN']}>
            <div className="mx-auto max-w-7xl space-y-5">
                <div className="border-b border-border/40 pb-4">
                    <h1 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight">
                        <Brain className="h-5 w-5 text-primary" />
                        {t('title')}
                    </h1>
                    <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Suspense fallback={<div className="h-32 animate-pulse rounded-lg border border-border/50 bg-muted/20" />}>
                    <AiInteractionHistory />
                </Suspense>
            </div>
        </RoleGuard>
    );
}
