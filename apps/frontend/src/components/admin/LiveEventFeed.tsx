import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiHealthEvent } from '@/hooks/useAiHealthSocket';
import { AlertTriangle, AlertCircle, Info, Zap, Wifi, WifiOff } from 'lucide-react';

type LiveEventFeedProps = {
    events: AiHealthEvent[];
    connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
    stats: { total: number; fallbackCount: number; errorCount: number; lastEventAt: Date | null };
    maxVisible?: number;
};

const EVENT_COLORS: Record<string, { bg: string; border: string; icon: string; label: string }> = {
    FALLBACK: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', label: 'bg-red-500' },
    TIMEOUT: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-400', label: 'bg-orange-500' },
    ERROR: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', label: 'bg-red-500' },
    INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', label: 'bg-blue-500' },
};

export function LiveEventFeed({ events, connectionState, stats, maxVisible = 50 }: LiveEventFeedProps) {
    const t = useTranslations('admin.ai_health');
    const feedRef = useRef<HTMLDivElement>(null);
    const prevEventsLengthRef = useRef(0);

    useEffect(() => {
        if (events.length > prevEventsLengthRef.current && feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
        prevEventsLengthRef.current = events.length;
    }, [events.length]);

    const visibleEvents = events.slice(0, maxVisible);

    const statusIcon = connectionState === 'connected'
        ? <Wifi className="h-3 w-3 text-emerald-400" />
        : connectionState === 'connecting'
            ? <Wifi className="h-3 w-3 text-yellow-400 animate-pulse" />
            : <WifiOff className="h-3 w-3 text-muted-foreground" />;

    const statusText = connectionState === 'connected'
        ? t('live_feed.connected', { count: stats.total })
        : connectionState === 'connecting'
            ? t('live_feed.connecting')
            : connectionState === 'error'
                ? t('live_feed.error')
                : t('live_feed.disconnected');

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'FALLBACK': return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
            case 'TIMEOUT': return <Zap className="h-3.5 w-3.5 text-orange-400" />;
            case 'ERROR': return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
            default: return <Info className="h-3.5 w-3.5 text-blue-400" />;
        }
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <Card className="bg-card border-border/60">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            {connectionState === 'connected' && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionState === 'connected' ? 'bg-emerald-500' : connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-muted'}`}></span>
                        </span>
                        {t('live_feed.title')}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            {statusIcon}
                            {statusText}
                        </span>
                        {stats.fallbackCount > 0 && (
                            <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-400" />
                                {stats.fallbackCount} {t('live_feed.fallbacks')}
                            </span>
                        )}
                        {stats.errorCount > 0 && (
                            <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-red-400" />
                                {stats.errorCount} {t('live_feed.errors')}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div
                    ref={feedRef}
                    className="max-h-64 overflow-y-auto"
                >
                    {visibleEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-xs">
                            <Wifi className="h-6 w-6 mb-2 opacity-30" />
                            <p className="italic">{t('live_feed.no_events')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {visibleEvents.map((event, idx) => {
                                const colors = EVENT_COLORS[event.eventType] || EVENT_COLORS.INFO;
                                return (
                                    <div
                                        key={event.id || `event-${idx}-${event.timestamp}`}
                                        className={`flex items-start gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors ${colors.bg}`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getEventIcon(event.eventType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className={`font-semibold uppercase tracking-wide ${colors.icon}`}>
                                                    {event.eventType}
                                                </span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="font-mono text-muted-foreground">{event.provider}</span>
                                                {event.task && (
                                                    <>
                                                        <span className="text-muted-foreground">•</span>
                                                        <span className="truncate text-muted-foreground max-w-[120px]">{event.task}</span>
                                                    </>
                                                )}
                                            </div>
                                            {event.errorMessage && (
                                                <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">
                                                    {event.errorMessage}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 text-[9px] font-mono text-muted-foreground/60">
                                            {formatTime(event.timestamp)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}