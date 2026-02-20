'use client';
import { useState, useEffect, use, useRef } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import {
    Ticket, Clock, Shield, User as UserIcon, Send,
    Paperclip, Download, MoreVertical, CheckCircle2,
    AlertTriangle, MessageSquare, Loader2, Bot, Star
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { MacroPicker } from '@/components/macros/macro-picker';

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

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

    // CSAT States
    const [csatScore, setCsatScore] = useState<number>(0);
    const [csatHover, setCsatHover] = useState<number>(0);
    const [csatComment, setCsatComment] = useState('');

    // Live chat states
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [someoneTyping, setSomeoneTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const load = async () => {
        try {
            const [ticketRes, userRes] = await Promise.all([
                api.tickets.get(id),
                api.auth.me()
            ]);
            setTicket(ticketRes);
            setUser(userRes);
        } catch (err) {
            toast.error('Talep yüklenemedi');
        } finally {
            setLoading(false);
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
                setTicket((prev: any) => ({
                    ...prev,
                    messages: [...prev.messages, data.message]
                }));
                // Auto-scroll logic here or just rely on natural scroll
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

        socket.on('ticket:new_message', handleNewMessage);
        socket.on('ticket:typing', handleTyping);
        socket.on('ticket:updated', handleTicketUpdated);

        return () => {
            socket.emit('ticket:leave', id);
            socket.off('ticket:new_message', handleNewMessage);
            socket.off('ticket:typing', handleTyping);
            socket.off('ticket:updated', handleTicketUpdated);
            socket.disconnect();
        };
    }, [id, user]);

    const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReply(e.target.value);
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
    const isCustomer = userRoles.includes('customer') || user?.role?.toLowerCase() === 'customer';

    const handleSendReply = async () => {
        if (!reply.trim() && files.length === 0) return;
        setSending(true);
        try {
            const message = await api.tickets.addMessage(id, {
                message: reply,
                isInternal: false
            });

            if (files.length > 0) {
                for (const file of files) {
                    await api.attachments.upload(message.id, file);
                }
            }

            // Refresh ticket to show new message
            const updated = await api.tickets.get(id);
            setTicket(updated);
            setReply('');
            setFiles([]);
            toast.success('Mesajınız iletildi');
        } catch (error: any) {
            toast.error('Mesaj gönderilemedi: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const handleSummarize = async () => {
        setSummarizing(true);
        try {
            const res = await api.get(`/ai/tickets/${id}/summarize`);
            setSummary(res);
            toast.success('Yapay zeka özeti oluşturuldu');
        } catch (err) {
            toast.error('Özet oluşturulurken hata');
        } finally {
            setSummarizing(false);
        }
    };

    const handleTransitionToReview = async () => {
        if (!ticket) return;
        try {
            await api.tickets.updateStatus(ticket.id, 'PENDING_CUSTOMER_REVIEW');
            toast.success('Talep onaya gönderildi (Müşteri Doğrulaması Bekleniyor)');
            load(); // reload ticket
        } catch (error) {
            toast.error('Durum değiştirilemedi');
        }
    };

    const handleSimulateCsat = async (score: number) => {
        if (!ticket) return;
        try {
            await api.post(`/tickets/${ticket.id}/feedback`, {
                score,
                comment: score >= 4 ? 'Sorunum tamamen çözüldü, teşekkürler.' : 'Hala eksikler var.'
            });
            toast.success(`Müşteri ${score}/5 puanı ile değerlendirme yaptı.`);
            load(); // reload ticket
        } catch (error) {
            toast.error('Test değerlendirmesi gönderilemedi.');
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
            toast.success(`${csatScore}/5 puanı ile değerlendirme yaptınız. Teşekkürler!`);
            load(); // reload ticket
        } catch (error) {
            toast.error('Değerlendirme gönderilemedi.');
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
            <h2 className="text-xl font-bold">Talep Bulunamadı</h2>
            <p className="text-muted-foreground">İstediğiniz talep silinmiş veya erişim yetkiniz olmayabilir.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full py-0">
            {/* Main Conversation Column */}
            <div className="lg:col-span-3 space-y-4">
                <Card className="flex flex-col min-h-[700px] border-border/60">
                    <CardHeader className="py-3 bg-muted/20">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 font-bold uppercase tracking-widest">INCIDENT_{ticket.ticketNumber}</span>
                                    <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                                </div>
                                <CardTitle className="text-[16px] normal-case text-foreground font-bold tracking-tight mt-1">
                                    {ticket.subject.toUpperCase()}
                                </CardTitle>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                    <span className="flex items-center gap-1">
                                        OP: {ticket.creator?.fullName || 'SYSTEM_DEFAULT'}
                                    </span>
                                    <span className="flex items-center gap-1">TS: {new Date(ticket.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, '')}</span>
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
                                        EXEC_RESOLVE
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
                                        {summarizing ? 'SUMMARIZING...' : 'AI_SUMMARY'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {ticket.status === 'PENDING_CUSTOMER_REVIEW' && (
                            <div className="mt-2 p-4 border border-orange-500/30 bg-orange-500/5">
                                {isCustomer ? (
                                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="flex flex-col items-center">
                                            <h4 className="text-[12px] font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">INCIDENT_RESOLUTION_PENDING</h4>
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                Please evaluate system resolution performance to close channel.
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
                                                    className={`p-1 transition-all duration-150 ${(csatHover || csatScore) >= star ? 'text-orange-400' : 'text-muted/30 hover:text-orange-400/50'}`}
                                                >
                                                    <Star className={`h-6 w-6 ${(csatHover || csatScore) >= star ? 'fill-orange-400' : ''}`} />
                                                </button>
                                            ))}
                                        </div>

                                        {csatScore > 0 && (
                                            <div className="w-full max-w-sm space-y-2">
                                                <Textarea
                                                    placeholder="APPEND_OPERATIONAL_FEEDBACK (OPTIONAL)"
                                                    className="bg-black/40 border-border/50 text-[11px] h-16 uppercase tracking-tight"
                                                    value={csatComment}
                                                    onChange={(e) => setCsatComment(e.target.value)}
                                                />
                                                <Button
                                                    onClick={handleSubmitCsat}
                                                    disabled={sending}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-none h-8 text-[10px] uppercase font-bold tracking-widest"
                                                >
                                                    {sending ? 'COMMITTING...' : 'COMMIT_FEEDBACK_&_CLOSE'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">AWAITING_CUSTOMER_VERIFICATION</h4>
                                            <p className="text-[9px] text-muted-foreground font-mono uppercase mt-1">Status: REVIEW_PENDING | Auto-Sync enabled for +4 Ratings</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleSimulateCsat(2)} className="h-6 px-2 border-red-900/50 text-red-500 bg-red-500/5 text-[9px] uppercase font-bold tracking-wider">
                                                DEBUG:REJECT(2)
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleSimulateCsat(5)} className="h-6 px-2 border-emerald-900/50 text-emerald-500 bg-emerald-500/5 text-[9px] uppercase font-bold tracking-wider">
                                                DEBUG:APPROVE(5)
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
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">AI_SUMMARY_LOG</span>
                                    <button onClick={() => setSummary(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <p className="text-[11px] leading-relaxed text-foreground/90 font-medium italic">"{summary}"</p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col">
                        <ScrollArea className="flex-1 p-4 h-[550px]">
                            <div className="space-y-6">
                                {/* Initial Description as first message */}
                                <div className="flex gap-3 group">
                                    <div className="h-8 w-8 bg-muted flex items-center justify-center border border-border text-[10px] font-bold uppercase">
                                        {ticket.creator?.fullName?.[0] || 'OP'}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[11px] font-mono font-bold uppercase tracking-tight">{ticket.creator?.fullName || 'EXTERNAL_AGENT'}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-mono">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: tr })}</span>
                                        </div>
                                        <div className="bg-muted/30 border border-border/50 p-3 text-[12px] leading-relaxed tracking-tight text-foreground font-medium">
                                            {ticket.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Thread */}
                                {ticket.messages.map((msg: any) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-8 w-8 flex items-center justify-center border text-[10px] font-bold uppercase ${msg.senderId === user?.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border'}`}>
                                            {msg.sender?.fullName?.[0] || '??'}
                                        </div>
                                        <div className={`flex-1 space-y-1 ${msg.senderId === user?.id ? 'items-end flex flex-col' : ''}`}>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[11px] font-mono font-bold uppercase tracking-tight">{msg.sender?.fullName || 'SYSTEM'}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase font-mono">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}</span>
                                            </div>
                                            <div className={`p-3 text-[12px] leading-relaxed tracking-tight font-medium ${msg.senderId === user?.id
                                                ? 'bg-primary/90 text-primary-foreground border border-primary'
                                                : 'bg-muted/30 border border-border/50'
                                                }`}>
                                                {msg.message}

                                                {/* Attachments for this message */}
                                                {msg.attachments?.length > 0 && (
                                                    <div className="mt-3 pt-2 border-t border-border/20 space-y-1">
                                                        {msg.attachments.map((file: any) => (
                                                            <a
                                                                key={file.id}
                                                                href={`${api.getBaseUrl()}/attachments/${file.id}/download`}
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
                                ))}

                                {/* Typing Indicator */}
                                {someoneTyping && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 bg-muted border border-border flex items-center justify-center text-[10px] animate-pulse">...</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="p-3 w-12 bg-muted/30 border border-border/50">
                                                <span className="flex gap-1 justify-center">
                                                    <span className="h-1 w-1 bg-muted-foreground animate-bounce" />
                                                    <span className="h-1 w-1 bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                                                    <span className="h-1 w-1 bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-border/50 bg-muted/10 flex flex-col gap-3">
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
                            <label className="mb-1.5 cursor-pointer text-muted-foreground hover:text-primary transition-none">
                                <Paperclip className="h-4 w-4" />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center mr-1">
                                    <MacroPicker onSelect={(content: string) => setReply((prev) => prev ? `${prev}\n${content}` : content)} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">COMMS_CHANNEL [ENCRYPTED]</span>
                                </div>
                                <Textarea
                                    placeholder="TRANSMIT_MESSAGE..."
                                    className="bg-black/30 border-border/50 focus-visible:ring-primary h-20 text-[12px] p-2 rounded-none resize-none uppercase tracking-tight font-medium"
                                    value={reply}
                                    onChange={handleTypingChange}
                                />
                            </div>
                            <Button
                                onClick={handleSendReply}
                                disabled={sending || (!reply.trim() && files.length === 0)}
                                className="mb-0 bg-primary hover:bg-primary/90 rounded-none h-20 w-12 border-l border-primary/50"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Send className="h-5 w-5 text-primary-foreground" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-4">
                <Card className="border-border/60">
                    <CardHeader className="py-2 bg-muted/10">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">INCIDENT_METADATA</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 py-4">
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">STATE</label>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-primary animate-pulse" />
                                <span className="text-[12px] font-bold uppercase tracking-tight text-foreground">{ticket.status}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">CRITICALITY</label>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">OPENED_AT</label>
                            <p className="text-[11px] font-mono font-medium text-foreground">{new Date(ticket.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, '')}</p>
                        </div>
                        {ticket.assignee && (
                            <div className="space-y-1 pt-3 border-t border-border/20">
                                <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-[0.1em]">ASSIGNED_OFFICER</label>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 bg-muted border border-border flex items-center justify-center text-[8px] font-bold">
                                        {ticket.assignee?.fullName?.[0] || 'AX'}
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-tight">{ticket.assignee?.fullName || 'UNASSIGNED'}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Notice */}
                <div className="bg-primary/5 border border-primary/20 p-3 space-y-2">
                    <h4 className="text-[9px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-[0.2em]">
                        <Shield className="h-3 w-3" /> SECURITY_NOTICE
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-tight tracking-tight">
                        OPERATIONAL_SECURITY_MANDATORY. NEVER DISCLOSE ACCESS_CREDENTIALS OR SYSTEM_PRIVILEGES. SCRUB SENSITIVE_DATA FROM TRANSMISSIONS.
                    </p>
                </div>
            </div>
        </div>
    );
}
