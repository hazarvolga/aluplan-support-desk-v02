'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Bot, Send, ThumbsUp, ThumbsDown, ExternalLink, AlertCircle } from 'lucide-react';

interface QueryResult {
    query: string;
    answer: string | null;
    confidence: string;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    interactionId: string;
    suggestTicket: boolean;
}

const CONFIDENCE_COLORS: Record<string, string> = {
    HIGH: 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5',
    MEDIUM: 'border-amber-900/50 text-amber-400 bg-amber-400/5',
    LOW: 'border-orange-900/50 text-orange-400 bg-orange-400/5',
    NO_MATCH: 'border-border text-muted-foreground bg-muted/5',
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
        <div className="space-y-4 max-w-3xl">
            <div className="border-b border-border/40 pb-4">
                <h1 className="text-[16px] md:text-[18px] font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    YA_YARDIMCI_NAVİGATÖR_BETA
                </h1>
                <p className="mt-1 text-muted-foreground text-[10px] font-mono uppercase tracking-widest leading-none">
                    Birleşik bilgi havuzunda anlamsal zeka sorguları yürütün. Donanım: Ollama_VEC_Compute.
                </p>
            </div>

            {/* Query input */}
            <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-2 bg-muted/5 border border-border/60 p-1">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SORGU_METNİ_GİRİN..."
                    className="flex-1 px-3 py-2 bg-transparent text-foreground text-[12px] uppercase font-bold tracking-tight focus:outline-none placeholder:text-muted-foreground/40 min-h-[40px]"
                />
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 transition-none flex items-center justify-center gap-2 h-10 sm:h-auto"
                >
                    <Send className="h-3 w-3" />
                    {loading ? 'YÜRÜTÜLÜYOR...' : 'SORGULA'}
                </button>
            </form>

            {/* Result */}
            {result && (
                <div className="bg-muted/5 border border-border/60 p-4 space-y-4 animate-in fade-in duration-300">
                    {/* Confidence badge */}
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 border text-[9px] font-mono uppercase font-bold tracking-widest ${CONFIDENCE_COLORS[result.confidence] ?? ''}`}>
                            GÜVEN_SKORU: {result.confidence === 'HIGH' ? 'YÜKSEK' : result.confidence === 'MEDIUM' ? 'ORTA' : result.confidence === 'LOW' ? 'DÜŞÜK' : 'EŞLEŞME_YOK'}
                        </span>
                    </div>

                    {/* Answer */}
                    {result.answer ? (
                        <p className="text-foreground/90 leading-relaxed text-[13px] italic">"{result.answer}"</p>
                    ) : (
                        <div className="flex items-start gap-3 text-muted-foreground border border-orange-900/30 bg-orange-950/10 p-3">
                            <AlertCircle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                            <p className="text-[11px] uppercase font-bold tracking-tight">BOŞ_YANIT: MEVCUT BİLGİ HAVUZUNDA İLGİLİ EŞLEŞME BULUNAMADI.</p>
                        </div>
                    )}

                    {/* Suggest ticket */}
                    {result.suggestTicket && (
                        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-3">
                            <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                            <p className="text-[10px] text-primary uppercase font-bold tracking-widest">
                                ÖNERİ: SEVİYE_1 İNSAN_OPERATÖRE AKTARIN.
                            </p>
                            <a
                                href="/tickets/new"
                                className="ml-auto inline-flex items-center gap-1.5 px-2 py-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest hover:opacity-90"
                            >
                                DESTEK_TALEBİ_AÇ
                            </a>
                        </div>
                    )}

                    {/* Sources */}
                    {result.sources.length > 0 && (
                        <div className="border-t border-border/20 pt-3">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">KAYNAK_TAKİBİ</p>
                            <div className="space-y-1">
                                {result.sources.map((s) => (
                                    <div key={s.articleId} className="flex items-center justify-between text-[11px] font-mono group p-1 hover:bg-muted/10">
                                        <span className="text-primary hover:underline cursor-pointer uppercase tracking-tighter truncate max-w-[80%]">{s.title}</span>
                                        <span className="text-[10px] text-muted-foreground/60 tabular-nums">SIM_{Math.round(s.similarity * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {result.answer && (
                        <div className="flex items-center gap-3 border-t border-border/20 pt-4">
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">YARDIMCI_OLDU_MU?</p>
                            <button
                                onClick={() => handleFeedback(true)}
                                disabled={!!feedback}
                                className={`h-7 w-7 flex items-center justify-center border transition-none ${feedback === 'positive' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'}`}
                            >
                                <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => handleFeedback(false)}
                                disabled={!!feedback}
                                className={`h-7 w-7 flex items-center justify-center border transition-none ${feedback === 'negative' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'}`}
                            >
                                <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                            {feedback && (
                                <span className="text-[9px] font-mono text-muted-foreground uppercase">GERİ_BİLDİRİM_KAYDEDİLDİ_TEŞEKKÜRLER</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
