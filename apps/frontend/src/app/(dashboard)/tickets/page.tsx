'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Ticket,
    Clock,
    AlertCircle,
    CheckCircle2,
    Filter,
    ChevronDown,
    Check,
    Square,
    CheckSquare,
    Loader2,
    X,
    MessageCircle,
    Mail,
    Globe,
    Cpu,
    User,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    OPEN: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PENDING_CUSTOMER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    PENDING_CUSTOMER_REVIEW: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'text-slate-500',
    MEDIUM: 'text-amber-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-600',
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

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (filter) params.status = filter;
            const res = await api.tickets.list(params);
            setTickets(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch { /* handled */ }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [filter]);

    const toggleSelect = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === tickets.length && tickets.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(tickets.map(t => t.id));
        }
    };

    const handleBulkAction = async (status: string) => {
        setBulkLoading(true);
        try {
            await api.tickets.bulkUpdate({ ticketIds: selectedIds, status });
            toast.success(`SİSTEM_KOMUTU_BAŞARILI: ${selectedIds.length}_KAYIT_GÜNCELLENDİ`);
            setSelectedIds([]);
            load();
        } catch (err: any) {
            toast.error(`SİSTEM_KOMUTU_HATASI: ${err.message}`);
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 relative min-h-screen pb-24"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Ticket className="h-6 w-6 text-primary" />
                        </div>
                        Talep Yönetimi
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        Aktif destek talepleri ve SLA performans takibi
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-8 h-9 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:bg-white/10"
                        >
                            <option value="" className="bg-slate-900">Tüm Talepler</option>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <option key={s} value={s} className="bg-slate-900">{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Performance/Status Bar */}
            <div className="flex gap-4 pb-2 overflow-x-auto no-scrollbar">
                {Object.entries(STATUS_COLORS).slice(0, 5).map(([status, style]) => (
                    <div key={status} className="flex flex-col min-w-[140px] bg-white/[0.02] border border-white/5 p-3 rounded-xl backdrop-blur-sm group hover:border-emerald-500/20 transition-all">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                            {status.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-bold font-mono text-white">--</span>
                            <div className="flex items-center text-[10px] text-emerald-500 font-bold">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                0%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bulk Action Bar (Floating) */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-slate-900/90 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] px-8 py-4 flex items-center gap-8 backdrop-blur-2xl rounded-2xl">
                            <div className="flex flex-col border-r border-white/10 pr-8">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Seçili_Talepler</span>
                                <span className="text-2xl font-black font-mono leading-none text-white">{selectedIds.length.toString().padStart(2, '0')}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => handleBulkAction('IN_PROGRESS')}
                                    disabled={bulkLoading}
                                    className="h-10 px-5 bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-amber-500/10 hover:border-amber-500/30 transition-all"
                                >
                                    {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4 text-amber-500 mr-2" />}
                                    Süreci_Başlat
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('RESOLVED')}
                                    disabled={bulkLoading}
                                    className="h-10 px-5 bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                                    Hepsini_Çöz
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedIds([])}
                                    className="h-10 w-10 p-0 hover:bg-rose-500/10 hover:text-rose-500 ml-4 border border-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Operational Table */}
            <Card className="glass-card overflow-hidden border-white/5">
                <div className="overflow-x-auto scrollbar-thin">
                    {loading ? (
                        <div className="p-20 text-center bg-white/[0.01] min-w-[800px]">
                            <Loader2 className="inline-block h-8 w-8 text-primary animate-spin" />
                            <p className="text-[10px] font-bold mt-4 text-muted-foreground uppercase tracking-[0.3em] opacity-40">Veri_Protokolü_Bekleniyor</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center min-w-[800px] opacity-30">
                            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Kuyruk_Boş</p>
                        </div>
                    ) : (
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.03] h-12">
                                    <th className="px-6 w-12">
                                        <button onClick={toggleSelectAll} className="hover:text-primary transition-colors">
                                            {selectedIds.length === tickets.length && tickets.length > 0 ?
                                                <CheckSquare className="h-4 w-4 text-primary" /> :
                                                <Square className="h-4 w-4 text-muted-foreground/30" />
                                            }
                                        </button>
                                    </th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Sistem_ID</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Olay_Tanımı</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">Durum</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">Kritiklik</th>
                                    <th className="px-6 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-right">Zaman_Damgası</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tickets.map((t) => {
                                    const isSelected = selectedIds.includes(t.id);
                                    return (
                                        <tr
                                            key={t.id}
                                            className={`hover:bg-white/[0.03] transition-all cursor-pointer group h-14 ${isSelected ? 'bg-primary/5' : ''}`}
                                            onClick={() => window.location.href = `/tickets/${t.id}`}
                                        >
                                            <td className="px-6">
                                                <button
                                                    onClick={(e) => toggleSelect(e, t.id)}
                                                    className={`transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                                                >
                                                    {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 opacity-10 group-hover:opacity-100" />}
                                                </button>
                                            </td>
                                            <td className="px-4 border-r border-white/5">
                                                <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-white/50 group-hover:text-white transition-colors">
                                                    {(() => {
                                                        const Icon = CHANNEL_ICONS[t.channel] || Globe;
                                                        return <Icon className={`h-3.5 w-3.5 ${CHANNEL_COLORS[t.channel] || 'text-muted-foreground'}`} />;
                                                    })()}
                                                    #{t.ticketNumber}
                                                </div>
                                            </td>
                                            <td className="px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors tracking-tight">
                                                        {t.subject}
                                                    </span>
                                                    {t.knowledgeBaseAdded && (
                                                        <Badge variant="outline" className="text-[8px] font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
                                                            KB_SYNC
                                                        </Badge>
                                                    )}
                                                    {t.isSlaBreached && (
                                                        <Badge variant="destructive" className="text-[8px] font-bold tracking-widest animate-pulse">
                                                            SLA_VIO
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 text-center">
                                                <Badge className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border-none ${STATUS_COLORS[t.status] ?? 'bg-muted text-muted'}`}>
                                                    {t.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className={`text-[10px] font-black uppercase italic tracking-tighter ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                                                        {t.priority}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 text-right font-mono text-[11px] text-muted-foreground group-hover:text-white transition-colors">
                                                {new Date(t.createdAt).toLocaleDateString('tr-TR')} {new Date(t.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
