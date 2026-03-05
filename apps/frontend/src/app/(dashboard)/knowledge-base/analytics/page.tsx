'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    BookOpen,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function KbAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [suggestTitle, setSuggestTitle] = useState('');
    const [suggestContent, setSuggestContent] = useState('');
    const [suggestResult, setSuggestResult] = useState<string | null>(null);
    const [suggestLoading, setSuggestLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.kb.getGlobalAnalytics();
            setData(res);
        } catch (err) {
            toast.error('Analitik verileri yüklenemedi');
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSuggest = async () => {
        if (!suggestTitle || !suggestContent) {
            toast.error('Başlık ve içerik gereklidir');
            return;
        }
        setSuggestLoading(true);
        try {
            const res = await api.kb.suggestCategory(suggestTitle, suggestContent);
            setSuggestResult(res);
        } catch {
            toast.error('Kategori önerisi alınamadı');
        }
        setSuggestLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        İçerik Analitiği
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Bilgi bankası performansı ve kullanıcı etkileşimi özeti.
                    </p>
                </div>
                <Link
                    href="/knowledge-base"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors text-sm font-semibold"
                >
                    <ChevronLeft className="h-4 w-4" /> Geri Dön
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Most Viewed */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold">En Çok Görüntülenenler</h2>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                        {data?.mostViewed?.map((a: any) => (
                            <Link
                                key={a.id}
                                href={`/knowledge-base/${a.id}`}
                                className="flex items-center justify-between group"
                            >
                                <div className="min-w-0 pr-4">
                                    <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                                        {a.title}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{a.status.toLowerCase()}</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                    <Eye className="h-3.5 w-3.5" />
                                    {a.viewCount}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Performance / Least Helpful */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold">Geliştirilmesi Gerekenler</h2>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                        {data?.performance?.map((p: any) => (
                            <Link
                                key={p.id}
                                href={`/knowledge-base/${p.id}`}
                                className="flex items-center justify-between group"
                            >
                                <div className="min-w-0 pr-4">
                                    <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                                        Makale #{p.id.slice(0, 8)}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <span className="flex items-center gap-1 text-green-500"><ThumbsUp className="h-2.5 w-2.5" /> {p.helpful}</span>
                                        <span className="flex items-center gap-1 text-red-500"><ThumbsDown className="h-2.5 w-2.5" /> {p.unhelpful}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">%{p.score.toFixed(0)}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Faydalılık</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Suggestion Playground */}
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl bg-white rounded-full -mr-20 -mt-20 h-64 w-64" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <h2 className="text-xl font-bold">AI Kategori Önerici</h2>
                        </div>
                        <p className="text-brand-100 text-sm max-w-md">
                            Ollama entegrasyonu ile makale içeriğine göre en uygun kategoriyi otomatik belirleyin.
                        </p>
                        <div className="space-y-3">
                            <input
                                value={suggestTitle}
                                onChange={e => setSuggestTitle(e.target.value)}
                                placeholder="Makale Başlığı..."
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                            />
                            <textarea
                                value={suggestContent}
                                onChange={e => setSuggestContent(e.target.value)}
                                placeholder="Makale İçeriği (İlk 500 karakter kullanılır)..."
                                rows={3}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSuggest}
                            disabled={suggestLoading}
                            className="w-full md:w-auto px-8 py-3 rounded-xl bg-white text-brand-600 font-bold hover:bg-brand-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {suggestLoading ? 'Analiz Ediliyor...' : 'Öneriyi Getir'}
                        </button>
                    </div>

                    <div className="w-full md:w-72 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 flex flex-col items-center justify-center text-center min-h-[240px]">
                        {suggestResult ? (
                            <div className="animate-in zoom-in-95 duration-300">
                                <p className="text-brand-200 text-xs font-bold uppercase tracking-widest mb-2">Önerilen Kategori</p>
                                <p className="text-3xl font-black">{suggestResult}</p>
                                <div className="mt-4 flex justify-center">
                                    <div className="p-3 bg-green-500/20 rounded-full">
                                        <ArrowRight className="h-6 w-6 text-green-300" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-brand-200/50 space-y-2">
                                <BookOpen className="h-12 w-12 mx-auto opacity-20" />
                                <p className="text-sm font-medium italic">Henüz bir analiz yapılmadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
