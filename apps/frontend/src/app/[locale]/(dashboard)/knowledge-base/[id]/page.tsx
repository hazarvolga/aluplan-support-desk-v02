'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import {
    BookOpen,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    Calendar,
    User,
    Tag,
    History,
    Eye,
    FileText,
    X,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // Versioning state
    const [showVersions, setShowVersions] = useState(false);
    const [compData, setCompData] = useState<any>(null);
    const [compLoading, setCompLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.kb.get(id);
            setArticle(data);
            // Increment view count automatically
            api.kb.incrementView(id).catch(() => { });
        } catch (err) {
            toast.error('Makale yüklenemedi');
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, [id]);

    const handleFeedback = async (isHelpful: boolean) => {
        setFeedbackLoading(true);
        try {
            await api.kb.submitFeedback(id, isHelpful);
            setFeedbackSent(true);
            toast.success('Geri bildiriminiz için teşekkürler!');
        } catch {
            toast.error('Geri bildirim gönderilemedi');
        }
        setFeedbackLoading(false);
    };

    const handleCompare = async (v1: number, v2: number) => {
        setCompLoading(true);
        try {
            const res = await api.kb.compare(id, v1, v2);
            setCompData(res);
        } catch {
            toast.error('Versiyon karşılaştırması yapılamadı');
        }
        setCompLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Makale bulunamadı.</p>
                <Link href="/knowledge-pool" className="mt-4 text-brand-500 hover:underline flex items-center justify-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Geri Dön
                </Link>
            </div>
        );
    }

    const latestVersion = article.versions?.[0] || article;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                href="/knowledge-pool"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors text-sm font-medium group"
            >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Bilgi Havuzuna Dön
            </Link>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
                            {article.category?.name || 'Genel'}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{article.viewCount || 0} görüntülenme</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/knowledge-base/${id}/edit`}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-700 hover:text-white transition-all font-medium text-xs border border-orange-500/20"
                        >
                            <FileText className="h-3.5 w-3.5" /> Düzenle
                        </Link>

                        {(article.versions?.length > 1) && (
                            <button
                                onClick={() => setShowVersions(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all font-medium text-xs border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm"
                            >
                                <History className="h-3.5 w-3.5" /> Versiyon Geçmişi
                            </button>
                        )}
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-700 dark:text-white leading-tight tracking-tight">
                    {latestVersion.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 pt-2 border-b border-slate-200 dark:border-slate-800 pb-6 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{article.creator?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(article.updatedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {article.tags?.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <div className="flex gap-1.5">
                                {article.tags.map((tag: string) => (
                                    <span key={tag} className="hover:text-brand-500 cursor-default">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <article className="max-w-none">
                <div className="text-slate-600 dark:text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                    {latestVersion.content}
                </div>
            </article>

            {/* Feedback Section */}
            <div className="mt-12 p-8 rounded-2xl bg-white/[0.02] dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden group backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen className="h-32 w-32" />
                </div>

                {!feedbackSent ? (
                    <div className="relative z-10 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Bu doküman size yardımcı oldu mu?</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleFeedback(true)}
                                disabled={feedbackLoading}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-700 hover:text-white transition-all font-medium text-sm disabled:opacity-50 border border-green-500/20"
                            >
                                <ThumbsUp className="h-4 w-4" /> Evet
                            </button>
                            <button
                                onClick={() => handleFeedback(false)}
                                disabled={feedbackLoading}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-600 hover:text-white transition-all font-medium text-sm disabled:opacity-50 border border-slate-500/20"
                            >
                                <ThumbsDown className="h-4 w-4" /> Geliştirilmeli
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 text-center py-4 animate-in zoom-in-95 duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 mb-4 border border-brand-500/20">
                            <ThumbsUp className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Geribildiriminiz alındı</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">İçeriğimizi geliştirmemize yardımcı olduğunuz için teşekkür ederiz.</p>
                    </div>
                )}
            </div>

            {/* Version History Modal */}
            {showVersions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <History className="h-5 w-5 text-brand-500" /> Versiyon Geçmişi
                            </h2>
                            <button onClick={() => { setShowVersions(false); setCompData(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {!compData ? (
                                <div className="space-y-3">
                                    {article.versions.map((v: any, idx: number) => (
                                        <div key={v.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900/50 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold text-sm">
                                                    v{v.version}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{v.changeSummary || 'Değişiklik özeti yok'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(v.createdAt).toLocaleString('tr-TR')} · {v.creator?.fullName}</p>
                                                </div>
                                            </div>
                                            {idx < article.versions.length - 1 && (
                                                <button
                                                    onClick={() => handleCompare(article.versions[idx + 1].version, v.version)}
                                                    className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-brand-500 transition-colors"
                                                >
                                                    Bir Öncekiyle Karşılaştır
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <button onClick={() => setCompData(null)} className="text-sm text-brand-500 font-medium flex items-center gap-1 hover:underline">
                                        <ChevronLeft className="h-4 w-4" /> Versiyon listesine dön
                                    </button>

                                    {compLoading ? (
                                        <div className="py-20 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6 h-full font-mono text-[13px]">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                                                    <FileText className="h-3.5 w-3.5" /> Versiyon {compData.older.version}
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 h-[500px] overflow-y-auto custom-scrollbar">
                                                    {compData.older.content.split('\n').map((line: string, i: number) => {
                                                        const isRemoved = !compData.newer.content.split('\n').includes(line);
                                                        return (
                                                            <div key={i} className={`px-2 py-0.5 whitespace-pre-wrap ${isRemoved ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-l-2 border-red-500' : ''}`}>
                                                                {isRemoved && <span className="mr-2 opacity-50">-</span>}
                                                                {line || ' '}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-brand-500 uppercase tracking-wider font-sans">
                                                    <FileText className="h-3.5 w-3.5" /> Versiyon {compData.newer.version}
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 h-[500px] overflow-y-auto custom-scrollbar">
                                                    {compData.newer.content.split('\n').map((line: string, i: number) => {
                                                        const isAdded = !compData.older.content.split('\n').includes(line);
                                                        return (
                                                            <div key={i} className={`px-2 py-0.5 whitespace-pre-wrap ${isAdded ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-l-2 border-green-500' : ''}`}>
                                                                {isAdded && <span className="mr-2 opacity-50">+</span>}
                                                                {line || ' '}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
