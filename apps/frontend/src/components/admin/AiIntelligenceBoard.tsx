'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Brain, Compass, Target, Database, Activity, TrendingUp, AlertCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';

export function AiIntelligenceBoard() {
    const t = useTranslations('admin.ai_intelligence');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);
    const [knowledgeGaps, setKnowledgeGaps] = useState<any[]>([]);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const [data, gaps] = await Promise.all([
                api.ai.getIntelligence(30),
                api.ai.getKnowledgeGaps(10)
            ]);
            setMetrics(data);
            setKnowledgeGaps(gaps);
        } catch (error) {
            console.error('Failed to load AI intelligence metrics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!metrics) return null;

    const summary = metrics.summary || {};

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('cards.total_interactions')}</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_interactions || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Son 30 günlük operasyon</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('cards.problem_shifts')}</CardTitle>
                        <Compass className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.problem_shifts || 0}</div>
                        <p className="text-xs text-orange-500 font-medium mt-1">%{metrics.shiftRate?.toFixed(1) || 0} sapma oranı</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('cards.avg_confidence')}</CardTitle>
                        <Target className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">%{((summary.avg_diagnosis_score || 0) * 10).toFixed(1)}</div>
                        <p className="text-xs text-emerald-500 font-medium mt-1">Hedef: %85.0</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('cards.metadata_impact')}</CardTitle>
                        <Database className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">%{summary.total_interactions > 0 ? ((summary.metadata_informed / summary.total_interactions) * 100).toFixed(1) : 0}</div>
                        <p className="text-xs text-blue-500 font-medium mt-1">Döküman destekli teşhis</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            {t('dashboard.accuracy_funnel')}
                        </CardTitle>
                        <CardDescription>Güven seviyelerine göre yanıt dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col justify-center">
                        <div className="space-y-4">
                            {metrics.confidenceDistribution.map((item: any, idx: number) => {
                                const percentage = summary.total_interactions > 0
                                    ? (item.value / summary.total_interactions) * 100
                                    : 0;
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span>{item.label}</span>
                                            <span>{item.value} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-1000"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: item.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            {t('dashboard.drift_analysis')}
                        </CardTitle>
                        <CardDescription>Bilet seanslarındaki konu değişimleri</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6 h-64">
                        {/* Custom SVG Radar/Circle for Drift */}
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-muted/20"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="orange"
                                    strokeWidth="8"
                                    strokeDasharray={`${metrics.shiftRate * 2.51} 251`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <text
                                    x="50"
                                    y="50"
                                    transform="rotate(90 50 50)"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className="text-xl font-bold fill-foreground"
                                >
                                    %{metrics.shiftRate?.toFixed(1)}
                                </text>
                            </svg>
                            <div className="absolute -bottom-2 w-full text-center">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">DRİFT_ORANI</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                <CardContent className="p-6 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Brain className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold">Stratejik Insight</h4>
                        <p className="text-muted-foreground text-sm">
                            {metrics.shiftRate > 20
                                ? "Biletlerde yüksek oranda konu kayması tespit edildi. Müşterilerin tek bilete birden fazla soru sorma eğilimini azaltmak için 'Yeni Konu Aç' butonunu daha görünür yapabilirsiniz."
                                : metrics.summary.metadata_informed < (metrics.summary.total_interactions * 0.3)
                                    ? "Mevcut döküman bazlı (HXL) analiz oranı düşük. Daha fazla teknik manuel ve PDF dökümanı Knowledge Pool'a ekleyerek isabet oranını artırabilirsiniz."
                                    : "Yapay zeka performansı stabil. Mevcut bağlam analizi ve konu sapma dedektörü beklenen verimlilikte çalışıyor."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {knowledgeGaps.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                {t('knowledge_gaps') || 'Bilgi Boşlukları'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {knowledgeGaps.map((gap, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground truncate max-w-[70%]">{gap.query}</span>
                                    <span className="text-orange-500 font-medium">{gap.frequency}x</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
