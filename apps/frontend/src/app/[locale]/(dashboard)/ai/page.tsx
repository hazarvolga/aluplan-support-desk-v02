'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/role-guard';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
    Bot,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    Sparkles,
    Zap,
    Paperclip,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AiVisualEvidence, type AiVisualEvidenceItem } from '@/components/ai/AiVisualEvidence';

interface QueryResult {
    query: string;
    answer: string | null;
    confidence: string;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    visuals?: AiVisualEvidenceItem[];
    interactionId: string;
    suggestTicket: boolean;
}

const CONFIDENCE_COLORS: Record<string, string> = {
    HIGH: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    NO_MATCH: 'bg-slate-500/10 text-slate-400 border-white/5',
};

interface Message {
    role: 'user' | 'assistant';
    content: string;
    result?: QueryResult;
}

/** Resolves the role string regardless of how the backend returns it */
function resolveRole(user: { role?: string | { name?: string } | null } | null): string {
    const role = user?.role;
    if (typeof role === 'object' && role !== null) {
        return (role as { name?: string }).name?.toLowerCase() || '';
    }
    return (role as string)?.toLowerCase() || '';
}

/** The actual AI assistant UI — only rendered for staff/admin */
function AiPageContent() {
    const t = useTranslations('ai');
    const { locale } = useParams();
    const [query, setQuery] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative' | null>>({});

    useEffect(() => {
        const socket = getSocket();
        socket.connect();

        const handleChunk = (data: { jobId: string; chunk: string }) => {
            setStreamingText(prev => prev + data.chunk);
        };

        const handleCompleted = (data: { jobId: string; result: any }) => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.result.answer || data.result.response || '',
                result: data.result
            }]);
            setStreamingText('');
            setActiveJobId(null);
            setLoading(false);
        };

        socket.on('AI_CHUNK', handleChunk);
        socket.on('AI_QUERY_COMPLETED', handleCompleted);

        return () => {
            socket.off('AI_CHUNK', handleChunk);
            socket.off('AI_QUERY_COMPLETED', handleCompleted);
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result?.toString().split(',')[1];
                resolve(base64String || '');
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMsg = query.trim();
        if ((!userMsg && files.length === 0) || loading) return;

        setLoading(true);
        setQuery('');

        const currentFiles = [...files];
        setFiles([]);

        try {
            const attachments = await Promise.all(currentFiles.map(async f => ({
                name: f.name,
                mimeType: f.type,
                data: await fileToBase64(f)
            })));

            const newMessages: Message[] = [...messages, {
                role: 'user',
                content: userMsg || (attachments.length > 0 ? '[Ekran Görüntüsü Gönderildi]' : '')
            }];
            setMessages(newMessages);

            const apiHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
            const res = await api.ai.query(userMsg, null, null, locale as string, apiHistory, attachments);

            if (res.jobId) {
                setActiveJobId(res.jobId);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: res.answer || 'No response',
                    result: res
                }]);
                setLoading(false);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Hata oluştu, lütfen tekrar deneyin.'
            }]);
        }
        setLoading(false);
    };

    const handleFeedback = async (interactionId: string, positive: boolean) => {
        if (feedback[interactionId]) return;
        await api.ai.feedback(interactionId, positive ? 5 : 1);
        setFeedback(prev => ({ ...prev, [interactionId]: positive ? 'positive' : 'negative' }));
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
                        {t('title')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        {t('subtitle')}
                    </p>
                </div>
                <Badge variant="outline" className="h-7 border-orange-500/20 bg-orange-500/5 text-orange-500 font-bold tracking-widest px-3">
                    {t('beta_protocol')}
                </Badge>
            </div>

            {/* Conversation History */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'user' ? (
                                <div className="max-w-[80%] p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-white font-medium">
                                    {msg.content}
                                </div>
                            ) : (
                                <Card className="glass-card p-6 border-orange-500/10 relative overflow-hidden w-full max-w-[90%]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('response.header')}</span>
                                        </div>
                                        {msg.result?.confidence && (
                                            <Badge className={`px-2 py-0.5 font-bold text-[9px] tracking-widest ${CONFIDENCE_COLORS[msg.result.confidence] || ''}`}>
                                                {t('response.confidence_score', { confidence: msg.result.confidence })}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="text-white/90 leading-relaxed text-base font-medium italic border-l-2 border-orange-500/30 pl-4 py-1 bg-orange-500/[0.02]">
                                        {msg.content}
                                    </div>

                                    <div className="mt-6">
                                        <AiVisualEvidence
                                            visuals={msg.result?.visuals}
                                            accent="orange"
                                            labels={{
                                                title: t('response.visuals.title'),
                                                description: t('response.visuals.description'),
                                                open: t('response.visuals.open'),
                                                source: t('response.visuals.source'),
                                            }}
                                        />
                                    </div>

                                    {msg.result?.suggestTicket && (
                                        <div className="mt-6 p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">
                                                {t('suggest_ticket.text')}
                                            </p>
                                            <Button asChild size="sm" className="h-7 bg-primary text-primary-foreground text-[9px] font-bold">
                                                <Link href="/tickets/new">{t('suggest_ticket.cta')}</Link>
                                            </Button>
                                        </div>
                                    )}

                                    {msg.result?.sources && msg.result.sources.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-white/5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {msg.result.sources.map((s: any) => (
                                                    <div key={s.articleId} className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                                        <span className="text-[11px] font-bold text-white/70 truncate mr-2">{s.title}</span>
                                                        <span className="text-[9px] font-mono text-orange-500/60 font-bold shrink-0">%{Math.round(s.similarity * 100)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {msg.result?.interactionId && (
                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            {feedback[msg.result.interactionId] ? (
                                                <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold">{t('feedback.success')}</span>
                                            ) : (
                                                <>
                                                    <Button size="sm" variant="ghost" onClick={() => handleFeedback(msg.result!.interactionId, true)} className="h-7 w-7 p-0 hover:bg-emerald-500/10">
                                                        <ThumbsUp className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleFeedback(msg.result!.interactionId, false)} className="h-7 w-7 p-0 hover:bg-rose-500/10">
                                                        <ThumbsDown className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        {streamingText ? (
                            <Card className="glass-card p-6 border-orange-500/10 relative overflow-hidden w-full max-w-[90%]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('response.header')}</span>
                                </div>
                                <div className="text-white/90 leading-relaxed text-base font-medium italic border-l-2 border-orange-500/30 pl-4 py-1 bg-orange-500/[0.02] whitespace-pre-wrap">
                                    {streamingText}
                                    <span className="inline-block w-1.5 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
                                </div>
                            </Card>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                <span className="text-xs text-muted-foreground font-medium italic">AI düşünüyor...</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Query input */}
            <Card className="glass-card p-2 border-white/10 group focus-within:border-orange-500/30 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] sticky bottom-4 z-50">
                <form onSubmit={handleQuery} className="space-y-2">
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2 pb-2">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-orange-500">
                                    <Paperclip className="h-3 w-3" />
                                    <span className="truncate max-w-[100px]">{f.name}</span>
                                    <button type="button" onClick={() => removeFile(i)} className="hover:text-orange-400">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500/40 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('input.placeholder')}
                                className="w-full pl-12 pr-4 h-14 bg-transparent text-white font-bold text-[14px] tracking-tight focus:outline-none placeholder:text-muted-foreground/30"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                id="ai-upload"
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.txt"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('ai-upload')?.click()}
                                className="h-14 w-14 p-0 border-white/10 hover:bg-white/5 rounded-xl border-dashed"
                            >
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || (!query.trim() && files.length === 0)}
                                className="h-14 px-8 flex-1 sm:flex-none bg-orange-500 text-white font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-orange-500/10 transition-all rounded-xl"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        {t('input.submit')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>

            {messages.length === 0 && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">{t('system_info.infrastructure')}</p>
                        <p className="text-xs font-bold text-white tracking-widest">{t('system_info.node')}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">{t('system_info.latency')}</p>
                        <p className="text-xs font-bold text-white tracking-widest"><span className="text-emerald-500 mr-2">●</span>{t('system_info.lookup', { ms: 24 })}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

/**
 * Route guard wrapper — redirects customers to /my-tickets.
 * /ai is staff/admin only to prevent unnecessary token costs.
 */
export default function AiPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
                return;
            }
            const role = resolveRole(user);
            if (role === 'customer' || role === 'viewer') {
                router.replace('/my-tickets');
            }
        }
    }, [user, loading, router]);

    if (loading) return null;
    if (!user) return null;

    const role = resolveRole(user);
    if (role === 'customer' || role === 'viewer') return null;

    return <AiPageContent />;
}
