'use client';

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { api } from '@/lib/api';
import {
    Bot,
    Send,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    AlertCircle,
    Loader2,
    Sparkles,
    Zap,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface QueryResult {
    query: string;
    answer: string | null;
    confidence: string;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    interactionId: string;
    suggestTicket: boolean;
}

const CONFIDENCE_COLORS: Record<string, string> = {
    HIGH: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    NO_MATCH: 'bg-slate-500/10 text-slate-400 border-white/5',
};

export default function AiPage() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<QueryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setResult(null);
        setFeedback(null);
        try {
            const res = await api.ai.query(query);
            setResult(res);
        } catch { /* handled */ }
        setLoading(false);
    };

    const handleFeedback = async (positive: boolean) => {
        if (!result || feedback) return;
        await api.ai.feedback(result.interactionId, positive ? 5 : 1);
        setFeedback(positive ? 'positive' : 'negative');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl mx-auto pb-24"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                            <Bot className="h-6 w-6 text-orange-500" />
                        </div>
                        AI Destek Navigatörü
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        Birleşik bilgi havuzunda anlamsal zeka sorguları
                    </p>
                </div>

                <Badge variant="outline" className="h-7 border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold tracking-widest px-3">
                    BETA PROTOKOLÜ
                </Badge>
            </div>

            {/* Query input card */}
            <Card className="glass-card p-2 border-white/10 group focus-within:border-orange-500/30 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500/40 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Zeka havuzuna bir soru yöneltin..."
                            className="w-full pl-12 pr-4 h-14 bg-transparent text-white font-bold text-[14px] tracking-tight focus:outline-none placeholder:text-muted-foreground/30"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="h-14 px-8 bg-orange-500 text-white font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-orange-500/10 transition-all rounded-xl"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Zap className="h-4 w-4 mr-2" />
                                SORGULA
                            </>
                        )}
                    </Button>
                </form>
            </Card>

            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <Card className="glass-card p-8 border-orange-500/10 relative overflow-hidden">
                            {/* Answer Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Yapay Zeka Yanıtı</span>
                                </div>
                                <Badge className={`px-2 py-0.5 font-bold text-[9px] tracking-widest ${CONFIDENCE_COLORS[result.confidence] ?? ''}`}>
                                    GÜVEN SKORU: {result.confidence}
                                </Badge>
                            </div>

                            {/* Answer Content */}
                            <div className="relative z-10">
                                {result.answer ? (
                                    <div className="text-white/90 leading-relaxed text-lg font-medium italic border-l-2 border-orange-500/30 pl-6 py-2 bg-orange-500/[0.02]">
                                        "{result.answer}"
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                                        <AlertCircle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-rose-500 font-bold uppercase text-[11px] tracking-widest mb-1">VERİ KESİNTİSİ</p>
                                            <p className="text-muted-foreground text-sm">Mevcut bilgi havuzunda bu sorguyla eşleşen bir veri seti bulunamadı.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Suggest ticket */}
                            {result.suggestTicket && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-[11px] font-bold text-white uppercase tracking-tight">
                                            Bu yanıt yeterli değil mi? Bir uzmanla iletişime geçin.
                                        </p>
                                    </div>
                                    <Button asChild size="sm" className="bg-primary text-primary-foreground text-[10px] font-bold">
                                        <Link href="/tickets/new">DESTEK TALEBİ OLUŞTUR</Link>
                                    </Button>
                                </motion.div>
                            )}

                            {/* Sources */}
                            {result.sources.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 opacity-50">REFERANS KAYNAKLARI</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {result.sources.map((s) => (
                                            <div key={s.articleId} className="group/item flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-orange-500/20 transition-all cursor-pointer">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:border-orange-500/30 transition-all border border-transparent">
                                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover/item:text-orange-500" />
                                                    </div>
                                                    <span className="text-[12px] font-bold text-white/70 group-hover/item:text-white transition-colors truncate">
                                                        {s.title}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-orange-500/60 font-bold ml-2 shrink-0">
                                                    %{Math.round(s.similarity * 100)} MATCH
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {result.answer && (
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">DOĞRULUK ANALİZİ</span>
                                    <div className="flex items-center gap-2">
                                        {feedback ? (
                                            <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-tighter">PROTOKOL KAYDEDİLDİ. TEŞEKKÜRLER.</span>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFeedback(true)}
                                                    className="h-8 w-8 p-0 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500"
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFeedback(false)}
                                                    className="h-8 w-8 p-0 border-white/10 hover:bg-rose-500/10 hover:text-rose-500"
                                                >
                                                    <ThumbsDown className="h-3.5 w-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Decorative background glow */}
                            <div className="absolute top--20 right--20 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none" />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* System Info */}
            {!result && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">INFRASTRUCTURE</p>
                        <p className="text-xs font-bold text-white tracking-widest">Ollama-VEC Compute Node</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">LATENCY</p>
                        <p className="text-xs font-bold text-white tracking-widest"><span className="text-emerald-500 mr-2">●</span>24ms Semantic Lookup</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
