'use client';

import { AiTelemetryDashboard } from '@/components/admin/AiTelemetryDashboard';
import { useTranslations } from 'next-intl';
import { Bot, Activity } from 'lucide-react';

export default function AiHealthPage() {
    const t = useTranslations('admin.ai_health');

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[18px] font-bold tracking-tight uppercase flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI HEALTH & TELEMETRY
                    </h1>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest leading-tight">
                        Real-time monitoring of AI models, token usage, and RAG performance.
                    </p>
                </div>
            </div>

            <AiTelemetryDashboard />
        </div>
    );
}
