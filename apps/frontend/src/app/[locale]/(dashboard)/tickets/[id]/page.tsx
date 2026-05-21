'use client';

export const dynamic = "force-dynamic";
import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
    Ticket, Clock, Shield, User as UserIcon, Send,
    Paperclip, Download, MoreVertical, CheckCircle2,
    AlertTriangle, MessageSquare, Loader2, Bot, Star, X,
    MessageCircle, Mail, Globe, Cpu, ExternalLink, User
} from 'lucide-react';
import { HotinfoGrid } from "@/components/ui/hotinfo-grid";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale, enUS as enLocale, de as deLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { MacroPicker } from '@/components/macros/macro-picker';
import { useTranslations, useLocale } from 'next-intl';
import { ContentSanitizer } from '@/lib/content-sanitizer';
import { markdownToHtml } from '@/lib/markdown-to-html';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'border-blue-900/50 text-blue-400 bg-blue-400/5',
    OPEN: 'border-sky-900/50 text-sky-400 bg-sky-400/5',
    IN_PROGRESS: 'border-amber-900/50 text-amber-400 bg-amber-400/5',
    PENDING_CUSTOMER: 'border-purple-900/50 text-purple-400 bg-purple-400/5',
    PENDING_CUSTOMER_REVIEW: 'border-orange-900/50 text-orange-400 bg-orange-400/5',
    RESOLVED: 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5',
    CLOSED: 'border-border text-muted-foreground bg-muted/5',
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'text-muted-foreground',
    MEDIUM: 'text-amber-500',
    HIGH: 'text-orange-600',
    URGENT: 'text-red-600 font-black italic',
};

const CHANNEL_ICONS: Record<string, any> = {
    WEB: Globe,
    WHATSAPP: MessageCircle,
    EMAIL: Mail,
    API: Cpu,
};

const CHANNEL_COLORS: Record<string, string> = {
    WEB: 'text-blue-400',
    WHATSAPP: 'text-emerald-400',
    EMAIL: 'text-amber-400',
    API: 'text-purple-400',
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const t = useTranslations('tickets.detail');
    const ts = useTranslations('tickets.status');
    const tp = useTranslations('tickets.priority');
    const tc = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const { id } = use(params);
    const [ticket, setTicket] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [drafting, setDrafting] = useState(false);
    const [downloadingHotinfo, setDownloadingHotinfo] = useState(false);
    const [aiTrace, setAiTrace] = useState<any>(null);
    const [agents, setAgents] = useState<any[]>([]);
    const [assigning, setAssigning] = useState(false);

    // CSAT States
    const [csatScore, setCsatScore] = useState<number>(0);
    const [csatHover, setCsatHover] = useState<number>(0);
    const [csatComment, setCsatComment] = useState('');

    // Live chat states
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [someoneTyping, setSomeoneTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const getDateLocale = () => {
        if (locale === 'tr') return trLocale;
        if (locale === 'de') return deLocale;
        return enLocale;
    };
    const dateLocale = getDateLocale();
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior, block: 'end' });
        }
    };

    const load = async () => {
        try {
            const [ticketRes, userRes] = await Promise.all([
                api.tickets.get(id),
                api.auth.me()
            ]);
            setTicket(ticketRes);
            setUser(userRes);
            const resolvedUser = userRes as any;
            const userRoleName = (typeof resolvedUser?.role === 'string' ? resolvedUser.role : resolvedUser?.role?.name)?.toLowerCase();
            const resolvedUserRoles = (resolvedUser?.roles || []).map((r: string) => r.toLowerCase());
            const isCustomerRole = resolvedUserRoles.includes('customer') || resolvedUserRoles.includes('viewer') || userRoleName === 'customer' || userRoleName === 'viewer';
            if (isCustomerRole) {
                setAiTrace(null);
                setAgents([]);
            } else {
                const [trace] = await Promise.all([
                    api.tickets.getAiTrace(id).catch((err) => {
                    console.warn('[TicketDetail] AI trace unavailable:', err);
                    return null;
                    }),
                    api.users.list('agent').then(setAgents).catch((err) => {
                        console.warn('[TicketDetail] Agent list unavailable:', err);
                        setAgents([]);
                    }),
                ]);
                setAiTrace(trace);
            }
            // Initial scroll to bottom
            setTimeout(() => scrollToBottom('auto'), 100);
        } catch (err) {
            toast.error(t('load_error'));
        } finally {
            setLoading(false);
        }
    };

    const downloadHotinfo = async () => {
        const customerId = ticket?.creator?.id;
        if (!customerId) return;

        setDownloadingHotinfo(true);
        try {
            const { blob, filename } = await api.customers.downloadHotinfo(customerId);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `hotinfo_${customerId}.hxl`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success(t('hotinfo_download_started'));
        } catch (error) {
            toast.error(t('hotinfo_download_error'));
        } finally {
            setDownloadingHotinfo(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    useEffect(() => {
        if (!id || !user) return;

        const socket = getSocket();
        socket.connect();
        socket.emit('ticket:join', id);

        const handleNewMessage = (data: any) => {
            if (data.ticketId === id && data.message.senderId !== user.id) {
                // Smart Buffer: Emit read event immediately if user is viewing the bilet
                getSocket().emit('ticket:message_read', {
                    ticketId: id,
                    messageId: data.message.id
                });

                setTicket((prev: any) => {
                    if (!prev) return prev;
                    // Prevent duplicate if optimistic message already exists with same content (unlikely but safe)
                    return {
                        ...prev,
                        messages: [...prev.messages, data.message]
                    };
                });
                setTimeout(() => scrollToBottom(), 50);
            }
        };

        const handleTyping = (data: any) => {
            if (data.userId !== user.id) {
                setSomeoneTyping(data.isTyping);
            }
        };

        const handleTicketUpdated = (updatedTicket: any) => {
            setTicket((prev: any) => ({ ...prev, ...updatedTicket, messages: prev.messages }));
        };

        const handlePresence = (data: { ticketId: string, userIds: string[] }) => {
            if (data.ticketId === id) {
                setOnlineUsers(data.userIds);
            }
        };

        const handleAttachmentAdded = (data: { messageId: string, attachment: any }) => {
            setTicket((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: prev.messages.map((m: any) => {
                        if (m.id === data.messageId) {
                            return {
                                ...m,
                                attachments: [...(m.attachments || []), data.attachment]
                            };
                        }
                        return m;
                    })
                };
            });
        };

        socket.on('ticket:new_message', handleNewMessage);
        socket.on('ticket:attachment_added', handleAttachmentAdded);
        socket.on('ticket:typing', handleTyping);
        socket.on('ticket:updated', handleTicketUpdated);
        socket.on('ticket:presence', handlePresence);

        return () => {
            socket.emit('ticket:leave', id);
            socket.off('ticket:new_message', handleNewMessage);
            socket.off('ticket:attachment_added', handleAttachmentAdded);
            socket.off('ticket:typing', handleTyping);
            socket.off('ticket:updated', handleTicketUpdated);
            socket.off('ticket:presence', handlePresence);
            socket.disconnect();
        };
    }, [id, user]);

    const handleTypingChange = (html: string) => {
        setReply(html);
        if (!isTyping) {
            setIsTyping(true);
            getSocket().emit('ticket:typing', { ticketId: id, isTyping: true });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            getSocket().emit('ticket:typing', { ticketId: id, isTyping: false });
        }, 2000);
    };

    const userRoles = (user?.roles || []).map((r: string) => r.toLowerCase());
    const roleName = (typeof user?.role === 'string' ? user.role : user?.role?.name)?.toLowerCase();
    const isCustomer = userRoles.includes('customer') || userRoles.includes('viewer') || roleName === 'customer' || roleName === 'viewer';
    const isReplyEffectivelyEmpty = ContentSanitizer.isEffectivelyEmpty(reply);
    const isComposerDisabled = ['CLOSED', 'RESOLVED', 'PENDING_CUSTOMER_REVIEW'].includes(ticket?.status);
    const isLiveChatEligible = !isCustomer || Boolean(ticket?.creator?.customerProfile?.isVip);

    const handleRequestLiveChat = async () => {
        try {
            const nextStatus = isCustomer ? 'REQUESTED' : 'LIVE';
            await api.patch(`/tickets/${id}`, { chatStatus: nextStatus });
            toast.success(isCustomer ? t('live_request_success') : t('live_start_success'));
            load(); // Refresh state to show WAITING_AGENT UI
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            toast.error(message.includes('LIVE_CHAT_VIP_REQUIRED') ? t('live_chat_vip_required') : t('chat_update_error'));
        }
    };

    const handleAcceptLiveChat = async () => {
        try {
            await api.patch(`/tickets/${id}`, { chatStatus: 'LIVE' });
            toast.success(t('live_accept_success'));
            load(); // Refresh state to show LIVE_SESSION_ACTIVE UI
        } catch (err) {
            toast.error(t('chat_start_error'));
        }
    };

    const handleAssignTicket = async (assigneeId: string) => {
        if (!assigneeId || assigneeId === ticket?.assignedTo || assigning) return;

        setAssigning(true);
        try {
            await api.tickets.assign(ticket.id, assigneeId);
            toast.success(t('assign_success'));
            await load();
        } catch (err) {
            toast.error(t('assign_error'));
        } finally {
            setAssigning(false);
        }
    };

    const handleSendReply = async () => {
        const sanitizedReply = ContentSanitizer.sanitize(reply);
        if (ContentSanitizer.isEffectivelyEmpty(sanitizedReply) && files.length === 0) return;

        const messageText = sanitizedReply;
        const previousReply = reply;
        setReply(''); // Clear immediately for UX
        setSending(true);

        // Optimistic UI: Add message locally first
        const tempId = 'temp-' + Date.now();
        const optimisticMessage = {
            id: tempId,
            message: messageText,
            senderId: user.id,
            sender: user,
            createdAt: new Date().toISOString(),
            isInternal: false,
            isOptimistic: true,
            attachments: []
        };

        setTicket((prev: any) => ({
            ...prev,
            messages: [...prev.messages, optimisticMessage]
        }));

        setTimeout(() => scrollToBottom(), 50);

        try {
            const message = await api.tickets.addMessage(id, {
                message: messageText,
                isInternal: false,
                contentFormat: 'HTML',
            });

            if (files.length > 0) {
                for (const file of files) {
                    await api.attachments.upload(message.id, file);
                }
            }

            // Replace optimistic message with real one
            setTicket((prev: any) => ({
                ...prev,
                messages: prev.messages.map((m: any) => m.id === tempId ? { ...message, sender: user } : m)
            }));

            setFiles([]);
            await load(); // Refresh state to ensure attachments appear correctly
            // No toast for success in chat, it's expected
        } catch (error: any) {
            toast.error(t('send_error', { error: error.message }));
            // Remove optimistic message on failure
            setTicket((prev: any) => ({
                ...prev,
                messages: prev.messages.filter((m: any) => m.id !== tempId)
            }));
            setReply(previousReply); // Restore input
        } finally {
            setSending(false);
        }
    };

    const handleSummarize = async () => {
        if (!summarizing) setSummarizing(true);
        try {
            const res = await api.get(`/ai/tickets/${id}/summarize`);
            setSummary(res);
            toast.success(t('summary_success'));
        } catch (err) {
            toast.error(t('summary_error'));
        } finally {
            setSummarizing(false);
        }
    };

    const handleDraft = async () => {
        setDrafting(true);
        try {
            const res = await api.ai.getCopilotDraft(id);
            setReply(markdownToHtml(res.draft));
            toast.success(t('draft_success'));
        } catch (err: any) {
            toast.error(t('draft_error', { error: err.message }));
        } finally {
            setDrafting(false);
        }
    };

    const handleTransitionToReview = async () => {
        if (!ticket) return;
        try {
            await api.tickets.updateStatus(ticket.id, 'PENDING_CUSTOMER_REVIEW');
            toast.success(t('review_success'));
            load(); // reload ticket
        } catch (error) {
            toast.error(t('status_update_error'));
        }
    };

    const handleSimulateCsat = async (score: number) => {
        if (!ticket) return;
        try {
            await api.post(`/tickets/${ticket.id}/feedback`, {
                score,
                comment: score >= 4 ? t('resolved_comment') : t('pending_comment')
            });
            toast.success(t('feedback_sent', { score }));
            load(); // reload ticket
        } catch (error) {
            toast.error(t('feedback_error'));
        }
    };

    const handleSubmitCsat = async () => {
        if (!ticket || csatScore === 0) return;
        setSending(true);
        try {
            await api.post(`/tickets/${ticket.id}/feedback`, {
                score: csatScore,
                comment: csatComment
            });
            toast.success(t('csat_success', { score: csatScore }));
            router.push(`/${locale}/my-tickets`); // Redirect out or they stay on a closed ticket view.
        } catch (error) {
            toast.error(t('csat_error'));
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
    );

    if (!ticket) return (
        <div className="text-center py-20">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">{t('not_found')}</h2>
            <p className="text-muted-foreground">{t('not_found_desc')}</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full py-0">
            {/* Main Conversation Column */}
            <div className="lg:col-span-3 space-y-4">
                <Card className="flex flex-col min-h-[700px] border-border/60 overflow-hidden">
                    <CardHeader className="py-3 bg-muted/20 border-b border-border/40 z-10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 font-bold uppercase tracking-widest">
                                        {(() => {
                                            const Icon = CHANNEL_ICONS[ticket.channel] || Globe;
                                            return <Icon className={`h-3 w-3 ${CHANNEL_COLORS[ticket.channel] || ''}`} />;
                                        })()}
                                        {t('ticket_id', { id: ticket.ticketNumber })}
                                    </div>
                                    <Badge className={STATUS_COLORS[ticket.status]}>{ts(ticket.status)}</Badge>
                                </div>
                                <CardTitle className="text-[16px] normal-case text-foreground font-bold tracking-tight mt-1">
                                    {ticket.subject.toUpperCase()}
                                </CardTitle>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                    <span className="flex items-center gap-1">
                                        {t('started_by', { name: ticket.creator?.fullName || tc('system') })}
                                    </span>
                                    <span className="flex items-center gap-1">{t('timestamp', { date: `${new Date(ticket.createdAt).toLocaleDateString(locale)} ${new Date(ticket.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isCustomer && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && ticket.status !== 'PENDING_CUSTOMER_REVIEW' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTransitionToReview}
                                        className="h-7 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        {t('finish_resolution')}
                                    </Button>
                                )}
                                {isCustomer && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && ticket.status !== 'PENDING_CUSTOMER_REVIEW' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTransitionToReview}
                                        className="h-7 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        {t('close_ticket')}
                                    </Button>
                                )}
                                {!isCustomer && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSummarize}
                                        disabled={summarizing}
                                        className="h-7 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <Bot className={`h-3 w-3 ${summarizing ? 'animate-pulse' : ''}`} />
                                        {summarizing ? t('summarizing') : t('ai_summary_btn')}
                                    </Button>
                                )}
                                {!isCustomer && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDraft}
                                        disabled={drafting}
                                        className="h-7 border-purple-500/30 text-purple-400 bg-purple-400/5 hover:bg-purple-400/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <Bot className={`h-3 w-3 ${drafting ? 'animate-pulse' : ''}`} />
                                        {drafting ? t('drafting') : t('ai_draft_btn')}
                                    </Button>
                                )}
                                {ticket.chatStatus === 'NORMAL' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRequestLiveChat}
                                        disabled={!isLiveChatEligible}
                                        title={!isLiveChatEligible ? t('live_chat_vip_only') : undefined}
                                        className="h-7 border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <MessageCircle className="h-3 w-3" />
                                        {isCustomer ? t('start_live_support') : t('request_live_chat')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {ticket.chatStatus === 'REQUESTED' && (
                            <div className="mt-2 p-3 border border-blue-500/30 bg-blue-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                        {isCustomer ? t('waiting_agent') : t('customer_waiting_live')}
                                    </span>
                                </div>
                                {!isCustomer && (
                                    <Button
                                        size="sm"
                                        onClick={handleAcceptLiveChat}
                                        className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        {t('start_conversation')}
                                    </Button>
                                )}
                            </div>
                        )}

                        {ticket.chatStatus === 'LIVE' && (
                            <div className="mt-2 p-2 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                                    {t('live_session_active')}
                                </span>
                            </div>
                        )}

                        {ticket.status === 'PENDING_CUSTOMER_REVIEW' && (
                            <div className="mt-2 p-4 border border-orange-500/30 bg-orange-500/5">
                                {isCustomer ? (
                                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="flex flex-col items-center">
                                            <h4 className="text-[12px] font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">{t('review_pending_title')}</h4>
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                {t('review_pending_desc')}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 py-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setCsatScore(star)}
                                                    onMouseEnter={() => setCsatHover(star)}
                                                    onMouseLeave={() => setCsatHover(0)}
                                                    className={`p-1 transition-all duration-200 ${(csatHover || csatScore) >= star ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'text-zinc-500 hover:text-orange-400/60 hover:scale-105'}`}
                                                >
                                                    <Star className={`h-8 w-8 transition-all ${(csatHover || csatScore) >= star ? 'fill-orange-500' : 'stroke-[1.5px]'}`} />
                                                </button>
                                            ))}
                                        </div>

                                        {csatScore > 0 && (
                                            <div className="w-full max-w-sm space-y-2">
                                                <Textarea
                                                    placeholder={t('feedback_placeholder')}
                                                    className="bg-black/40 border-border/50 text-[11px] h-16 uppercase tracking-tight"
                                                    value={csatComment}
                                                    onChange={(e) => setCsatComment(e.target.value)}
                                                />
                                                <Button
                                                    onClick={handleSubmitCsat}
                                                    disabled={sending}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-none h-8 text-[10px] uppercase font-bold tracking-widest"
                                                >
                                                    {sending ? t('saving') : t('save_and_close')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{t('customer_verification_pending')}</h4>
                                            <p className="text-[9px] text-muted-foreground font-mono uppercase mt-1">{t('auto_sync_active')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleSimulateCsat(2)} className="h-6 px-2 border-red-900/50 text-red-500 bg-red-500/5 text-[9px] uppercase font-bold tracking-wider">
                                                {t('debug_reject')}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleSimulateCsat(5)} className="h-6 px-2 border-emerald-900/50 text-emerald-500 bg-emerald-500/5 text-[9px] uppercase font-bold tracking-wider">
                                                {t('debug_approve')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {summary && (
                            <div className="mt-2 p-3 border border-primary/20 bg-primary/5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Bot className="h-3 w-3 text-primary" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">{t('ai_summary_record')}</span>
                                    <button onClick={() => setSummary(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <p className="text-[11px] leading-relaxed text-foreground/90 font-medium italic">"{summary}"</p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col bg-muted/5 relative">
                        <ScrollArea className="flex-1 p-4 h-[550px]">
                            <div className="space-y-6">
                                {/* Initial Description as first message */}
                                <div className="flex gap-3 group">
                                    <div className="relative shrink-0">
                                        <div className="h-8 w-8 bg-muted flex items-center justify-center border border-border text-[10px] font-bold uppercase">
                                            {ticket.creator?.fullName?.[0] || 'OP'}
                                        </div>
                                        {onlineUsers.includes(ticket.userId) && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 max-w-[85%]">
                                        <div className="flex items-baseline justify-between gap-4">
                                            <span className="text-[11px] font-mono font-bold uppercase tracking-tight truncate">{ticket.creator?.fullName || 'EXTERNAL_AGENT'}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-mono shrink-0">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                                        </div>
                                        <div className="bg-muted/30 border border-border/50 p-3 text-[12px] leading-relaxed tracking-tight text-foreground font-medium shadow-sm">
                                            <RichTextRenderer content={ticket.description} />

                                            {/* Show attachments from the first message here if it's the description duplicate */}
                                            {ticket.messages?.[0]?.attachments?.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-border/20 space-y-1">
                                                    <p className="text-[9px] uppercase font-bold text-muted-foreground/60 mb-1">{t('initial_attachments') || 'Bilet Ekleri'}</p>
                                                    {ticket.messages[0].attachments.map((file: any) => (
                                                        <a
                                                            key={file.id}
                                                            href={api.attachments.getDownloadUrl(file.id)}
                                                            target="_blank"
                                                            className="flex items-center gap-2 bg-black/20 p-1.5 hover:bg-black/40 transition-none text-[10px] font-mono border border-border/20"
                                                        >
                                                            <Paperclip className="h-3 w-3 opacity-60" />
                                                            <span className="flex-1 truncate uppercase">{file.fileName}</span>
                                                            <Download className="h-3 w-3 opacity-60" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Thread */}
                                {ticket.messages.map((msg: any) => {
                                    const isMe = msg.senderId === user?.id;
                                    const isSystem = !msg.senderId;

                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isSystem ? 'justify-center' : ''}`}>
                                            {!isSystem && (
                                                <div className="relative shrink-0">
                                                    <div className={`h-8 w-8 flex items-center justify-center border text-[10px] font-bold uppercase ${isMe ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted border-border'}`}>
                                                        {msg.sender?.fullName?.[0] || '??'}
                                                    </div>
                                                    {onlineUsers.includes(msg.senderId) && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                                                    )}
                                                </div>
                                            )}

                                            <div className={`flex flex-col space-y-1 ${isSystem ? 'max-w-full items-center' : isMe ? 'items-end max-w-[85%]' : 'items-start max-w-[85%]'}`}>
                                                {!isSystem && (
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[11px] font-mono font-bold uppercase tracking-tight">{msg.sender?.fullName || tc('anonymous')}</span>
                                                        <span className="text-[9px] text-muted-foreground uppercase font-mono">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                                                    </div>
                                                )}

                                                <div className={`p-3 text-[13px] leading-relaxed tracking-tight font-medium ${isSystem
                                                    ? 'bg-transparent text-muted-foreground italic text-center text-[11px]'
                                                    : isMe
                                                        ? 'bg-primary text-primary-foreground border border-primary rounded-tl-lg rounded-bl-lg rounded-br-none shadow-sm'
                                                        : 'bg-card border border-border/60 rounded-tr-lg rounded-br-lg rounded-bl-none shadow-sm'
                                                    } ${msg.isOptimistic ? 'opacity-70 italic' : ''}`}>
                                                    <RichTextRenderer content={msg.message} />

                                                    {/* Attachments for this message */}
                                                    {msg.attachments?.length > 0 && (
                                                        <div className="mt-3 pt-2 border-t border-border/20 space-y-1">
                                                            {msg.attachments.map((file: any) => (
                                                                <a
                                                                    key={file.id}
                                                                    href={api.attachments.getDownloadUrl(file.id)}
                                                                    target="_blank"
                                                                    className="flex items-center gap-2 bg-black/20 p-1.5 hover:bg-black/40 transition-none text-[10px] font-mono border border-border/20"
                                                                >
                                                                    <Paperclip className="h-3 w-3 opacity-60" />
                                                                    <span className="flex-1 truncate uppercase">{file.fileName}</span>
                                                                    <Download className="h-3 w-3 opacity-60" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.isOptimistic && (
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-primary animate-pulse">{t('sending')}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing Indicator */}
                                {someoneTyping && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 bg-muted border border-border flex items-center justify-center text-[10px] animate-bounce shrink-0">{tc('ai_bot')}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="p-3 w-16 bg-card border border-border/60 rounded-tr-lg rounded-br-lg rounded-bl-none">
                                                <span className="flex gap-1 justify-center items-center h-4">
                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0s]" />
                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={scrollRef} className="h-px" />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-sm flex flex-col gap-3 z-10">
                        {/* Selected Files Preview */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 w-full">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-muted border border-border px-1.5 py-0.5 text-[9px] font-mono uppercase">
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-3 w-full">
                            <label className="mb-2 cursor-pointer text-muted-foreground hover:text-primary transition-all p-1.5 hover:bg-primary/10 rounded-full">
                                <Paperclip className="h-5 w-5" />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center mr-1">
                                    <MacroPicker onSelect={(content: string) => {
                                        const macroHtml = markdownToHtml(content);
                                        setReply((prev) => prev && !ContentSanitizer.isEffectivelyEmpty(prev)
                                            ? `${prev}${macroHtml}`
                                            : macroHtml);
                                    }} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                                        <Shield className="h-2.5 w-2.5" /> {t('secure_chat')}
                                    </span>
                                </div>
                                <RichTextEditor
                                    placeholder={t('message_placeholder')}
                                    value={reply}
                                    onChange={handleTypingChange}
                                    disabled={isComposerDisabled}
                                    aria-label={t('message_placeholder')}
                                    onSubmit={() => {
                                        if (!sending && (!isReplyEffectivelyEmpty || files.length > 0)) {
                                            handleSendReply();
                                        }
                                    }}
                                    className="min-h-20 transition-colors"
                                />
                            </div>
                            {!isComposerDisabled && (
                                <Button
                                    onClick={handleSendReply}
                                    disabled={sending || (isReplyEffectivelyEmpty && files.length === 0)}
                                    className="shrink-0 bg-primary hover:bg-primary/90 rounded-md h-auto min-h-20 w-14 border-border transition-all hover:scale-[1.02] active:scale-[0.98] self-stretch"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" /> : <Send className="h-6 w-6 text-primary-foreground" />}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-4">
                <Card className="border-border/60">
                    <CardHeader className="py-2 bg-muted/10 border-b border-border/40">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">{t('ticket_metadata')}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-3 grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                            <label className="text-[8px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">{t('status_label')}</label>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-tight text-foreground truncate">{ts(ticket.status)}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[8px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">{t('channel_label')}</label>
                            <div className="flex items-center gap-1.5">
                                {(() => {
                                    const Icon = CHANNEL_ICONS[ticket.channel] || Globe;
                                    return <Icon className={`h-3 w-3 ${CHANNEL_COLORS[ticket.channel] || ''}`} />;
                                })()}
                                <span className="text-[10px] font-bold uppercase tracking-tight text-foreground">{ticket.channel || 'WEB'}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[8px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">{t('priority_label')}</label>
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className={`text-[9px] h-4 px-1 py-0 rounded-none ${PRIORITY_COLORS[ticket.priority]}`}>{tp(ticket.priority)}</Badge>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[8px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">{t('open_date')}</label>
                            <p className="text-[9px] font-mono font-medium text-foreground truncate">{new Date(ticket.createdAt).toLocaleDateString(locale)} {new Date(ticket.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="space-y-1 col-span-2 pt-2 border-t border-border/20">
                            <label className="text-[8px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">{t('assignee_label')}</label>
                            {!isCustomer ? (
                                <Select
                                    value={ticket.assignedTo || ''}
                                    onValueChange={handleAssignTicket}
                                    disabled={assigning || agents.length === 0 || ticket.status === 'CLOSED'}
                                >
                                    <SelectTrigger className="h-8 rounded-none border-border/60 bg-background/60 text-[10px] font-bold uppercase tracking-tight">
                                        <SelectValue placeholder={agents.length === 0 ? t('assign_no_agents') : t('assign_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.fullName || agent.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 bg-muted border border-border flex items-center justify-center text-[8px] font-bold">
                                        {ticket.assignee?.fullName?.[0] || 'AX'}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-tight">{ticket.assignee?.fullName || tc('unassigned')}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {!isCustomer && aiTrace && (
                    <Card className="border-purple-500/25 bg-purple-500/[0.03]">
                        <CardHeader className="py-2 border-b border-purple-500/15">
                            <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.18em] text-purple-300">
                                <Bot className="h-3.5 w-3.5" />
                                {t('ai_trace_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 py-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_provider')}</label>
                                    <p className="text-[10px] font-mono text-foreground truncate">{aiTrace.interaction?.provider || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_model')}</label>
                                    <p className="text-[10px] font-mono text-foreground truncate">{aiTrace.interaction?.model || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_language')}</label>
                                    <p className="text-[10px] font-mono text-foreground uppercase">{aiTrace.quality?.responseLanguage || aiTrace.quality?.requestLocale || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_confidence')}</label>
                                    <p className="text-[10px] font-mono text-foreground">{aiTrace.interaction?.confidenceBand || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_route_locale')}</label>
                                    <p className="text-[10px] font-mono text-foreground uppercase">{aiTrace.quality?.routeLocale || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_profile_language')}</label>
                                    <p className="text-[10px] font-mono text-foreground uppercase">{aiTrace.quality?.profileLanguage || '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{t('ai_trace_contract')}</span>
                                    <Badge variant="outline" className={`h-5 rounded-none text-[9px] ${aiTrace.quality?.contractSections?.isComplete ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10'}`}>
                                        {aiTrace.quality?.contractSections?.passed || 0}/5
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-5 gap-1">
                                    {['problem', 'cause', 'checks', 'steps', 'verification'].map((key) => (
                                        <div
                                            key={key}
                                            className={`h-1.5 ${aiTrace.quality?.contractSections?.[key] ? 'bg-emerald-400' : 'bg-amber-500/50'}`}
                                            title={key}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase">
                                    <span className="text-muted-foreground">{t('ai_trace_source_leak')}</span>
                                    <span className={aiTrace.quality?.sourceLeakDetected ? 'text-red-300' : 'text-emerald-300'}>
                                        {aiTrace.quality?.sourceLeakDetected ? t('ai_trace_fail') : t('ai_trace_pass')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase">
                                    <span className="text-muted-foreground">{t('ai_trace_language_risk')}</span>
                                    <span className={aiTrace.quality?.mixedLanguageRisk ? 'text-amber-300' : 'text-emerald-300'}>
                                        {aiTrace.quality?.mixedLanguageRisk ? t('ai_trace_risk') : t('ai_trace_pass')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase">
                                    <span className="text-muted-foreground">{t('ai_trace_ticket_flag')}</span>
                                    <span className={aiTrace.quality?.ticketCreatedFlagMatches ? 'text-emerald-300' : 'text-amber-300'}>
                                        {aiTrace.quality?.ticketCreatedFlagMatches ? t('ai_trace_pass') : t('ai_trace_risk')}
                                    </span>
                                </div>
                            </div>

                            {aiTrace.interaction?.userQuery && (
                                <div className="pt-2 border-t border-purple-500/15">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_query')}</label>
                                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/85 line-clamp-3">{aiTrace.interaction.userQuery}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!isCustomer && ticket.hotinfoSnapshot && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between border-cyan-900/50 bg-cyan-950/10 text-cyan-300 hover:bg-cyan-950/25 hover:text-cyan-100"
                            >
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
                                    <Cpu className="h-3.5 w-3.5" />
                                    {t('hotfix_data')}
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[88vh] p-0 overflow-hidden border-cyan-900/50 bg-background">
                            <DialogHeader className="bg-cyan-950/20 border-cyan-900/30 px-6 py-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1.5">
                                        <DialogTitle className="flex items-center gap-2 text-cyan-300">
                                            <Cpu className="h-4 w-4" />
                                            {t('hotfix_data')}
                                        </DialogTitle>
                                        <DialogDescription className="text-[12px] leading-5 text-slate-300 dark:text-cyan-100/75">
                                            {t('hotinfo_modal_desc')}
                                        </DialogDescription>
                                    </div>
                                    {ticket.creator?.id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadHotinfo}
                                            disabled={downloadingHotinfo}
                                            className="shrink-0 h-8 border-cyan-900/50 bg-cyan-950/20 text-[10px] uppercase tracking-[0.16em] text-cyan-200 hover:bg-cyan-950/35 hover:text-cyan-100"
                                        >
                                            {downloadingHotinfo ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                                            {t('download_hotinfo')}
                                        </Button>
                                    )}
                                </div>
                            </DialogHeader>
                            <ScrollArea className="max-h-[72vh] px-6 py-5">
                                <div className="space-y-5">
                                    {typeof ticket.hotinfoSnapshot === 'object' && ticket.hotinfoSnapshot !== null ? (
                                        <HotinfoGrid data={ticket.hotinfoSnapshot} />
                                    ) : (
                                        <div className="text-[11px] font-mono text-cyan-200/90 leading-relaxed whitespace-pre-wrap break-all border border-cyan-900/30 bg-cyan-950/10 p-3">
                                            {String(ticket.hotinfoSnapshot)}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                )}

                {/* System Notice */}
                <div className="bg-primary/5 border border-primary/20 p-3 space-y-2">
                    <h4 className="text-[9px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-[0.2em]">
                        <Shield className="h-3 w-3" /> {t('security_warning')}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-tight tracking-tight">
                        {t('security_warning_desc')}
                    </p>
                </div>
            </div>
        </div>
    );
}
