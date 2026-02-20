'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Ticket, Clock, AlertCircle, CheckCircle2, Filter } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    OPEN: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    PENDING_CUSTOMER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    PENDING_CUSTOMER_REVIEW: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Destek Talepleri</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Toplam {total} talep</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">Tüm Durumlar</option>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <Ticket className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">Gösterilecek talep yok</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-400">#</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-400">Konu</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-400">Durum</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-400">Öncelik</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-400">Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                    onClick={() => window.location.href = `/tickets/${t.id}`}
                                >
                                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{t.ticketNumber}</td>
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium max-w-xs truncate">
                                        <div className="flex items-center gap-2">
                                            <span>{t.subject}</span>
                                            {t.knowledgeBaseAdded && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                                                    🧠 KB Gönderildi
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status] ?? ''}`}>
                                            {t.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold text-xs ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                        {new Date(t.createdAt).toLocaleDateString('tr-TR')}
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
