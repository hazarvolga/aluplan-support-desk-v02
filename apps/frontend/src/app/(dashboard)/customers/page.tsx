'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Upload,
    Search,
    ArrowUpDown,
    Trash2,
    Link2,
    RefreshCw,
    History,
    Building2,
    Globe,
    Users,
    ExternalLink,
    Save,
    Plus,
    Filter,
    ChevronRight,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerItem {
    id: string;
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    customerProfile?: {
        customerNo: string;
        companyName: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        jobTitle?: string;
        contractStatus?: string;
        industry?: string;
        phoneNumber: string | null;
        crmVerified: boolean;
        accountId?: string;
        account?: {
            id: string;
            name: string;
        };
    };
}

interface AccountItem {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    address?: string;
    crmVerified: boolean;
    _count: {
        customers: number;
    };
}

type SortField = 'companyName' | 'fullName' | 'jobTitle' | 'email' | 'status' | 'createdAt' | 'contractStatus' | 'industry' | 'customerNo' | 'phoneNumber';
type SortOrder = 'asc' | 'desc';

export default function CustomersPage() {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [accounts, setAccounts] = useState<AccountItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('list');
    const [deleting, setDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [validating, setValidating] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [validationResults, setValidationResults] = useState<Record<string, any>>({});

    const loadCustomers = () => {
        setLoading(true);
        api.customers
            .list()
            .then((data) => {
                setCustomers(data);
                setSelectedIds([]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const loadAccounts = () => {
        setAccountsLoading(true);
        api.crm
            .getAccounts()
            .then(setAccounts)
            .catch(console.error)
            .finally(() => setAccountsLoading(false));
    };

    const loadConnections = () => {
        setConnectionsLoading(true);
        api.crm
            .getConnections()
            .then((conns) => {
                setConnections(conns);
                if (conns.length > 0) {
                    loadLogs(conns[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setConnectionsLoading(false));
    };

    const loadLogs = (connectionId: string) => {
        setLogsLoading(true);
        api.crm
            .getLogs(connectionId)
            .then(setLogs)
            .catch(console.error)
            .finally(() => setLogsLoading(false));
    };

    useEffect(() => {
        loadCustomers();
        loadAccounts();
        loadConnections();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredAndSortedCustomers.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleBulkDelete = async () => {
        const isAccounts = activeTab === 'accounts';
        const ids = isAccounts ? selectedAccountIds : selectedIds;

        if (ids.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        const isAccounts = activeTab === 'accounts';
        const ids = isAccounts ? selectedAccountIds : selectedIds;

        setDeleting(true);
        try {
            if (isAccounts) {
                await api.crm.bulkDeleteAccounts(ids);
                toast({ title: '✅ Başarılı', description: 'Seçilen şirketler silindi.' });
                loadAccounts();
                setSelectedAccountIds([]);
            } else {
                await api.customers.bulkDelete(ids);
                toast({ title: '✅ Başarılı', description: 'Seçilen müşteriler silindi.' });
                loadCustomers();
                setSelectedIds([]);
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: '❌ Hata', description: 'Silme işlemi başarısız: ' + (error.message || 'Bilinmeyen hata') });
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectAllAccounts = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedAccountIds(filteredAccounts.map(a => a.id));
        } else {
            setSelectedAccountIds([]);
        }
    };

    const handleSelectOneAccount = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedAccountIds(prev => [...prev, id]);
        } else {
            setSelectedAccountIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleSync = async (connectionId: string) => {
        setSyncing(true);
        try {
            await api.crm.triggerSync(connectionId);
            toast({ title: '🔄 Senkronizasyon', description: 'Senkronizasyon işlemi arka planda başlatıldı.' });
            loadConnections();
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ Hata', description: error.message });
        } finally {
            setSyncing(false);
        }
    };

    const handleBulkVerify = async () => {
        const emailsToVerify = selectedIds.length > 0
            ? customers.filter(c => selectedIds.includes(c.id)).map(c => c.email)
            : filteredAndSortedCustomers.map(c => c.email);

        if (emailsToVerify.length === 0) return;

        setValidating(true);
        try {
            const results = await api.emailValidator.verifyBulk(emailsToVerify);
            const resultMap: Record<string, any> = { ...validationResults };
            results.forEach(r => {
                resultMap[r.email] = r;
            });
            setValidationResults(resultMap);
            toast({ title: '✅ Başarılı', description: `${emailsToVerify.length} e-posta doğrulandı.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ Hata', description: error.message });
        } finally {
            setValidating(false);
        }
    };

    const filteredAndSortedCustomers = useMemo(() => {
        let result = [...customers];

        // Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.fullName.toLowerCase().includes(lowerTerm) ||
                c.email.toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.companyName || '').toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.customerNo || '').toLowerCase().includes(lowerTerm)
            );
        }

        // Sort
        result.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortField) {
                case 'companyName':
                    aValue = a.customerProfile?.companyName || '';
                    bValue = b.customerProfile?.companyName || '';
                    break;
                case 'fullName':
                    aValue = a.fullName || '';
                    bValue = b.fullName || '';
                    break;
                case 'jobTitle':
                    aValue = a.customerProfile?.jobTitle || '';
                    bValue = b.customerProfile?.jobTitle || '';
                    break;
                case 'email':
                    aValue = a.email || '';
                    bValue = b.email || '';
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                case 'contractStatus':
                    aValue = a.customerProfile?.contractStatus || '';
                    bValue = b.customerProfile?.contractStatus || '';
                    break;
                case 'industry':
                    aValue = a.customerProfile?.industry || '';
                    bValue = b.customerProfile?.industry || '';
                    break;
                case 'customerNo':
                    aValue = a.customerProfile?.customerNo || '';
                    bValue = b.customerProfile?.customerNo || '';
                    break;
                case 'phoneNumber':
                    aValue = a.customerProfile?.phoneNumber || '';
                    bValue = b.customerProfile?.phoneNumber || '';
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [customers, searchTerm, sortField, sortOrder]);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return accounts;
        const lowerTerm = searchTerm.toLowerCase();
        return accounts.filter(a =>
            a.name.toLowerCase().includes(lowerTerm) ||
            (a.industry || '').toLowerCase().includes(lowerTerm)
        );
    }, [accounts, searchTerm]);

    const isAllSelected = filteredAndSortedCustomers.length > 0 && selectedIds.length === filteredAndSortedCustomers.length;
    const isAllAccountsSelected = filteredAccounts.length > 0 && selectedAccountIds.length === filteredAccounts.length;

    const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
        <TableHead
            className="cursor-pointer hover:bg-white/[0.03] select-none transition-colors border-none py-4 px-4"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                <span>{children}</span>
                <ArrowUpDown className="h-3 w-3 opacity-30" />
            </div>
        </TableHead>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 relative min-h-screen pb-24"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        Müşteri Portalı
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        Kurumsal müşteri portföyü ve CRM entegrasyon merkezi
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {((activeTab === 'list' && selectedIds.length > 0) || (activeTab === 'accounts' && selectedAccountIds.length > 0)) && (
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleBulkDelete}
                            className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-500/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting ? 'Siliniyor...' : `${activeTab === 'accounts' ? selectedAccountIds.length : selectedIds.length} Seçiliyi Sil`}
                        </Button>
                    )}
                    <Button
                        onClick={handleBulkVerify}
                        disabled={loading || validating || (selectedIds.length === 0 && filteredAndSortedCustomers.length === 0)}
                        className="h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20"
                    >
                        {validating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        {selectedIds.length > 0 ? `Seçilenleri Doğrula (${selectedIds.length})` : 'Mailleri Doğrula'}
                    </Button>
                    <Button
                        asChild
                        disabled={loading}
                        className="h-9 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                    >
                        <Link href="/customers/import">
                            <Upload className="mr-2 h-4 w-4" />
                            İçe Aktar
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-8" onValueChange={setActiveTab}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                    <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-11 shrink-0">
                        <TabsTrigger value="list" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            Müşteriler
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            Hesaplar
                        </TabsTrigger>
                        <TabsTrigger value="sync" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            Senkronizasyon
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            İşlem Geçmişi
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Müşteri veya Şirket Arayın..."
                            className="w-full pl-10 pr-4 h-11 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="list" className="space-y-6 mt-0">
                    <Card className="glass-card overflow-hidden border-white/5">
                        <Table>
                            <TableHeader className="bg-white/[0.03]">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="w-12 px-6">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                                        />
                                    </TableHead>
                                    <SortableHeader field="fullName">Ad Soyad</SortableHeader>
                                    <SortableHeader field="companyName">Şirket</SortableHeader>
                                    <SortableHeader field="jobTitle">Ünvan</SortableHeader>
                                    <SortableHeader field="email">E-posta</SortableHeader>
                                    <SortableHeader field="industry">Sektör</SortableHeader>
                                    <SortableHeader field="contractStatus">Müşteri Durumu</SortableHeader>
                                    <SortableHeader field="status">Hesap Durumu</SortableHeader>
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={8} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Veri Veri Tabanından Çekiliyor</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAndSortedCustomers.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={8} className="py-20 text-center opacity-30">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Sonuç Bulunamadı</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedCustomers.map((c) => (
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
                                                <Link href={`/customers/${c.id}`} className="font-bold text-white hover:text-blue-400 underline-offset-4 hover:underline transition-colors block">
                                                    {c.fullName}
                                                </Link>
                                                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-tighter mt-1 block">
                                                    ID: {c.customerProfile?.customerNo || 'UNASSIGNED'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {c.customerProfile?.account ? (
                                                    <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[9px] font-bold px-2 py-0.5">
                                                        <Building2 className="h-3 w-3 mr-1" />
                                                        {c.customerProfile.account.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-white/40 italic text-xs">{c.customerProfile?.companyName || '-'}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-white/60 text-xs font-medium">{c.customerProfile?.jobTitle || '-'}</TableCell>
                                            <TableCell className="text-white/60 font-mono text-[11px]">
                                                <div className="flex items-center gap-2">
                                                    {c.email}
                                                    {validationResults[c.email] && (
                                                        <div title={`Skor: ${validationResults[c.email].score}`}>
                                                            {validationResults[c.email].status === 'VALID' ? (
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            ) : validationResults[c.email].status === 'RISKY' ? (
                                                                <AlertCircle className="h-3 w-3 text-amber-500" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 text-rose-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold text-white/50 border border-white/5">
                                                    {c.customerProfile?.industry || 'GENEL'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[9px] font-black tracking-widest px-2 py-0.5 ${c.customerProfile?.contractStatus === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-none'
                                                    : 'text-slate-500 border-white/10'
                                                    }`}>
                                                    {c.customerProfile?.contractStatus || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {c.status === 'ACTIVE' ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black tracking-widest px-2 py-0.5">
                                                        AKTİF
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500 border-white/10 text-[9px] font-black tracking-widest px-2 py-0.5">
                                                        {c.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 text-right">
                                                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground">
                                                    <Link href={`/customers/${c.id}`}><ChevronRight className="h-4 w-4" /></Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="accounts" className="space-y-6 mt-0">
                    <Card className="glass-card overflow-hidden border-white/5">
                        <Table>
                            <TableHeader className="bg-white/[0.03]">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="w-12 px-6">
                                        <input
                                            type="checkbox"
                                            checked={isAllAccountsSelected}
                                            onChange={handleSelectAllAccounts}
                                            className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">Şirket Yapısı</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">Sektör / Domain</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">Ekosistem</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">CRM Doğrulama</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 text-right pr-6">Aksiyon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountsLoading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={6} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAccounts.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={6} className="py-20 text-center opacity-30">
                                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">HESAP BULUNAMADI</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAccounts.map((a) => (
                                        <TableRow key={a.id} className="group border-white/5 hover:bg-white/[0.02] transition-colors h-16">
                                            <TableCell className="px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAccountIds.includes(a.id)}
                                                    onChange={(e) => handleSelectOneAccount(a.id, e.target.checked)}
                                                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Link href={`/customers/accounts/${a.id}`} className="font-bold text-white hover:text-blue-400 transition-colors">
                                                        {a.name}
                                                    </Link>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {a.website && (
                                                            <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 font-mono uppercase">
                                                                <Globe className="h-2.5 w-2.5" /> DOMAIN
                                                            </a>
                                                        )}
                                                        <span className="text-[10px] text-muted-foreground/40 font-mono truncate max-w-[200px]">{a.address}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                                                    {a.industry || 'DEFINED'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/80">
                                                        <Users className="h-3 w-3 text-blue-500" />
                                                        {a._count.customers} PROFİL
                                                    </div>
                                                    <div className="w-24 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-[65%]" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {a.crmVerified ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">DYNAMICS_OK</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 grayscale brightness-50">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MANUAL_ENTRY</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Button asChild variant="outline" size="sm" className="h-8 border-white/10 text-[9px] font-bold px-3 hover:bg-blue-500/10 hover:text-blue-400">
                                                    <Link href={`/customers/accounts/${a.id}`}>DETAYLAR</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="sync" className="space-y-6">
                    <AnimatePresence mode="wait">
                        {connectionsLoading ? (
                            <div className="flex items-center justify-center py-20 text-muted-foreground font-mono text-[10px] uppercase tracking-widest italic animate-pulse">
                                CRM VERİ PROTOKOLLERİ KONTROL EDİLİYOR...
                            </div>
                        ) : connections.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center p-12 glass-card border-dashed"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                    <Link2 className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">CRM Entegrasyonu Yok</h3>
                                <p className="text-muted-foreground text-center max-w-md mb-8 text-sm font-medium">
                                    Dynamics 365 veritabanınızı bağlayarak müşteri ve şirket verilerini otomatik olarak senkronize edin.
                                </p>
                                <Button asChild className="h-12 px-8 bg-blue-600 hover:bg-blue-500 font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-blue-500/10">
                                    <Link href="/customers/crm">KONTROL MERKEZİNİ YAPILANDIR</Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {connections.map((conn) => (
                                    <Card key={conn.id} className="glass-card overflow-hidden border-white/5 group hover:border-blue-500/20 transition-all">
                                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
                                            <div className="p-8 md:w-1/3 flex flex-col justify-between">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                        <ExternalLink className="h-6 w-6 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{conn.provider}</h3>
                                                        <p className="text-[10px] font-mono text-muted-foreground/60 tracking-tighter truncate max-w-[200px]">{conn.instanceUrl}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    {conn.isActive ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black tracking-[0.2em] px-2">AKTİF</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500 border-white/10 text-[8px] font-black tracking-[0.2em] px-2">PASİF</Badge>
                                                    )}
                                                    {conn.syncStatus === 'SYNCING' && (
                                                        <Badge className="bg-blue-500/10 text-blue-400 animate-pulse border-none text-[8px] font-black tracking-[0.2em] px-2">SENKRONİZE_EDİLİYOR</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">Son Transfer</p>
                                                        <p className="text-sm font-bold text-white">
                                                            {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString('tr-TR') : 'YOK'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">Sistem Durumu</p>
                                                        <p className="text-sm font-bold text-blue-400 font-mono">{conn.syncStatus || 'IDLE'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-end items-end gap-3">
                                                    <Button
                                                        onClick={() => handleSync(conn.id)}
                                                        disabled={syncing || conn.syncStatus === 'SYNCING'}
                                                        className="w-full h-11 bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-[10px] font-bold uppercase tracking-widest transition-all"
                                                    >
                                                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing || conn.syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                                                        Transferi Tetikle
                                                    </Button>
                                                    <Button asChild variant="ghost" className="text-[9px] font-bold text-muted-foreground hover:text-white group">
                                                        <Link href="/customers/crm">
                                                            AYARLARI DÜZENLE <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card className="glass-card overflow-hidden border-white/5">
                        <Table>
                            <TableHeader className="bg-white/[0.03]">
                                <TableRow className="border-white/5">
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 px-6">Timestamp</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">Status</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">Volume</TableHead>
                                    <TableHead className="font-bold text-[10px] text-emerald-500/70 uppercase py-4 tracking-widest">Passed</TableHead>
                                    <TableHead className="font-bold text-[10px] text-rose-500/70 uppercase py-4 tracking-widest">Failed</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 pr-6">Logs / Nodes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logsLoading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={6} className="py-20 text-center">
                                            <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={6} className="py-20 text-center opacity-30">
                                            <History className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Geçmiş Verisi Yok</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.01]">
                                            <TableCell className="font-mono text-[11px] text-white/50 px-6">
                                                {new Date(log.startedAt).toLocaleString('tr-TR')}
                                            </TableCell>
                                            <TableCell>
                                                {log.status === 'SUCCESS' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 w-3 bg-emerald-500" />
                                                        <span className="text-[10px] font-black text-emerald-500 tracking-tighter">OK_200</span>
                                                    </div>
                                                ) : log.status === 'ERROR' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 w-3 bg-rose-500" />
                                                        <span className="text-[10px] font-black text-rose-500 tracking-tighter">ERR_500</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="animate-pulse border-blue-500/20 text-blue-400 text-[9px]">PENDING</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-bold text-white/80">{log.totalRecords}</TableCell>
                                            <TableCell className="text-emerald-500 font-mono text-[11px]">{log.successCount}</TableCell>
                                            <TableCell className="text-rose-500 font-mono text-[11px]">{log.errorCount}</TableCell>
                                            <TableCell className="text-[10px] text-white/20 font-mono italic max-w-[200px] truncate pr-6" title={log.errorMessage}>
                                                {log.errorMessage || 'TRANSFER_LOG_EMPTY'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title="Sistem Protokolü: Silme Onayı"
                description={`${activeTab === 'accounts' ? selectedAccountIds.length : selectedIds.length} adet veri nesnesi kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
                confirmText="SİLME PROTOKOLÜNÜ BAŞLAT"
                cancelText="İPTAL"
                variant="danger"
                loading={deleting}
            />
        </motion.div>
    );
}

import { ArrowRight } from 'lucide-react';
