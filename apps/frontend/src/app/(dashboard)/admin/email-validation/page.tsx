'use client';

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

type SortField = 'fullName' | 'companyName' | 'email';
type SortOrder = 'asc' | 'desc';

export default function EmailValidationPage() {
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
            toast.error(err.message || 'Doğrulama hatası');
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
            toast.success(`${emailsToVerify.length} e-posta doğrulandı.`);
        } catch (error: any) {
            toast.error(error.message || 'Toplu doğrulama hatası');
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
            let aValue = '';
            let bValue = '';
            if (sortField === 'fullName') { aValue = a.fullName; bValue = b.fullName; }
            else if (sortField === 'email') { aValue = a.email; bValue = b.email; }
            else if (sortField === 'companyName') { aValue = a.customerProfile?.companyName || ''; bValue = b.customerProfile?.companyName || ''; }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [customers, searchTerm, sortField, sortOrder, filterIndustry, filterTag]);

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

    const handleOpenDetail = (customer: CustomerItem) => {
        setSelectedCustomer(customer);
        setDetailDialogOpen(true);
    };

    const handleReverifySingle = async (email: string) => {
        setLoading(true);
        try {
            const data = await api.emailValidator.verify(email);
            setBulkResults(prev => ({ ...prev, [email]: data }));
            toast.success(`${email} yeniden doğrulandı.`);
        } catch (err: any) {
            toast.error(err.message || 'Doğrulama hatası');
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">E-Posta Doğrulama</h1>
                    <p className="text-muted-foreground">E-posta adreslerinin geçerliliğini, DNS kayıtlarını ve SMTP durumunu kontrol edin.</p>
                </div>

                {activeTab === 'list' && (
                    <Button
                        onClick={handleBulkVerify}
                        disabled={customersLoading || validatingBulk || (selectedIds.length === 0 && filteredCustomers.length === 0)}
                        className="h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold uppercase tracking-widest hover:bg-emerald-500/20 px-8 rounded-xl"
                    >
                        {validatingBulk ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                        {selectedIds.length > 0 ? `Seçilenleri Doğrula (${selectedIds.length})` : 'Tümünü Doğrula'}
                    </Button>
                )}
            </div>

            <Tabs defaultValue="single" className="space-y-8" onValueChange={setActiveTab}>
                <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-12 shrink-0">
                    <TabsTrigger value="single" className="rounded-lg px-8 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white h-full">
                        Hızlı Kontrol
                    </TabsTrigger>
                    <TabsTrigger value="list" className="rounded-lg px-8 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white h-full">
                        Müşteri Listesi
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-8 mt-0">
                    {/* Search Section */}
                    <div className="p-8 rounded-2xl border border-white/5 bg-[#111111] shadow-2xl">
                        <form onSubmit={handleVerify} className="flex gap-4">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="Doğrulanacak e-posta adresi (ör: user@example.com)"
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
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                                {loading ? 'Doğrulanıyor...' : 'Analiz Et'}
                            </button>
                        </form>
                    </div>

                    {result && result.summary && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Score Card */}
                            <div className={`col-span-1 p-10 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreBg(result?.summary?.score)}`}>
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
                                            className={getScoreColor(result?.summary?.score || 0).replace('text-', 'stroke-')}
                                            strokeDasharray={`${result?.summary?.score || 0}, 100`}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-5xl font-black ${getScoreColor(result?.summary?.score || 0)}`}>{result?.summary?.score ?? 0}</span>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Skor</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {result?.summary?.status === 'VALID' ? 'Güvenilir' : result?.summary?.status === 'RISKY' ? 'Riskli' : 'Geçersiz'}
                                </h3>
                                <p className="text-sm text-muted-foreground italic px-6 leading-relaxed">
                                    {result?.intelligence?.isDisposable ? 'Geçici e-posta servisi tespit edildi.' :
                                        result?.intelligence?.isRoleBased ? 'Kurumsal rol adresi (destek, bilgi vb.).' :
                                            'E-posta adresi kullanımı için uygun görünüyor.'}
                                </p>
                            </div>

                            {/* Data Points */}
                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Syntax */}
                                <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-white text-lg">Sözdizimi</span>
                                        </div>
                                        <StatusBadge isValid={!!result?.syntax?.isValid} label={result?.syntax?.isValid ? 'OK' : 'HATA'} />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">E-posta formatı RFC standartlarına uygunluk kontrol edildi.</p>
                                </div>

                                {/* DNS */}
                                <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-white text-lg">DNS / MX</span>
                                        </div>
                                        <StatusBadge isValid={!!result?.dns?.hasMx} label={result?.dns?.hasMx ? 'OK' : 'HATA'} />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Alan adının e-posta sunucu kayıtları ({result?.dns?.mxRecords?.[0]?.exchange || 'Yok'}) doğrulandı.</p>
                                </div>

                                {/* SMTP */}
                                <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400">
                                                <Server className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-white text-lg">SMTP</span>
                                        </div>
                                        <StatusBadge isValid={!!result?.smtp?.canConnect} label={result?.smtp?.canConnect ? 'OK' : 'HATA'} />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Sunucuya socket seviyesinde erişildi ve handshake denendi.</p>
                                </div>

                                {/* Intelligence */}
                                <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                                                <Brain className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-white text-lg">Zeka (AI)</span>
                                        </div>
                                        <StatusBadge isValid={!result?.intelligence?.isDisposable} label={result?.intelligence?.isDisposable ? 'RİSKLİ' : 'TEMİZ'} />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result?.intelligence?.isDisposable && <span className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold uppercase">Disposable</span>}
                                        {result?.intelligence?.isRoleBased && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold uppercase">Role-Based</span>}
                                        {result?.dns?.isCatchAll && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold uppercase">Catch-All</span>}
                                        {!result?.intelligence?.isDisposable && !result?.intelligence?.isRoleBased && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase">Personal/Work</span>}
                                    </div>
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
                            <h3 className="text-2xl font-bold text-white mb-2">Analiz İçin E-Posta Bekleniyor</h3>
                            <p className="text-muted-foreground max-w-sm text-lg font-medium opacity-60">Lütfen yukarıdaki alana kontrol etmek istediğiniz adresi girin.</p>
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
                                        placeholder="Müşteri veya Şirket Arayın..."
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
                                            <SelectItem value="all" className="text-[10px] font-bold">TÜMÜ (GRUP)</SelectItem>
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
                                            <SelectItem value="all" className="text-[10px] font-bold">TÜMÜ (ETİKET)</SelectItem>
                                            {tags.map(t => (
                                                <SelectItem key={t} value={t} className="text-[10px] font-bold">{t.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[2px]">
                                <Filter className="h-3 w-3" />
                                {filteredCustomers.length} Filtrelenmiş Kayıt
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
                                    <TableHead className="cursor-pointer font-bold text-[10px] text-muted-foreground uppercase py-4" onClick={() => handleSort('fullName')}>
                                        Müşteri / Şirket <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-30" />
                                    </TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">E-posta</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 text-center">Sözdizimi</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 text-center">DNS / MX</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 text-center">SMTP</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 text-right pr-8">Grup / Skor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customersLoading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={7} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Müşteriler Yükleniyor...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCustomers.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={7} className="py-20 text-center opacity-30">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Sonuç Bulunamadı</p>
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
                                                            {vRes.syntax?.isValid ? 'OK' : 'HATALI'}
                                                        </Badge>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {vRes ? (
                                                        <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.dns?.hasMx ? 'bg-emerald-500/10 text-emerald-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                            {vRes.dns?.hasMx ? 'DNS OK' : 'DNS YOK'}
                                                        </Badge>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {vRes ? (
                                                        <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.smtp?.canConnect ? 'bg-emerald-500/10 text-emerald-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                            {vRes.smtp?.canConnect ? 'SMTP OK' : 'SMTP HATA'}
                                                        </Badge>
                                                    ) : <span className="text-[8px] text-muted-foreground/20 font-bold">-</span>}
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    {vRes ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <Badge variant="outline" className={`text-[8px] font-black tracking-widest px-2 py-0.5 ${vRes.summary?.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border-none' : vRes.summary?.status === 'RISKY' ? 'bg-amber-500/10 text-amber-400 border-none' : 'bg-red-500/10 text-red-400 border-none'}`}>
                                                                {vRes.summary?.status}
                                                            </Badge>
                                                            <span className={`font-mono text-xs font-bold leading-none ${getScoreColor(vRes.summary?.score || 0)}`}>{vRes.summary?.score || 0}</span>
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
                                        <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black uppercase tracking-widest mb-2">Detaylı Analiz</Badge>
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
                                                <div className="text-4xl font-black text-white mb-1">{bulkResults[selectedCustomer.email]?.summary?.score ?? 0}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Güven Skoru</div>
                                            </Card>
                                            <Card className="bg-white/[0.02] border-white/5 p-6 flex flex-col items-center justify-center text-center">
                                                <div className={`text-sm font-black uppercase tracking-widest mb-1 ${bulkResults[selectedCustomer.email]?.summary?.status === 'VALID' ? 'text-emerald-400' :
                                                    bulkResults[selectedCustomer.email]?.summary?.status === 'RISKY' ? 'text-amber-400' : 'text-red-400'
                                                    }`}>
                                                    {bulkResults[selectedCustomer.email]?.summary?.status ?? 'UNKNOWN'}
                                                </div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Durum</div>
                                            </Card>
                                        </div>

                                        {/* Intelligence Details */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] border-b border-white/5 pb-2">Zeka Katmanı (Intelligence)</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { label: 'Disposable (Geçici)', value: bulkResults[selectedCustomer.email]?.intelligence?.isDisposable, icon: XCircle },
                                                    { label: 'Role-Based (Kurumsal)', value: bulkResults[selectedCustomer.email]?.intelligence?.isRoleBased, icon: Users },
                                                    { label: 'Catch-All (Genel Alıcı)', value: bulkResults[selectedCustomer.email]?.dns?.isCatchAll, icon: Globe },
                                                    { label: 'SMTP Connection', value: bulkResults[selectedCustomer.email]?.smtp?.canConnect, icon: Server }
                                                ].map((item, idx) => (
                                                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-xs font-bold text-white/80">{item.label}</span>
                                                        </div>
                                                        {item.value ?
                                                            <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black uppercase">YES / RİSKLİ</Badge> :
                                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase">NO / TEMİZ</Badge>
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DNS & SMTP Logs */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] border-b border-white/5 pb-2">Sunucu Kayıtları</h4>
                                            <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-white/60 space-y-2">
                                                <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                                                    <Activity className="h-3 w-3" /> MX RECORD DATA
                                                </div>
                                                {(bulkResults[selectedCustomer.email]?.dns?.mxRecords || []).map((mx: any, i: number) => (
                                                    <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                                                        <span>Priority: {mx.priority}</span>
                                                        <span className="text-white/40">{mx.exchange}</span>
                                                    </div>
                                                ))}
                                                {(!bulkResults[selectedCustomer.email]?.dns?.mxRecords?.length) && <div>MX Kaydı Bulunamadı.</div>}
                                            </div>

                                            <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[10px] text-white/60">
                                                <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
                                                    <Server className="h-3 w-3" /> SMTP HANDSHAKE LOG
                                                </div>
                                                <div className="text-white/40 italic">
                                                    {bulkResults[selectedCustomer.email]?.smtp?.canConnect ?
                                                        `Connection established successfully to ${bulkResults[selectedCustomer.email]?.dns?.mxRecords?.[0]?.exchange || 'server'}. EHLO accepted.` :
                                                        'Connection failed or timeout during handshake.'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center space-y-4">
                                        <ShieldQuestion className="h-16 w-16" />
                                        <div className="text-sm font-bold uppercase tracking-widest">Veri Bulunmuyor</div>
                                        <p className="text-xs max-w-[200px]">Bu e-posta henüz doğrulanmamış. Lütfen doğrulama işlemini başlatın.</p>
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-xl border-white/10 font-bold text-[10px] uppercase"
                                            onClick={() => handleReverifySingle(selectedCustomer.email)}
                                        >
                                            Şimdi Doğrula
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
