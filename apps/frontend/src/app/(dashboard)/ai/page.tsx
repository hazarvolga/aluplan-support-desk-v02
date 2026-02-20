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
    HIGH: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    LOW: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    NO_MATCH: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
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
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                    <Bot className="h-6 w-6 text-brand-500" />
                    AI Asistan
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                    Bilgi bankasında semantik arama yapın. Ollama &amp; pgvector ile güçlendirilmiştir.
                </p>
            </div>

            {/* Query input */}
            <form onSubmit={handleQuery} className="flex gap-3">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Sorunuzu yazın…"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold disabled:opacity-50 transition flex items-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    {loading ? 'Aranıyor…' : 'Sor'}
                </button>
            </form>

            {/* Result */}
            {result && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-slide-up shadow-sm">
                    {/* Confidence badge */}
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${CONFIDENCE_COLORS[result.confidence] ?? ''}`}>
                            {result.confidence} güven
                        </span>
                    </div>

                    {/* Answer */}
                    {result.answer ? (
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">{result.answer}</p>
                    ) : (
                        <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                            <p className="text-sm">Bu konuda eşleşen bir yanıt bulunamadı.</p>
                        </div>
                    )}

                    {/* Suggest ticket */}
                    {result.suggestTicket && (
                        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Sorunuz için destek talebi oluşturmanızı öneririz.
                            </p>
                            <a
                                href="/tickets/new"
                                className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                            >
                                Talep Oluştur <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    )}

                    {/* Sources */}
                    {result.sources.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Kaynaklar</p>
                            <div className="space-y-1.5">
                                {result.sources.map((s) => (
                                    <div key={s.articleId} className="flex items-center justify-between text-sm">
                                        <span className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">{s.title}</span>
                                        <span className="text-xs text-slate-400 tabular-nums">{(s.similarity * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {result.answer && (
                        <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <p className="text-xs text-slate-400">Bu yanıt yardımcı oldu mu?</p>
                            <button
                                onClick={() => handleFeedback(true)}
                                disabled={!!feedback}
                                className={`p-2 rounded-lg transition-colors ${feedback === 'positive' ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                            >
                                <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleFeedback(false)}
                                disabled={!!feedback}
                                className={`p-2 rounded-lg transition-colors ${feedback === 'negative' ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                            >
                                <ThumbsDown className="h-4 w-4" />
                            </button>
                            {feedback && (
                                <span className="text-xs text-slate-400 ml-1">Geri bildiriminiz alındı, teşekkürler!</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
