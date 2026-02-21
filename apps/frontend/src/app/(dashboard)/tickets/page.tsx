'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Ticket, Clock, AlertCircle, CheckCircle2, Filter, ChevronDown, Check, Square, CheckSquare, Loader2, X, MessageCircle, Mail, Globe, Cpu } from 'lucide-react';
import { toast } from 'sonner';

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
    LOW: 'text-slate-500', MEDIUM: 'text-amber-500', HIGH: 'text-orange-500', URGENT: 'text-red-600',
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
            toast.success(`SYSTEM_COMMAND_SUCCESS: UPDATED_${selectedIds.length}_RECORDS`);
            setSelectedIds([]);
            load();
        } catch (err: any) {
            toast.error(`SYSTEM_COMMAND_ERROR: ${err.message}`);
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div className="space-y-4 relative min-h-screen pb-24">
            {/* System Queue Header */}
            <div className="flex items-end justify-between border-b border-border/50 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-emerald-500 animate-pulse" />
                        <h1 className="text-[14px] font-bold text-foreground tracking-widest uppercase">Incident_Queue</h1>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                        ACTIVE_TICKETS_COUNT: <span className="text-foreground">{total.toString().padStart(4, '0')}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-7 pr-3 h-7 bg-muted/30 border border-border text-[11px] font-bold uppercase tracking-tight text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-none appearance-none cursor-pointer"
                        >
                            <option value="">ALL_SYSTEM_STATES</option>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <option key={s} value={s}>{s}_STATUS</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Performance/Status Bar */}
            <div className="flex gap-4 border-b border-border/20 pb-2 overflow-x-auto no-scrollbar">
                {Object.entries(STATUS_COLORS).slice(0, 4).map(([status, color]) => (
                    <div key={status} className="flex flex-col min-w-[120px] bg-muted/10 border-l border-border p-1.5">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{status}</span>
                        <span className="text-lg font-mono leading-none mt-1">--</span>
                    </div>
                ))}
            </div>

            {/* Bulk Action Bar (Floating) */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-background border-2 border-primary/50 shadow-2xl px-6 py-3 flex items-center gap-6 backdrop-blur-xl">
                        <div className="flex flex-col border-r border-border/50 pr-6">
                            <span className="text-[10px] font-mono font-bold text-primary uppercase">Selected_Incidents</span>
                            <span className="text-xl font-black font-mono leading-none">{selectedIds.length.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkAction('IN_PROGRESS')}
                                disabled={bulkLoading}
                                className="h-8 px-3 bg-muted/30 border border-border text-[10px] font-bold uppercase hover:bg-amber-500/10 hover:border-amber-500/50 transition-colors flex items-center gap-2"
                            >
                                {bulkLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3 text-amber-500" />}
                                Start_Progress
                            </button>
                            <button
                                onClick={() => handleBulkAction('RESOLVED')}
                                disabled={bulkLoading}
                                className="h-8 px-3 bg-muted/30 border border-border text-[10px] font-bold uppercase hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                Resolve_All
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="h-8 w-8 flex items-center justify-center bg-muted/30 border border-border hover:bg-red-500/10 hover:text-red-500 transition-colors ml-4"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Operational Table */}
            <div className="bg-card border border-border overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center bg-muted/5">
                        <div className="inline-block h-6 w-6 border-b-2 border-primary animate-spin" />
                        <p className="text-[10px] font-mono mt-3 text-muted-foreground uppercase tracking-widest">Awaiting_Data_Stream...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <Ticket className="h-8 w-8 text-muted/30 mx-auto mb-3" />
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">No_Incidents_Found</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/20 h-8">
                                <th className="px-3 w-8">
                                    <button onClick={toggleSelectAll} className="hover:text-primary transition-colors">
                                        {selectedIds.length === tickets.length && tickets.length > 0 ?
                                            <CheckSquare className="h-3.5 w-3.5 text-primary" /> :
                                            <Square className="h-3.5 w-3.5 text-muted-foreground" />
                                        }
                                    </button>
                                </th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">IDX</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Subject_Event</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status_Flag</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Level</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {tickets.map((t) => {
                                const isSelected = selectedIds.includes(t.id);
                                return (
                                    <tr
                                        key={t.id}
                                        className={`hover:bg-muted/30 transition-none cursor-pointer group h-10 ${isSelected ? 'bg-primary/5' : ''}`}
                                        onClick={() => window.location.href = `/tickets/${t.id}`}
                                    >
                                        <td className="px-3">
                                            <button
                                                onClick={(e) => toggleSelect(e, t.id)}
                                                className={`transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                                            >
                                                {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 opacity-30 group-hover:opacity-100" />}
                                            </button>
                                        </td>
                                        <td className="px-3 font-mono text-[11px] text-muted-foreground border-r border-border/10">
                                            <div className="flex items-center gap-1.5">
                                                {(() => {
                                                    const Icon = CHANNEL_ICONS[t.channel] || Globe;
                                                    return <Icon className={`h-3 w-3 ${CHANNEL_COLORS[t.channel] || 'text-muted-foreground'}`} />;
                                                })()}
                                                [{t.ticketNumber}]
                                            </div>
                                        </td>
                                        <td className="px-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-bold text-foreground group-hover:text-primary tracking-tight">
                                                    {t.subject.toUpperCase()}
                                                </span>
                                                {t.knowledgeBaseAdded && (
                                                    <span className="px-1 border border-primary/30 bg-primary/5 text-primary text-[8px] font-bold tracking-[0.2em] uppercase">
                                                        KB_SYNCED
                                                    </span>
                                                )}
                                                {t.isSlaBreached && (
                                                    <span className="px-1 bg-red-500/10 border border-red-500/50 text-red-500 text-[8px] font-bold tracking-[0.2em] uppercase animate-pulse">
                                                        SLA_BREACH
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3">
                                            <span className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${STATUS_COLORS[t.status] ?? 'border-muted text-muted'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-3">
                                            <span className={`text-[10px] font-black uppercase italic ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="px-3 text-right font-mono text-[10px] text-muted-foreground group-hover:text-foreground">
                                            {new Date(t.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, '')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
