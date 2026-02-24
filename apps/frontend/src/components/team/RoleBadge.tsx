import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SystemRole = 'ADMIN' | 'DEPARTMENT_MANAGER' | 'TEAM_LEAD' | 'SENIOR_AGENT' | 'AGENT' | 'VIEWER';

interface RoleBadgeProps {
    role: SystemRole | string;
    className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
    const r = role?.toUpperCase() || 'AGENT';

    const config: Record<string, { label: string; color: string }> = {
        ADMIN: { label: 'Admin', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        DEPARTMENT_MANAGER: { label: 'Dep. Müdürü', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        TEAM_LEAD: { label: 'Takım Lideri', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        SENIOR_AGENT: { label: 'Kıdemli Temsilci', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
        AGENT: { label: 'Temsilci', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
        VIEWER: { label: 'Gözlemci', color: 'bg-stone-500/10 text-stone-500 border-stone-500/20' },
    };

    const { label, color } = config[r] || config.AGENT;

    return (
        <Badge variant="outline" className={cn("font-medium", color, className)}>
            {label}
        </Badge>
    );
};
