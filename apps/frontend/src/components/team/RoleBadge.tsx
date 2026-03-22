import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type SystemRole = 'ADMIN' | 'DEPARTMENT_MANAGER' | 'TEAM_LEAD' | 'SENIOR_AGENT' | 'AGENT' | 'VIEWER';

interface RoleBadgeProps {
    role: SystemRole | string;
    className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
    const t = useTranslations('teams');
    const r = role?.toUpperCase() || 'AGENT';

    const config: Record<string, { label: string; color: string }> = {
        ADMIN: { label: t('roles.admin'), color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        DEPARTMENT_MANAGER: { label: t('roles.department_manager'), color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        TEAM_LEAD: { label: t('roles.team_lead'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        SENIOR_AGENT: { label: t('roles.senior_agent'), color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
        AGENT: { label: t('roles.agent'), color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
        VIEWER: { label: t('roles.viewer'), color: 'bg-stone-500/10 text-stone-500 border-stone-500/20' },
    };

    const { label, color } = config[r] || config.AGENT;

    return (
        <Badge variant="outline" className={cn("font-medium", color, className)}>
            {label}
        </Badge>
    );
};
