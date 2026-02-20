'use client';

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import {
    Ticket, Clock, Shield, User as UserIcon, Send,
    Paperclip, Download, MoreVertical, CheckCircle2,
    AlertTriangle, MessageSquare, Loader2, Bot
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
    NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    OPEN: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PENDING_CUSTOMER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'text-slate-500', MEDIUM: 'text-amber-500', HIGH: 'text-orange-500', URGENT: 'text-red-600',
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

    useEffect(() => {
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
        load();
    }, [id]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto py-2">
            {/* Main Conversation Column */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/30 backdrop-blur-xl border-white/5 overflow-hidden flex flex-col min-h-[600px]">
                    <CardHeader className="border-b border-white/5 bg-slate-900/50 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="font-mono text-xs opacity-50 bg-white/5 px-2 py-1 rounded">#{ticket.ticketNumber}</span>
                                    {ticket.subject}
                                </CardTitle>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="h-3 w-3" />
                                        {ticket.creator?.fullName || (ticket.userId ? 'Silinmiş Kullanıcı' : 'Dış Kaynak/E-posta')}
                                    </span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleString('tr-TR')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isCustomer && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSummarize}
                                        disabled={summarizing}
                                        className="h-8 border-violet-500/20 text-violet-400 hover:bg-violet-500/10 gap-1.5"
                                    >
                                        <Bot className={`h-3.5 w-3.5 ${summarizing ? 'animate-pulse' : ''}`} />
                                        {summarizing ? 'Özetleniyor...' : 'AI Özet'}
                                    </Button>
                                )}
                                <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                            </div>
                        </div>

                        {summary && (
                            <div className="mt-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot className="h-4 w-4 text-violet-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/80">Yapay Zeka Özeti</span>
                                    <button onClick={() => setSummary(null)} className="ml-auto text-muted-foreground hover:text-white transition-colors">
                                        <Clock className="h-3 w-3 rotate-45" />
                                    </button>
                                </div>
                                <p className="text-xs leading-relaxed text-slate-300 italic">"{summary}"</p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col">
                        <ScrollArea className="flex-1 p-6 h-[500px]">
                            <div className="space-y-8">
                                {/* Initial Description as first message */}
                                <div className="flex gap-4 group">
                                    <Avatar className="h-10 w-10 border border-brand-500/20">
                                        <AvatarImage src={ticket.creator?.avatarUrl} />
                                        <AvatarFallback className="bg-brand-500/10 text-brand-500">
                                            {ticket.creator?.fullName?.[0] || 'E'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm font-semibold">{ticket.creator?.fullName || (ticket.userId ? 'Silinmiş Kullanıcı' : 'Dış Kaynak/E-posta')}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: tr })}</span>
                                        </div>
                                        <div className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                                            {ticket.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Thread */}
                                {ticket.messages.map((msg: any) => (
                                    <div key={msg.id} className={`flex gap-4 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={msg.sender?.avatarUrl} />
                                            <AvatarFallback className="bg-slate-800 text-xs">{msg.sender?.fullName?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className={`flex-1 space-y-2 ${msg.senderId === user?.id ? 'items-end flex flex-col' : ''}`}>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-semibold">{msg.sender?.fullName || 'Sistem'}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.senderId === user?.id
                                                ? 'bg-brand-600/90 text-white rounded-tr-none'
                                                : 'bg-slate-800/40 border border-white/5 rounded-tl-none'
                                                }`}>
                                                {msg.message}

                                                {/* Attachments for this message */}
                                                {msg.attachments?.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                                                        {msg.attachments.map((file: any) => (
                                                            <a
                                                                key={file.id}
                                                                href={`${api.getBaseUrl()}/attachments/${file.id}/download`}
                                                                target="_blank"
                                                                className="flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/40 transition-colors text-xs"
                                                            >
                                                                <Paperclip className="h-3 w-3 opacity-60" />
                                                                <span className="flex-1 truncate">{file.fileName}</span>
                                                                <Download className="h-3 w-3 opacity-60" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-white/5 bg-slate-900/30 flex flex-col gap-4">
                        {/* Selected Files Preview */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 w-full">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded text-[10px] border border-white/5">
                                        <span className="truncate max-w-[100px]">{f.name}</span>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}><Shield className="h-3 w-3 text-red-500 rotate-45" /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-3 w-full">
                            <label className="mb-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                                <Paperclip className="h-5 w-5" />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <div className="flex justify-between items-center gap-2 mb-2 w-full">
                                <MacroPicker onSelect={(content: string) => setReply((prev) => prev ? `${prev}\n${content}` : content)} />
                                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">Mesaj Yaz</div>
                            </div>
                            <Textarea
                                placeholder="Mesajınızı yazın..."
                                className="bg-slate-900 border-white/5 focus-visible:ring-brand-500 resize-none min-h-[100px]"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                            />
                            <Button
                                onClick={handleSendReply}
                                disabled={sending || (!reply.trim() && files.length === 0)}
                                className="mb-2 bg-brand-600 hover:bg-brand-700"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-6">
                <Card className="bg-card/30 backdrop-blur-xl border-white/5">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Talep Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Durum</label>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[ticket.status].split(' ')[0]}`} />
                                <span className="text-sm font-medium">{ticket.status}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Öncelik</label>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Oluşturuldu</label>
                            <p className="text-sm font-medium">{new Date(ticket.createdAt).toLocaleString('tr-TR')}</p>
                        </div>
                        {ticket.assignee && (
                            <div className="space-y-1 pt-2 border-t border-white/5">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sorumlu Uzman</label>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={ticket.assignee?.avatarUrl} />
                                        <AvatarFallback className="text-[8px]">{ticket.assignee?.fullName?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{ticket.assignee?.fullName || 'Atanmamış'}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Helpful Tip */}
                <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-brand-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Shield className="h-3 w-3" /> Güvenlik İpucu
                    </h4>
                    <p className="text-[11px] text-brand-200/70 leading-relaxed">
                        Destek ekibimiz sizden asla parolanızı veya kredi kartı bilgilerinizi istemez. Dosya paylaşırken hassas verileri kararttığınızdan emin olun.
                    </p>
                </div>
            </div>
        </div>
    );
}
