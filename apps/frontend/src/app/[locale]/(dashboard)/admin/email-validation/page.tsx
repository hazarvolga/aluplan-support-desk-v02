'use client';

export const dynamic = "force-dynamic";

import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import {
    Search, Mail, ShieldCheck, ShieldAlert,
    ShieldQuestion, Globe, Server, CheckCircle2,
    XCircle, AlertCircle, Loader2, Info, Brain,
    Users, ArrowUpDown, Building2, Eye, Filter,
    Activity, ChevronRight, Hash, Tag, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerItem {
    id: string;
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    customerProfile: {
        customerNo: string;
        companyName: string;
        jobTitle?: string;
        industry?: string;
        tags?: string[];
        account?: {
            id: string;
            name: string;
        };
    };
}

type SortField = 'fullName' | 'companyName' | 'email' | 'status';
type SortOrder = 'asc' | 'desc';

export default function EmailValidationPage() {
    const t = useTranslations('admin.email_validation');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('single');

    // Customer List State (Ported from CustomersPage)
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('fullName');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [validatingBulk, setValidatingBulk] = useState(false);
    const [bulkResults, setBulkResults] = useState<Record<string, any>>({});
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Advanced Filtering State
    const [filterIndustry, setFilterIndustry] = useState<string>('all');
    const [filterTag, setFilterTag] = useState<string>('all');

    const industries = useMemo(() => {
        const unique = new Set(customers.map(c => c.customerProfile?.industry).filter(Boolean));
        return Array.from(unique) as string[];
    }, [customers]);

    const tags = useMemo(() => {
        const allTags = customers.flatMap(c => c.customerProfile?.tags || []);
        return Array.from(new Set(allTags));
    }, [customers]);

    const loadCustomers = () => {
        setCustomersLoading(true);
        api.customers
            .list()
            .then(setCustomers)
            .catch(console.error)
            .finally(() => setCustomersLoading(false));
    };

    useEffect(() => {
        if (activeTab === 'list') {
            loadCustomers();
        }
    }, [activeTab]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setResult(null);
        try {
            const data = await api.emailValidator.verify(email);
            setResult(data);
        } catch (err: any) {
            toast.error(err.message || t('toasts.verify_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleBulkVerify = async () => {
        const emailsToVerify = selectedIds.length > 0
            ? customers.filter(c => selectedIds.includes(c.id)).map(c => c.email)
            : filteredCustomers.map(c => c.email);

        if (emailsToVerify.length === 0) return;

        setValidatingBulk(true);
        try {
            const results = await api.emailValidator.verifyBulk(emailsToVerify);
            const resultMap = { ...bulkResults };
            results.forEach((r: any) => {
                resultMap[r.email] = r;
            });
            setBulkResults(resultMap);
            toast.success(t('toasts.verified_count', { count: emailsToVerify.length }));
        } catch (error: any) {
            toast.error(error.message || t('toasts.bulk_verify_error'));
        } finally {
            setValidatingBulk(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        let result = [...customers];

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.fullName.toLowerCase().includes(lowerTerm) ||
                c.email.toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.companyName || '').toLowerCase().includes(lowerTerm)
            );
        }

        // Industry (Group/Segment) Filter
        if (filterIndustry !== 'all') {
            result = result.filter(c => c.customerProfile?.industry === filterIndustry);
        }

        // Tag Filter
        if (filterTag !== 'all') {
            result = result.filter(c => c.customerProfile?.tags?.includes(filterTag));
        }

        result.sort((a, b) => {
            let aValue: string | number = '';
            let bValue: string | number = '';
            if (sortField === 'fullName') { aValue = a.fullName; bValue = b.fullName; }
            else if (sortField === 'email') { aValue = a.email; bValue = b.email; }
            else if (sortField === 'companyName') { aValue = a.customerProfile?.companyName || ''; bValue = b.customerProfile?.companyName || ''; }
            else if (sortField === 'status') {
                const aRes = bulkResults[a.email];
                const bRes = bulkResults[b.email];
                aValue = aRes?.summary?.score ?? -1;
                bValue = bRes?.summary?.score ?? -1;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return result;
    }, [customers, searchTerm, sortField, sortOrder, filterIndustry, filterTag, bulkResults]);

    const isAllSelected = filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filteredCustomers.map(c => c.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(prev => [...prev, id]);
        else setSelectedIds(prev => prev.filter(item => item !== id));
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortOrder('asc'); }
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortOrder === 'asc' ? <ArrowUpDown className="inline h-3 w-3 ml-1" /> : <ArrowUpDown className="inline h-3 w-3 ml-1 rotate-180" />;
    };

    const handleOpenDetail = (customer: CustomerItem) => {
        setSelectedCustomer(customer);
        setDetailDialogOpen(true);
    };

    const handleReverifySingle = async (email: string) => {
        setLoading(true);
        try {
            const data = await api.emailValidator.verify(email);
            setBulkResults(prev => ({ ...prev, [email]: data }));
            toast.success(t('toasts.reverified', { email: email }));
        } catch (err: any) {
            toast.error(err.message || t('toasts.verify_error'));
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreBg = (score?: number) => {
        if (typeof score !== 'number') return 'bg-white/5 border-white/10';
        if (score >= 80) return 'bg-emerald-400/10 border-emerald-400/20';
        if (score >= 50) return 'bg-amber-400/10 border-amber-400/20';
        return 'bg-red-400/10 border-red-400/20';
    };

    const StatusBadge = ({ isValid, label }: { isValid: boolean; label: string }) => (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isValid ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-red-400/10 border-red-400/20 text-red-400'
            }`}>
            {isValid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {label}
        </div>
    );

    const DataPoint = ({ label, value, desc, status, last }: { label: string; value: string; desc: string; status: 'success' | 'error'; last?: boolean }) => (
        <div className={`p-6 rounded-xl border border-white/5 bg-white/[0.02] ${last ? '' : 'mb-4'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <span className="font-bold text-white text-lg">{label}</span>
                </div>
                <StatusBadge isValid={status === 'success'} label={value} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );

    const handleSingleVerify = async () => {
        if (!email) return;

        setLoading(true);
        setResult(null);
        try {
            const data = await api.emailValidator.verify(email);
            setResult(data);
        } catch (err: any) {
            toast.error(err.message || t('toasts.verify_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>

                {activeTab === 'list' && (
                    <Button
                        onClick={handleBulkVerify}
                        disabled={customersLoading || validatingBulk || (selectedIds.length === 0 && filteredCustomers.length === 0)}
                        className="h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold uppercase tracking-widest hover:bg-emerald-500/20 px-8 rounded-xl"
                    >
                        {validatingBulk ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                        {selectedIds.length > 0 ? t('bulk.verify_selected', { count: selectedIds.length }) : t('bulk.verify_all')}
                    </Button>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger value="single" className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.single')}</TabsTrigger>
                    <TabsTrigger value="list" className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.bulk')}</TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-8 mt-0">
                    {/* Search Section */}
                    <div className="p-8 rounded-2xl border border-white/5 bg-[#111111] shadow-2xl">
                        <form onSubmit={handleVerify} className="flex gap-4">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder={t('single.placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 rounded-xl transition-all disabled:opacity-50 flex items-center gap-3 h-14"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('single.button')}
                            </button>
                        </form>
                    </div>

                    {result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* LAYER 8: Typo Recommendation */}
                            {result.syntax.suggestion && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-400" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{t('typo.suggestion')}</p>
                                            <p className="text-xs text-amber-400/80">{result.syntax.suggestion}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs font-bold text-amber-400 hover:bg-amber-500/10"
                                        onClick={() => {
                                            setEmail(result.syntax.suggestion);
                                            // Trigger verify if needed or just set email
                                        }}
                                    >
                                        {t('typo.use_suggested')}
                                    </Button>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Score Card */}
                                <div className={`col-span-1 p-10 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreBg(result.score)}`}>
                                    <div className="relative h-40 w-40 mb-6">
                                        <svg className="h-full w-full" viewBox="0 0 36 36">
                                            <path
                                                className="stroke-white/5"
                                                strokeDasharray="100, 100"
                                                strokeWidth="3"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className={getScoreColor(result.score || 0).replace('text-', 'stroke-')}
                                                strokeDasharray={`${result.score || 0}, 100`}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`text-5xl font-black ${getScoreColor(result.score || 0)}`}>{result.score ?? 0}</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{t('score_card.score')}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {result.status === 'VALID' ? t('score_card.reliable') : result.status === 'RISKY' ? t('score_card.risky') : t('score_card.invalid')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground italic px-6 leading-relaxed">
                                        {result.dns.isDisposable ? t('score_card.disposable_hint') :
                                            result.syntax.isRoleBased ? t('score_card.role_based_hint') :
                                                result.dns.isCatchAll ? t('score_card.catch_all_hint') :
                                                    t('score_card.valid_hint')}
                                    </p>
                                </div>

                                {/* Data Points */}
                                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DataPoint
                                        label={t('data_points.syntax')}
                                        value={result.syntax.isValid ? t('data_labels.valid') : t('data_labels.invalid')}
                                        desc={result.syntax.error || t('data_points.syntax_desc')}
                                        status={result.syntax.isValid ? 'success' : 'error'}
                                    />

                                    <DataPoint
                                        label={t('data_points.dns')}
                                        value={result.dns.isValid ? t('data_labels.found') : t('data_labels.missing')}
                                        desc={t('data_points.dns_desc', { exchange: result.dns.mxRecords?.[0] || '—' })}
                                        status={result.dns.isValid ? 'success' : 'error'}
                                    />

                                    <DataPoint
                                        label={t('data_points.smtp')}
                                        value={result.smtp.isValid ? t('data_labels.ok') : t('data_labels.error')}
                                        desc={result.smtp.isGreyListed ? t('data_points.greylisted') : result.smtp.error || t('data_points.smtp_desc')}
                                        status={result.smtp.isValid ? 'success' : 'error'}
                                    />

                                    <DataPoint
                                        label={t('data_points.risk')}
                                        value={result.dns.isCatchAll ? t('data_labels.catch_all') : t('data_labels.clean')}
                                        desc={result.dns.isCatchAll ? t('data_points.catch_all_desc') : t('data_points.risk_clean')}
                                        status={result.dns.isCatchAll ? 'error' : 'success'}
                                        last
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Single Check Loading / Empty */}
                    {!result && !loading && (
                        <div className="p-20 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center bg-white/[0.01]">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Info className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('empty.waiting')}</h3>
                            <p className="text-muted-foreground max-w-sm text-lg font-medium opacity-60">{t('empty.waiting_desc')}</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="list" className="space-y-6 mt-0">
                    <Card className="glass-card overflow-hidden border-white/5">
                        <div className="p-6 bg-white/[0.03] border-b border-white/5 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative max-w-sm w-full group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t('search.customer_search')}
                                        className="w-full pl-10 pr-4 h-11 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                                        <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl w-[200px] text-[10px] font-bold uppercase tracking-widest">
                                            <Building2 className="h-3.5 w-3.5 mr-2 opacity-50" />
                                            <SelectValue placeholder="Grup / Sektör" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#111111] border-white/10">
                                            <SelectItem value="all" className="text-[10px] font-bold">{t('filters.all')} (GRUP)</SelectItem>
                                            {industries.map(ind => (
                                                <SelectItem key={ind} value={ind} className="text-[10px] font-bold">{ind.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={filterTag} onValueChange={setFilterTag}>
                                        <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl w-[180px] text-[10px] font-bold uppercase tracking-widest">
                                            <Tag className="h-3.5 w-3.5 mr-2 opacity-50" />
                                            <SelectValue placeholder="Etiket" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#111111] border-white/10">
                                            <SelectItem value="all" className="text-[10px] font-bold">{t('filters.all')} (ETİKET)</SelectItem>
                                            {tags.map(t_val => (
                                                <SelectItem key={t_val} value={t_val} className="text-[10px] font-bold">{t_val.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[2px]">
                                <Filter className="h-3 w-3" />
                                {t('search.filtered_records', { count: filteredCustomers.length })}
                            </div>
                        </div>
                        <Table>
                            <TableHeader className="bg-white/[0.01]">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="w-12 px-6">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                                        />
                                    </TableHead>
                                    <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer group" onClick={() => toggleSort('fullName')}>
                                        <span className="flex items-center gap-1.5">{t('table.customer_company')} <SortIcon field="fullName" /></span>
                                    </TableHead>
                                    <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer group" onClick={() => toggleSort('email')}>
                                        <span className="flex items-center gap-1.5">{t('table.email')} <SortIcon field="email" /></span>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-[9px] font-bold uppercase tracking-widest">{t('table.syntax')}</TableHead>
                                    <TableHead className="hidden md:table-cell text-[9px] font-bold uppercase tracking-widest">{t('table.dns_mx')}</TableHead>
                                    <TableHead className="hidden lg:table-cell text-[9px] font-bold uppercase tracking-widest">{t('table.smtp')}</TableHead>
                                    <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer group" onClick={() => toggleSort('status')}>
                                        <span className="flex items-center gap-1.5">{t('table.group_score')} <SortIcon field="status" /></span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customersLoading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={7} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('table.loading')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCustomers.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={7} className="py-20 text-center opacity-30">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('empty.no_results')}</p>
                                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tight mt-1">{t('empty.no_results_desc')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((c) => {
                                        const vRes = bulkResults[c.email];
                                        return (
                                            <TableRow key={c.id} className="group border-white/5 hover:bg-white/[0.02] transition-colors h-16">
                                                <TableCell className="px-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(c.id)}
                                                        onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                                                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        onClick={() => handleOpenDetail(c)}
                                                        className="flex flex-col text-left group/name"
                                                    >
                                                        <span className="font-bold text-white text-xs group-hover/name:text-blue-400 transition-colors flex items-center gap-1.5">
                                                            {c.fullName}
                                                            <Eye className="h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground/60 uppercase font-medium">{c.customerProfile?.companyName || '-'}</span>
                                                    </button>
                                                </TableCell>
                                                <TableCell className="font-mono text-[10px] text-white/70">{c.email}</TableCell>
                                                <TableCell className="text-center">
                                                    {vRes ? (
                                                        <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.syntax?.isValid ? 'bg-emerald-500/10 text-emerald-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                            {vRes.syntax?.isValid ? t('data_labels.ok') : t('data_labels.error')}
                                                        </Badge>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {vRes ? (
                                                        <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.dns?.isValid ? 'bg-emerald-500/10 text-emerald-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                            {vRes.dns?.isValid ? `DNS ${t('data_labels.ok')}` : `DNS ${t('data_labels.missing')}`}
                                                        </Badge>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {vRes ? (
                                                        <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.smtp?.isValid ? 'bg-emerald-500/10 text-emerald-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                            {vRes.smtp?.isValid ? `SMTP ${t('data_labels.ok')}` : `SMTP ${t('data_labels.error')}`}
                                                        </Badge>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    {vRes ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border-none' : vRes.status === 'RISKY' ? 'bg-amber-500/10 text-amber-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                                {vRes.status}
                                                            </Badge>
                                                            <span className={`font-mono text-xs font-bold leading-none ${getScoreColor(vRes.score || 0)}`}>{vRes.score || 0}</span>
                                                        </div>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Validation Detail Sheet */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 p-0 overflow-hidden">
                    {selectedCustomer && (
                        <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                            <DialogHeader className="p-8 bg-[#111111] border-b border-white/5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black uppercase tracking-widest mb-2">{t('detail.title')}</Badge>
                                        <DialogTitle className="text-2xl font-bold text-white">{selectedCustomer.fullName}</DialogTitle>
                                        <DialogDescription className="text-muted-foreground text-sm font-mono">{selectedCustomer.email}</DialogDescription>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="rounded-xl border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400"
                                        onClick={() => handleReverifySingle(selectedCustomer.email)}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="bg-white/5 text-white/60 border-none text-[9px] font-bold flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> {selectedCustomer.customerProfile.customerNo || 'C-PRO'}
                                    </Badge>
                                    {(selectedCustomer.customerProfile.tags || []).map(t => (
                                        <Badge key={t} variant="secondary" className="bg-blue-500/10 text-blue-400 border-none text-[9px] font-bold">#{t.toUpperCase()}</Badge>
                                    ))}
                                </div>
                            </DialogHeader>

                            <div className="p-8 space-y-8">
                                {bulkResults[selectedCustomer.email] ? (
                                    <>
                                        {/* Score Overview */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card className="bg-white/[0.02] border-white/5 p-6 flex flex-col items-center justify-center text-center">
                                                <div className="text-4xl font-black text-white mb-1">{bulkResults[selectedCustomer.email]?.score ?? 0}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('detail.trust_score')}</div>
                                            </Card>
                                            <Card className="bg-white/[0.02] border-white/5 p-6 flex flex-col items-center justify-center text-center">
                                                <div className={`text-sm font-black uppercase tracking-widest mb-1 ${bulkResults[selectedCustomer.email]?.status === 'VALID' ? 'text-emerald-400' :
                                                    bulkResults[selectedCustomer.email]?.status === 'RISKY' ? 'text-amber-400' : 'text-red-400'
                                                    }`}>
                                                    {bulkResults[selectedCustomer.email]?.status ?? 'UNKNOWN'}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('detail.status')}</div>
                                            </Card>
                                        </div>

                                        {/* Intelligence Details */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] border-b border-white/5 pb-2">{t('detail.intelligence')}</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { label: 'Disposable (Geçici)', value: bulkResults[selectedCustomer.email]?.dns?.isDisposable, icon: XCircle },
                                                    { label: 'Role-Based (Kurumsal)', value: bulkResults[selectedCustomer.email]?.syntax?.isRoleBased, icon: Users },
                                                    { label: 'Catch-All (Genel Alıcı)', value: bulkResults[selectedCustomer.email]?.dns?.isCatchAll, icon: Globe },
                                                    { label: 'SMTP Connection', value: bulkResults[selectedCustomer.email]?.smtp?.canConnect, icon: Server }
                                                ].map((item, idx) => (
                                                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-xs font-bold text-white/80">{item.label}</span>
                                                        </div>
                                                        {item.value ?
                                                            <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black uppercase">{t('detail.yes_risky')}</Badge> :
                                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">{t('detail.no_clean')}</Badge>
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DNS & SMTP Logs */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] border-b border-white/5 pb-2">{t('detail.server_records')}</h4>
                                            <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-white/60 space-y-2">
                                                <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                                                    <Activity className="h-3 w-3" /> {t('detail.mx_data')}
                                                </div>
                                                {(bulkResults[selectedCustomer.email]?.dns?.mxRecords || []).map((mx: any, i: number) => (
                                                    <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                                                        <span className="text-white/40">{mx}</span>
                                                    </div>
                                                ))}
                                                {(!bulkResults[selectedCustomer.email]?.dns?.mxRecords?.length) && <div>{t('detail.no_mx')}</div>}
                                            </div>

                                            <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-white/60">
                                                <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
                                                    <Server className="h-3 w-3" /> {t('detail.smtp_log')}
                                                </div>
                                                <div className="text-white/40 italic">
                                                    {bulkResults[selectedCustomer.email]?.smtp?.isValid ?
                                                        t('detail.smtp_success', { server: bulkResults[selectedCustomer.email]?.dns?.mxRecords?.[0] || 'server' }) :
                                                        bulkResults[selectedCustomer.email]?.smtp?.error || t('detail.smtp_fail')
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-30">
                                        <Mail className="h-10 w-10 mb-4" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">{t('empty.waiting')}</p>
                                        <p className="text-[9px] mt-1 uppercase tracking-tight">{t('empty.waiting_desc')}</p>
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-xl border-white/10 font-bold text-[10px] uppercase"
                                            onClick={() => handleReverifySingle(selectedCustomer.email)}
                                        >
                                            {t('empty.verify_now')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
