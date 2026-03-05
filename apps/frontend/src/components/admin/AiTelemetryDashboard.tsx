'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Coins, Server, Zap, LineChart } from 'lucide-react';
import { api } from '@/lib/api';

export function AiTelemetryDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const data = await api.ai.getMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load AI telemetry metrics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="border-border/60 bg-muted/10 mb-6">
                <CardContent className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!metrics || !metrics.global) {
        return null;
    }

    const { global, providers } = metrics;
    const globalSum = global._sum || {};

    // Sort providers by total tokens to establish the "top" providers
    const sortedProviders = [...(providers || [])].sort((a, b) =>
        (b.metrics?.totalTokens || 0) - (a.metrics?.totalTokens || 0)
    );

    return (
        <div className="space-y-6 mb-8 mt-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" /> AI Kullanım İstatistikleri
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Toplam İstek</p>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{global._count?.id || 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Toplam Token</p>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">
                            {(globalSum.totalTokens || 0).toLocaleString('tr-TR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Yaklaşık Maliyet</p>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-500">
                            ${Number(globalSum.estimatedCost || 0).toFixed(4)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-primary">Aktif Modeller</p>
                            <BotIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-xl font-bold text-primary truncate">
                            {sortedProviders.length > 0 ? sortedProviders.map(p => p.model).filter((v, i, a) => a.indexOf(v) === i).join(', ') : 'Bilinmiyor'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {sortedProviders.length > 0 && (
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-sm">Sağlayıcı Analizi</CardTitle>
                        <CardDescription className="text-xs">
                            Hangi AI sağlayıcısının ne kadar kaynak tükettiğini inceleyin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {sortedProviders.map((p, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col w-full sm:w-1/3 mb-2 sm:mb-0">
                                        <span className="font-semibold uppercase tracking-wider text-xs">
                                            {p.provider === 'custom' ? 'ÖZEL / GROK' : p.provider.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">{p.model}</span>
                                    </div>

                                    <div className="flex flex-1 justify-between items-center sm:pl-8 text-sm">
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground">İstekler</div>
                                            <div className="font-semibold">{p.metrics.requests}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground">Input Token</div>
                                            <div>{(p.metrics.inputTokens || 0).toLocaleString('tr-TR')}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground">Output Token</div>
                                            <div>{(p.metrics.outputTokens || 0).toLocaleString('tr-TR')}</div>
                                        </div>
                                        <div className="text-center text-emerald-500 font-bold">
                                            <div className="text-xs text-muted-foreground font-normal">Maliyet</div>
                                            ${Number(p.metrics.estimatedCost || 0).toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Simple bot icon mapping
function BotIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}
