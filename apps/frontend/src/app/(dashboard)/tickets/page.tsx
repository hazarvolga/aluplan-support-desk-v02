'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Ticket, Clock, AlertCircle, CheckCircle2, Filter } from 'lucide-react';

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

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
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
        load();
    }, [filter]);

    return (
        <div className="space-y-4">
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

            {/* Performance/Status Bar (Added for Operational Feel) */}
            <div className="flex gap-4 border-b border-border/20 pb-2 overflow-x-auto no-scrollbar">
                {Object.entries(STATUS_COLORS).slice(0, 4).map(([status, color]) => (
                    <div key={status} className="flex flex-col min-w-[120px] bg-muted/10 border-l border-border p-1.5">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{status}</span>
                        <span className="text-lg font-mono leading-none mt-1">--</span>
                    </div>
                ))}
            </div>

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
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">IDX</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Subject_Event</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status_Flag</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Level</th>
                                <th className="px-3 font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {tickets.map((t) => (
                                <tr
                                    key={t.id}
                                    className="hover:bg-muted/30 transition-none cursor-pointer group h-10"
                                    onClick={() => window.location.href = `/tickets/${t.id}`}
                                >
                                    <td className="px-3 font-mono text-[11px] text-muted-foreground border-r border-border/10">
                                        [{t.ticketNumber}]
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
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
