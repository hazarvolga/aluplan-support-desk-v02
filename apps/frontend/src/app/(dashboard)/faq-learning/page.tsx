'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Brain,
    Ticket as TicketIcon,
    Zap,
    CheckCircle2,
    FileText,
    ArrowRight,
    ChevronRight,
    RefreshCw,
    Database,
    LineChart,
    Layers,
    Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

import { SourceArchitectureView } from '@/components/dashboard/source-architecture-view';

export default function FaqLearningPage() {
    const [stats, setStats] = useState({
        totalInteractions: 0,
        deflectionRate: 0,
        aiAccuracy: 0,
        confidenceDistribution: [] as any[]
    });
    const [sourceStats, setSourceStats] = useState({
        pillars: {
            DOCUMENTS: 0,
            ARTICLES: 0,
            URLS: 0,
            TICKETS: 0
        },
        totalSources: 0
    });
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pipelineInFlight, setPipelineInFlight] = useState(false);
    const { toast } = useToast();

    const load = async () => {
        setLoading(true);
        try {
            const [faqRes, healthRes, sourceRes] = await Promise.all([
                api.faq.list('PENDING_REVIEW'),
                api.ai.getHealthMetrics(),
                api.ai.getSourcesStats()
            ]);

            setCandidates(Array.isArray(faqRes) ? faqRes : faqRes.data || []);
            setStats(healthRes);
            setSourceStats(sourceRes);

        } catch (error) {
            toast({ title: 'Data sync error', description: String(error), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const runPipeline = async () => {
        setPipelineInFlight(true);
        try {
            toast({ title: 'AI_PIPELINE_INITIATED', description: 'Deep analysis of resolved tickets in progress.' });
            await api.faq.runPipeline();
            // In a real scenario, this might take a while, but for now we refetch.
            setTimeout(load, 3000);
        } catch (error) {
            toast({ title: 'Pipeline Exception', description: String(error), variant: 'destructive' });
        } finally {
            setPipelineInFlight(false);
        }
    };

    const handleCommit = async (id: string) => {
        try {
            await api.faq.approve(id);
            toast({ title: 'Knowledge Committed', description: 'Pattern successfully integrated into public KB.' });
            load();
        } catch (error) {
            toast({ title: 'Commit Error', description: String(error), variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight uppercase flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        SSS Otomatik Öğrenme Havuzu
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">
                        NÖRAL SENKRONİZASYON: OPERASYONEL VERİYİ YAPILANDIRILMIŞ BİLGİYE DÖNÜŞTÜRME
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={load}
                        className="h-8 text-[10px] uppercase font-bold tracking-widest border-border/40 rounded-none"
                    >
                        <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        YENİLE
                    </Button>
                    <Button
                        onClick={runPipeline}
                        disabled={pipelineInFlight || loading}
                        className="h-8 text-[10px] uppercase font-bold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                    >
                        {pipelineInFlight ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                        ÖĞRENME_DÖNGÜSÜNÜ_TETİKLE
                    </Button>
                </div>
            </div>

            {/* Health Dashboard & Pipeline Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <SourceArchitectureView stats={sourceStats} />
                </div>
                <Card className="lg:col-span-2 border-border/60 bg-muted/5">
                    <CardHeader className="py-3 px-4 border-b border-border/20 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <LineChart className="h-3.5 w-3.5" /> BİLGİ_BANKASI_SAĞLIK_ANALİZİ
                            </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono border-primary/20 text-primary">
                            GERÇEK_ZAMANLI_TELEMETRİ
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ÇÖZÜM_ORANI</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-mono font-bold text-emerald-400">%{stats.deflectionRate || 0}</span>
                                    <span className="text-[10px] text-muted-foreground/60">ÖNLENEN_BİLETLER</span>
                                </div>
                                <Progress value={stats.deflectionRate || 0} className="h-1 rounded-none bg-muted" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">YAZ_DOĞRULUĞU</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-mono font-bold text-primary">%{stats.aiAccuracy || 0}</span>
                                    <span className="text-[10px] text-muted-foreground/60">EN_YÜKSEK_GÜVEN</span>
                                </div>
                                <Progress value={stats.aiAccuracy || 0} className="h-1 rounded-none bg-muted accent-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TOPLAM_ETKİLEŞİM</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-mono font-bold text-foreground">{stats.totalInteractions || 0}</span>
                                    <span className="text-[10px] text-muted-foreground/60">SON_30_GÜN_SORGU</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/20">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">GÜVEN_DAĞILIMI</h4>
                            <div className="space-y-3">
                                {['YÜKSEK', 'ORTA', 'DÜŞÜK', 'EŞLEŞME_YOK'].map(band => {
                                    const bandData = stats.confidenceDistribution?.find(d => d.band === (band === 'YÜKSEK' ? 'HIGH' : band === 'ORTA' ? 'MEDIUM' : band === 'DÜŞÜK' ? 'LOW' : 'NO_MATCH')) || { count: 0 };
                                    const percentage = stats.totalInteractions > 0 ? (bandData.count / stats.totalInteractions) * 100 : 0;
                                    return (
                                        <div key={band} className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-mono text-muted-foreground uppercase">
                                                <span>{band}</span>
                                                <span>{bandData.count} ({Math.round(percentage)}%)</span>
                                            </div>
                                            <Progress value={percentage} className={`h-1 rounded-none bg-muted ${band === 'HIGH' ? 'bg-emerald-500/20' : band === 'LOW' ? 'bg-orange-500/20' : ''}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 bg-muted/5 flex flex-col">
                    <CardHeader className="py-3 px-4 border-b border-border/20">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5" /> AKIŞ_DURUMU
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">VERİ_ALIM_MOTORU</p>
                                    <p className="text-[9px] text-muted-foreground font-mono">Durum: AKTİF | Kapatılan Bilet Olayları İzleniyor</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ${pipelineInFlight ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-muted-foreground/40'}`} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">SOYUTLAMA_KATMANI</p>
                                    <p className="text-[9px] text-muted-foreground font-mono">Mevcut: BOŞTA | Nomic-Embed Stratejisi</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ${candidates.length > 0 ? 'bg-orange-400' : 'bg-muted-foreground/40'}`} />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest">DOĞRULAMA_KUYRUĞU</p>
                                    <p className="text-[9px] text-muted-foreground font-mono">{candidates.length} ADAY_DOĞRULAMA_BEKLİYOR</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border/20 pt-4 text-[9px] font-mono text-muted-foreground/60 uppercase text-center">
                            SON_SENKRONİZASYON: {new Date().toLocaleTimeString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                    <h2 className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-400" />
                        ÖĞRENME_ADAYLARI
                    </h2>
                    <Badge variant="outline" className="text-[9px] font-mono border-orange-500/20 text-orange-400">
                        DOĞRULAMA_BEKLEYEN: {candidates.length}
                    </Badge>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="border border-dashed border-border/40 p-12 text-center bg-muted/5 opacity-50">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">TÜM_PATERNLER_EŞİTLENDİ</p>
                        <p className="text-[9px] font-mono mt-1 opacity-60">Yeni bilgi örnekleri bulmak için çıkarma döngüsünü manuel olarak çalıştırın.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {candidates.map((c) => (
                            <Card key={c.id} className="border-border/60 group hover:border-primary/40 transition-all bg-black/20">
                                <CardContent className="p-4">
                                    <div className="flex justify-between gap-6">
                                        <div className="flex-1 space-y-3 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <Badge className="text-[9px] h-4 bg-orange-500/10 text-orange-400 border-orange-400/20 uppercase tracking-tighter">
                                                    ONAY_BEKLEYEN
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase">
                                                    <Zap className="h-2.5 w-2.5 text-primary" />
                                                    GÜVEN: %{Math.round(c.confidenceScore * 100)}
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase opacity-40">
                                                    | SIKLIK: {c.frequency}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[14px] font-bold text-foreground mb-1">
                                                    Q: {c.question}
                                                </h3>
                                                <div className="p-3 bg-muted/10 border-l-2 border-primary/30 prose prose-xs dark:prose-invert max-w-none text-foreground/70 italic line-clamp-3">
                                                    "{c.answer}"
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {c.tags?.map((t: string) => (
                                                    <span key={t} className="text-[9px] font-mono text-primary/40">#{t.toUpperCase()}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0">
                                            <Button
                                                onClick={() => handleCommit(c.id)}
                                                className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-none"
                                            >
                                                BİLGİ_BANKASINA_EKLE
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-red-500 rounded-none"
                                            >
                                                YOK_SAY
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
