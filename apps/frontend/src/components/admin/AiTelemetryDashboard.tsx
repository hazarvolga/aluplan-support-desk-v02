'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Coins, Server, Zap, LineChart, MessageCircle, Globe, Mail, AlertTriangle, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { HealthTrendChart } from './HealthTrendChart';
import { toast } from 'sonner';

export function AiTelemetryDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [gaps, setGaps] = useState<any[]>([]);
    const [sendingReport, setSendingReport] = useState(false);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const [data, health, trendData, gapData] = await Promise.allSettled([
                api.ai.getMetrics(),
                api.ai.getHealthMetrics(),
                api.ai.getHealthTrends(7),
                api.ai.getKnowledgeGaps(5)
            ]);

            const metricsData = data.status === 'fulfilled' ? data.value : null;
            const healthData = health.status === 'fulfilled' ? health.value : null;

            setMetrics({
                ...metricsData,
                deflectionRate: healthData?.deflectionRate ?? 0,
                globalAccuracy: healthData?.aiAccuracy ?? 0,
            });

            if (trendData.status === 'fulfilled') setTrends(trendData.value);
            if (gapData.status === 'fulfilled') setGaps(gapData.value);

        } catch (error) {
            console.error('Failed to load AI telemetry metrics', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerWeeklyReport = async () => {
        try {
            setSendingReport(true);
            // We use the generic post if we don't have a specific api method yet, 
            // but I should add it to api.ts or just use this:
            await api.post('/ai/trigger-report', {});
            toast.success('Haftalık rapor sıraya alındı ve yetkililere gönderiliyor.');
        } catch (error: any) {
            toast.error('Rapor gönderimi başarısız: ' + error.message);
        } finally {
            setSendingReport(false);
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

    const sortedProviders = [...(providers || [])].sort((a, b) =>
        (b.metrics?.totalTokens || 0) - (a.metrics?.totalTokens || 0)
    );

    return (
        <div className="space-y-6 mb-8 mt-2">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" /> AI Sağlık & Performans Paneli
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={triggerWeeklyReport}
                    disabled={sendingReport}
                >
                    {sendingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Haftalık Raporu Şimdi Gönder
                </Button>
            </div>

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
                            {sortedProviders.length > 0 ? sortedProviders.map((p: any) => p.model).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i).join(', ') : 'Bilinmiyor'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-primary" /> Performans Trendleri (Son 7 Gün)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            AI doğruluğu ve savuşturma oranlarının zaman içindeki değişimi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <HealthTrendChart data={trends} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" /> Bilgi Havuzu Boşlukları
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Cevaplanamayan en popüler kullanıcı soruları.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {gaps.length > 0 ? (
                            <div className="divide-y text-sm">
                                {gaps.map((gap, idx) => (
                                    <div key={idx} className="p-3 hover:bg-muted/30 transition-colors">
                                        <div className="font-medium line-clamp-2">"{gap.query}"</div>
                                        <div className="text-[10px] text-muted-foreground mt-1 font-bold">
                                            {gap.frequency} kez cevapsız kaldı
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground text-xs italic">
                                Belirgin bir bilgi boşluğu tespit edilmedi. ✨
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {metrics.channels && metrics.channels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm">Kanal Dağılımı</CardTitle>
                            <CardDescription className="text-xs">
                                İsteklerin hangi kanallardan geldiğini görün.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {metrics.channels.map((c: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${c.channel === 'WHATSAPP' ? 'bg-emerald-500/10 text-emerald-600' :
                                                c.channel === 'EMAIL' ? 'bg-blue-500/10 text-blue-600' :
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                {c.channel === 'WHATSAPP' ? <MessageCircle className="h-4 w-4" /> :
                                                    c.channel === 'EMAIL' ? <Mail className="h-4 w-4" /> :
                                                        <Globe className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">{c.channel}</div>
                                                <div className="text-[10px] text-muted-foreground">{c.requests} İstek</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono">${Number(c.cost || 0).toFixed(4)}</div>
                                            <div className="text-[10px] text-muted-foreground">{Number(c.tokens || 0).toLocaleString('tr-TR')} Token</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm">Verimlilik Özeti (30 Günlük)</CardTitle>
                            <CardDescription className="text-xs">
                                AI yanıt kalitesi ve sistem sağlığı.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>RAG Doğruluğu (Yüksek Güven)</span>
                                    <span>{metrics.globalAccuracy || 0}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${metrics.globalAccuracy || 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Talep Savuşturma (Deflection)</span>
                                    <span>{metrics.deflectionRate || 0}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${metrics.deflectionRate || 0}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

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
