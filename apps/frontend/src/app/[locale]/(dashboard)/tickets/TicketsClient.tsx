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
    TrendingUp,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/auth/role-guard';

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

interface TicketsClientProps {
    initialTickets: any[];
    initialTotal: number;
}

export default function TicketsClient({ initialTickets, initialTotal }: TicketsClientProps) {
    const t = useTranslations('tickets');
    const tc = useTranslations('common');
    const pt = useTranslations('profile');
    const locale = useLocale();
    const [tickets, setTickets] = useState<any[]>(initialTickets);
    const [total, setTotal] = useState(initialTotal);
    const [loading, setLoading] = useState(initialTickets.length === 0);
    const [filter, setFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const { user } = useAuth();

    const isAdmin = (() => {
        const userRole = user?.role;
        const r = typeof userRole === 'object' && userRole !== null ? (userRole as { name?: string }).name : userRole || (user?.roles && user.roles[0]);
        const roleStr = (typeof r === 'string' ? r : '').toUpperCase();
        return roleStr === 'ADMIN' || roleStr === 'DEPARTMENT_MANAGER' || roleStr === 'TEAM_LEAD' || roleStr === 'SENIOR_AGENT';
    })();

    // Auto-load tickets on mount when no initial data was provided
    useEffect(() => {
        if (initialTickets.length === 0) {
            load();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const load = async (statusFilter?: string) => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.tickets.list(params);
            setTickets(res.data ?? []);
            setTotal(res.total ?? 0);
        } catch { /* handled */ }
        setLoading(false);
    };

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
            toast.success(t('bulk.success', { count: selectedIds.length }));
            setSelectedIds([]);
            load(filter);
        } catch (err: any) {
            toast.error(t('bulk.error', { message: err.message }));
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(t('bulk.delete_confirm', { count: selectedIds.length }) || `Are you sure?`)) return;
        setBulkLoading(true);
        try {
            await api.tickets.bulkDelete(selectedIds);
            toast.success(t('bulk.delete_success', { count: selectedIds.length }) || `${selectedIds.length} tickets deleted.`);
            setSelectedIds([]);
            load(filter);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setBulkLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string, number: string) => {
        e.stopPropagation();
        if (!confirm(t('delete_confirm_desc'))) return;
        try {
            await api.tickets.delete(id);
            toast.success(t('delete_success', { number }) || `Ticket #${number} deleted.`);
            load(filter);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilter(value);
        load(value);
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
                        {t('title')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => window.location.href = `/${locale}/tickets/new`}
                        data-testid="create-ticket-button"
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        <Ticket className="w-3.5 h-3.5 mr-2" />
                        {t('new_ticket')}
                    </Button>

                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <select
                            value={filter}
                            onChange={handleFilterChange}
                            className="pl-9 pr-8 h-9 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:bg-white/10"
                        >
                            <option value="" className="bg-slate-900">{t('filters.all')}</option>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <option key={s} value={s} className="bg-slate-900">{t(`status.${s}`)}</option>
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
                            {t(`status.${status}`)}
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
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">{t('bulk.selected')}</span>
                                <span className="text-2xl font-black font-mono leading-none text-white">{selectedIds.length.toString().padStart(2, '0')}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => handleBulkAction('IN_PROGRESS')}
                                    disabled={bulkLoading}
                                    className="h-10 px-5 bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-amber-500/10 hover:border-amber-500/30 transition-all"
                                >
                                    {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4 text-amber-500 mr-2" />}
                                    {t('bulk.start_process')}
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('RESOLVED')}
                                    disabled={bulkLoading}
                                    className="h-10 px-5 bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                                    {t('bulk.resolve_all')}
                                </Button>
                                <Button
                                    onClick={handleBulkDelete}
                                    disabled={bulkLoading}
                                    className="h-10 px-5 bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 transition-all"
                                >
                                    <Trash2 className="h-4 w-4 text-rose-500 mr-2" />
                                    {t('bulk.delete_selected') || 'Delete Selected'}
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
                        <div className="p-20 text-center bg-white/[0.01] min-w-[1000px]">
                            <Loader2 className="inline-block h-8 w-8 text-primary animate-spin" />
                            <p className="text-[10px] font-bold mt-4 text-muted-foreground uppercase tracking-[0.3em] opacity-40">{t('table.loading')}</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center min-w-[1000px] opacity-30">
                            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t('table.empty')}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left min-w-[1000px]">
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
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{t('table.header.system_id')}</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{t('table.header.company')}</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{t('table.header.customer')}</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{t('table.header.subject')}</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">{t('table.header.status')}</th>
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-center">{t('table.header.priority')}</th>
                                    <th className="px-6 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-right">{t('table.header.timestamp')}</th>
                                    {isAdmin && <th className="px-6 w-12"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tickets.map((ticket) => {
                                    const isSelected = selectedIds.includes(ticket.id);
                                    return (
                                        <tr
                                            key={ticket.id}
                                            className={`hover:bg-white/[0.03] transition-all cursor-pointer group h-14 ${isSelected ? 'bg-primary/5' : ''}`}
                                            onClick={() => window.location.href = `/${locale}/tickets/${ticket.id}`}
                                        >
                                            <td className="px-6">
                                                <button
                                                    onClick={(e) => toggleSelect(e, ticket.id)}
                                                    className={`transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                                                >
                                                    {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 opacity-10 group-hover:opacity-100" />}
                                                </button>
                                            </td>
                                            <td className="px-4 border-r border-white/5">
                                                <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-white/50 group-hover:text-white transition-colors">
                                                    {(() => {
                                                        const Icon = CHANNEL_ICONS[ticket.channel] || Globe;
                                                        return <Icon className={`h-3.5 w-3.5 ${CHANNEL_COLORS[ticket.channel] || 'text-muted-foreground'}`} />;
                                                    })()}
                                                    #{ticket.ticketNumber}
                                                </div>
                                            </td>
                                            <td className="px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-bold text-slate-300">
                                                        {ticket.creator?.customerProfile?.companyName || tc('individual')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[12px] font-medium text-white">
                                                            {ticket.creator?.fullName || tc('unknown')}
                                                        </span>
                                                        {ticket.creator?.customerProfile?.contractStatus && (
                                                            <Badge variant="outline" className="text-[8px] font-bold tracking-widest bg-white/5 text-slate-400 border-white/10 uppercase px-1.5 py-0">
                                                                {(() => {
                                                                    const status = ticket.creator.customerProfile.contractStatus;
                                                                    return pt.has(`contract_status.${status}`) ? pt(`contract_status.${status}`) : status;
                                                                })()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[13px] font-bold text-white group-hover:text-primary transition-colors tracking-tight">
                                                        {ticket.subject}
                                                    </span>
                                                    {ticket.knowledgeBaseAdded && (
                                                        <Badge variant="outline" className="text-[8px] font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
                                                            {t('table.badges.kb_sync')}
                                                        </Badge>
                                                    )}
                                                    {ticket.isSlaBreached && (
                                                        <Badge variant="destructive" className="text-[8px] font-bold tracking-widest animate-pulse">
                                                            {t('table.badges.sla_vio')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 text-center">
                                                <Badge className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border-none ${STATUS_COLORS[ticket.status] ?? 'bg-muted text-muted'}`}>
                                                    {t(`status.${ticket.status}`)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className={`text-[10px] font-black uppercase italic tracking-tighter ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                                                        {t(`priority.${ticket.priority}`)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 text-right font-mono text-[11px] text-muted-foreground group-hover:text-white transition-colors">
                                                {new Date(ticket.createdAt).toLocaleDateString(locale)} {new Date(ticket.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleDelete(e, ticket.id, ticket.ticketNumber)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            )}
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
