'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import {
    Ticket,
    Clock,
    AlertCircle,
    CheckCircle2,
    Search,
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
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/auth/role-guard';
import { useSearchParams } from 'next/navigation';
import { getTicketQueueDeepLink } from '@/components/review-center/deep-link-filters';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
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

type TicketScope = 'mine' | 'all';
type StatusCounts = Record<string, number>;

const STATUS_ORDER = Object.keys(STATUS_COLORS);

export default function TicketsClient({ initialTickets, initialTotal }: TicketsClientProps) {
    const t = useTranslations('tickets');
    const tc = useTranslations('common');
    const pt = useTranslations('profile');
    const locale = useLocale();
    const [tickets, setTickets] = useState<any[]>(initialTickets);
    const [total, setTotal] = useState(initialTotal);
    const [loading, setLoading] = useState(initialTickets.length === 0);
    const [loadError, setLoadError] = useState(false);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const queueDeepLink = getTicketQueueDeepLink(searchParams);
    const [scope, setScope] = useState<TicketScope>('all');
    const didInitializeQueueRef = useRef(false);
    const loadRequestIdRef = useRef(0);
    const queueKey = `${queueDeepLink.chatStatus ?? ''}|${queueDeepLink.assignment ?? ''}|${queueDeepLink.activeOnly ? 'active' : ''}`;
    const previousQueueKeyRef = useRef(queueKey);

    const userRole = user?.role;
    const r = typeof userRole === 'object' && userRole !== null ? (userRole as { name?: string }).name : userRole || (user?.roles && user.roles[0]);
    const roleStr = (typeof r === 'string' ? r : '').toUpperCase();
    const isCustomer = roleStr === 'CUSTOMER' || roleStr === 'VIEWER';
    const isAdmin = roleStr === 'ADMIN' || roleStr === 'DEPARTMENT_MANAGER' || roleStr === 'TEAM_LEAD' || roleStr === 'SENIOR_AGENT';
    const canScopeTickets = Boolean(user && !isCustomer);

    const load = useCallback(async (
        statusFilter: string = filter,
        scopeFilter: TicketScope = scope,
        searchFilter: string = search,
    ) => {
        const requestId = ++loadRequestIdRef.current;
        setLoading(true);
        setLoadError(false);
        try {
            const params: Record<string, string> = { limit: '100', includeStatusCounts: 'true' };
            if (statusFilter) params.status = statusFilter;
            if (searchFilter.trim()) params.search = searchFilter.trim();
            if (queueDeepLink.chatStatus) params.chatStatus = queueDeepLink.chatStatus;
            if (queueDeepLink.assignment) params.assignment = queueDeepLink.assignment;
            if (queueDeepLink.activeOnly) params.activeOnly = 'true';
            if (scopeFilter === 'mine' && user?.id && !isCustomer) {
                params.assignedTo = user.id;
            }
            const res = await api.tickets.list(params);
            if (requestId !== loadRequestIdRef.current) return;
            setTickets(res.data ?? []);
            setTotal(res.total ?? 0);
            setStatusCounts(res.statusCounts ?? null);
        } catch {
            if (requestId !== loadRequestIdRef.current) return;
            setLoadError(true);
        } finally {
            if (requestId === loadRequestIdRef.current) {
                setLoading(false);
            }
        }
    }, [filter, isCustomer, queueDeepLink.activeOnly, queueDeepLink.assignment, queueDeepLink.chatStatus, scope, search, user?.id]);

    // Auto-load tickets after the authenticated user is known.
    // Support team members should land directly on their own operational queue.
    useEffect(() => {
        const queueChanged = previousQueueKeyRef.current !== queueKey;
        previousQueueKeyRef.current = queueKey;
        if (!user) return;
        if (!queueChanged && (initialTickets.length > 0 || didInitializeQueueRef.current)) return;

        const initialScope: TicketScope = queueDeepLink.assignment || queueDeepLink.chatStatus
            ? 'all'
            : user.isSupportTeamMember ? 'mine' : 'all';
        didInitializeQueueRef.current = true;
        setScope(initialScope);
        load(filter, initialScope, search);
    }, [filter, initialTickets.length, load, queueDeepLink.assignment, queueDeepLink.chatStatus, queueKey, search, user]);

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
            load(filter, scope, search);
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
            load(filter, scope, search);
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
            load(filter, scope, search);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleStatusChange = (value: string) => {
        setFilter(value);
        setSelectedIds([]);
        load(value, scope, search);
    };

    const handleScopeChange = (nextScope: TicketScope) => {
        setScope(nextScope);
        setSelectedIds([]);
        load(filter, nextScope, search);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSelectedIds([]);
        load(filter, scope, search);
    };

    const clearSearch = () => {
        setSearch('');
        setSelectedIds([]);
        load(filter, scope, '');
    };

    const allStatusCount = statusCounts ? STATUS_ORDER.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0) : null;
    const formatStatusCount = (status: string) => statusCounts ? String(statusCounts[status] ?? 0) : null;
    const activeScopeLabel = scope === 'mine' ? t('filters.mine') : t('filters.all');
    const activeStatusLabel = filter ? t(`status.${filter}`) : t('filters.all_statuses');

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

                <div className="flex items-center gap-3 flex-wrap justify-end">
                    {canScopeTickets && (
                        <div className="inline-flex h-9 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                            <button
                                type="button"
                                onClick={() => handleScopeChange('mine')}
                                className={`px-3 text-[10px] font-bold uppercase tracking-widest transition-all ${scope === 'mine' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                            >
                                {t('filters.mine')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleScopeChange('all')}
                                className={`px-3 text-[10px] font-bold uppercase tracking-widest transition-all ${scope === 'all' ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                            >
                                {t('filters.all')}
                            </button>
                        </div>
                    )}

                    <form
                        onSubmit={handleSearchSubmit}
                        className="relative group w-full sm:w-[280px]"
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-9 h-9 bg-white/5 border border-white/10 rounded-lg text-[12px] font-medium text-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-white/10"
                            placeholder={t('filters.search_placeholder')}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                aria-label={t('filters.clear_search')}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </form>

                    <Button
                        onClick={() => window.location.href = `/${locale}/tickets/new`}
                        data-testid="create-ticket-button"
                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-black text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        <Ticket className="w-3.5 h-3.5 mr-2" />
                        {t('new_ticket')}
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-3">
                <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => handleStatusChange('')}
                        className={`h-9 shrink-0 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-widest transition-all ${filter === '' ? 'border-primary/50 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-white'}`}
                    >
                        {t('filters.all_statuses')}
                        {allStatusCount !== null && <span className="ml-2 font-mono text-white/80">{allStatusCount}</span>}
                    </button>
                    {STATUS_ORDER.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(status)}
                            className={`h-9 shrink-0 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-widest transition-all ${filter === status ? 'border-primary/50 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-white'}`}
                        >
                            {t(`status.${status}`)}
                            {formatStatusCount(status) !== null && <span className="ml-2 font-mono text-white/80">{formatStatusCount(status)}</span>}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    {t('filters.summary', { scope: activeScopeLabel, status: activeStatusLabel })}
                </div>
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
                    ) : loadError ? (
                        <div role="alert" className="p-20 text-center min-w-[1000px]">
                            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
                            <p className="text-[11px] font-bold text-rose-300 uppercase tracking-[0.2em]">
                                {t('table.load_error')}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => load(filter, scope, search)}
                                className="mt-5 border-rose-400/30 text-rose-200 hover:bg-rose-500/10"
                            >
                                {t('table.retry')}
                            </Button>
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
                                    <th className="px-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{t('table.header.assignee')}</th>
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
                                            <td className="px-4">
                                                <div className="flex items-center gap-2 text-[12px] text-slate-300">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-medium">{ticket.assignee?.fullName || t('filters.unassigned')}</span>
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
