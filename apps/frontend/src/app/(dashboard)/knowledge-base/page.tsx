'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Plus, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Taslak', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    REVIEW: { label: 'İnceleme', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    PUBLISHED: { label: 'Yayında', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    ARCHIVED: { label: 'Arşiv', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' },
};

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('PUBLISHED');

    const load = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { status: statusFilter };
            if (search) params.search = search;
            const res = await api.kb.list(params);
            setArticles(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch { /* handled */ }
        setLoading(false);
    };

    useEffect(() => { load(); }, [statusFilter]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

    const handleReview = async (id: string, approved: boolean) => {
        await api.kb.review(id, approved);
        load();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bilgi Bankası</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">{total} makale</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Makale ara…"
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </form>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button
                        key={k}
                        onClick={() => setStatusFilter(k)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === k ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                            }`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Articles */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            ) : articles.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">Makale bulunamadı</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {articles.map((a) => {
                        const s = STATUS_LABELS[a.status] ?? STATUS_LABELS.DRAFT;
                        return (
                            <div
                                key={a.id}
                                className="group flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${s.color}`}>
                                            {s.label}
                                        </span>
                                        {a.tags?.map((t: string) => (
                                            <span key={t} className="text-xs text-slate-400">#{t}</span>
                                        ))}
                                    </div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{a.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{a.creator?.fullName} · {new Date(a.updatedAt).toLocaleDateString('tr-TR')}</p>
                                </div>

                                {a.status === 'REVIEW' && (
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <button
                                            onClick={() => handleReview(a.id, true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold hover:bg-green-200 transition-colors"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Onayla
                                        </button>
                                        <button
                                            onClick={() => handleReview(a.id, false)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 transition-colors"
                                        >
                                            <XCircle className="h-3.5 w-3.5" /> Reddet
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
