'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { ProactiveChatWindow } from './ProactiveChatWindow';

interface Session {
    id: string;
    status: string;
    createdAt: string;
    customer?: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
}

interface ActiveSessionsPanelProps {
    currentUserId: string;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    ENDED: 'bg-white/10 text-muted-foreground border-white/10',
    DECLINED: 'bg-red-500/20 text-red-400 border-red-500/30',
    MISSED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Bekliyor',
    ACTIVE: 'Aktif',
    ENDED: 'Sona Erdi',
    DECLINED: 'Reddedildi',
    MISSED: 'Yanıtsız',
};

export function ActiveSessionsPanel({ currentUserId }: ActiveSessionsPanelProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [openSessionId, setOpenSessionId] = useState<string | null>(null);

    useEffect(() => {
        api.proactiveChat.listSessions()
            .then((data) => setSessions(data))
            .catch((err: any) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error('[ActiveSessionsPanel] Failed to load sessions:', err);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const openSession = sessions.find((s) => s.id === openSessionId);

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">Henüz proaktif chat oturumu yok</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {sessions.map((session) => (
                    <button
                        key={session.id}
                        onClick={() => setOpenSessionId(session.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {session.customer?.fullName || 'Müşteri'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleString('tr-TR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[session.status] || 'bg-white/10 text-muted-foreground'}`}
                        >
                            {STATUS_LABELS[session.status] || session.status}
                        </Badge>
                    </button>
                ))}
            </div>

            {openSession && (
                <ProactiveChatWindow
                    sessionId={openSession.id}
                    currentUserId={currentUserId}
                    isAgent={true}
                    otherPartyName={openSession.customer?.fullName || 'Müşteri'}
                    otherPartyAvatar={openSession.customer?.avatarUrl}
                    onClose={() => setOpenSessionId(null)}
                />
            )}
        </>
    );
}
