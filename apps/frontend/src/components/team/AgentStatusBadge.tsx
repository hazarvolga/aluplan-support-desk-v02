import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type AgentStatus = 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';

interface AgentStatusBadgeProps {
    status: AgentStatus | string;
    className?: string;
    showIcon?: boolean;
}

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ status, className, showIcon = true }) => {
    const t = useTranslations('teams');
    const s = status?.toUpperCase() || 'OFFLINE';

    const config: Record<string, { label: string; color: string; dot: string }> = {
        ONLINE: { label: t('statuses.online'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
        AWAY: { label: t('statuses.away'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' },
        DND: { label: t('statuses.dnd'), color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', dot: 'bg-rose-500' },
        OFFLINE: { label: t('statuses.offline'), color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500' },
    };

    const { label, color, dot } = config[s] || config.OFFLINE;

    return (
        <Badge variant="outline" className={cn("gap-1.5 font-medium", color, className)}>
            {showIcon && (
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
            )}
            {label}
        </Badge>
    );
};
