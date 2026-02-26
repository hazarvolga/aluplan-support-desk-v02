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
import { Upload, Search, ArrowUpDown, Trash2, Link2, RefreshCw, History, Building2, Globe, Users, ExternalLink, Save } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
    const [deleting, setDeleting] = useState(false);

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
        if (!confirm(`${selectedIds.length} müşteriyi silmek istediğinize emin misiniz?`)) return;

        setDeleting(true);
        try {
            await api.customers.bulkDelete(selectedIds);
            toast({ title: '✅ Başarılı', description: 'Seçilen müşteriler silindi.' });
            loadCustomers();
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: '❌ Hata', description: 'Silme işlemi başarısız: ' + (error.message || 'Bilinmeyen hata') });
        } finally {
            setDeleting(false);
        }
    };

    const [syncing, setSyncing] = useState(false);

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

    if (loading && customers.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
        );
    }

    const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
        <TableHead
            className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            </div>
        </TableHead>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Müşteriler</h1>
                    <p className="text-muted-foreground">Kayıtlı müşterilerin ve şirketlerin listesi</p>
                </div>
                <div className="flex items-center space-x-3">
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" disabled={deleting} onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting ? 'Siliniyor...' : `${selectedIds.length} Seçiliyi Sil`}
                        </Button>
                    )}
                    <Button asChild disabled={loading}>
                        <Link href="/customers/import">
                            <Upload className="mr-2 h-4 w-4" />
                            İçe Aktar
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Kayıtlı Müşteriler
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Hesaplar (Şirketler)
                    </TabsTrigger>
                    <TabsTrigger value="sync" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Senkronizasyon
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        İşlem Geçmişi
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Arama yapın..."
                            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="list" className="space-y-6 mt-0">
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </TableHead>
                                    <SortableHeader field="fullName">Ad Soyad</SortableHeader>
                                    <SortableHeader field="jobTitle">Ünvan</SortableHeader>
                                    <SortableHeader field="email">E-posta</SortableHeader>
                                    <SortableHeader field="industry">Sektör</SortableHeader>
                                    <SortableHeader field="companyName">Şirket Adı</SortableHeader>
                                    <SortableHeader field="customerNo">Müşteri No</SortableHeader>
                                    <SortableHeader field="contractStatus">Müşteri Durumu</SortableHeader>
                                    <SortableHeader field="status">Durum</SortableHeader>
                                    <SortableHeader field="phoneNumber">Telefon</SortableHeader>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                            Henüz kayıtlı müşteri yok veya arama sonucu bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedCustomers.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(c.id)}
                                                    onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/customers/${c.id}`} className="hover:underline text-primary font-medium">
                                                    {c.fullName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{c.customerProfile?.jobTitle || '-'}</TableCell>
                                            <TableCell>{c.email}</TableCell>
                                            <TableCell>{c.customerProfile?.industry || '-'}</TableCell>
                                            <TableCell className="font-medium">
                                                {c.customerProfile?.account ? (
                                                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                                        <Building2 className="h-3 w-3" />
                                                        {c.customerProfile.account.name}
                                                    </Badge>
                                                ) : (
                                                    c.customerProfile?.companyName || '-'
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {c.customerProfile?.customerNo || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {c.customerProfile?.contractStatus ? (
                                                    <Badge variant="outline">{c.customerProfile.contractStatus}</Badge>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {c.status === 'ACTIVE' ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-400 border-slate-500/30">
                                                        {c.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{c.customerProfile?.phoneNumber || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="accounts" className="space-y-6 mt-0">
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Şirket Adı</TableHead>
                                    <TableHead>Web Sitesi</TableHead>
                                    <TableHead>Sektör / Endüstri</TableHead>
                                    <TableHead>Kayıtlı Kişiler</TableHead>
                                    <TableHead>CRM Durumu</TableHead>
                                    <TableHead>Adres</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Yükleniyor...</TableCell>
                                    </TableRow>
                                ) : filteredAccounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            Kayıtlı hesap bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAccounts.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {a.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {a.website ? (
                                                    <a href={a.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                        <Globe className="h-3 w-3" />
                                                        Siteye Git
                                                    </a>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>{a.industry || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {a._count.customers} Kişi
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {a.crmVerified ? (
                                                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30">
                                                        CRM Doğrulanmış
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Manuel</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                                                {a.address || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="sync">
                    {connectionsLoading ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground italic">
                            CRM Bağlantıları Kontrol Ediliyor...
                        </div>
                    ) : connections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                            <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">CRM Bağlantısı Gerekli</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-6">
                                Dynamics 365 veya diğer CRM sistemlerinden müşteri ve şirket verilerini otomatik çekmek için bağlantı kurmanız gerekmektedir.
                            </p>
                            <Button asChild>
                                <Link href="/customers/crm">CRM Kontrol Merkezine Git</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {connections.map((conn) => (
                                <Card key={conn.id} className="overflow-hidden">
                                    <CardHeader className="bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-sky-500/10 rounded-lg">
                                                    <ExternalLink className="h-5 w-5 text-sky-500" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{conn.provider}</CardTitle>
                                                    <CardDescription className="font-mono text-xs">{conn.instanceUrl}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {conn.isActive ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Aktif</Badge>
                                                ) : (
                                                    <Badge variant="outline">Pasif</Badge>
                                                )}
                                                {conn.syncStatus === 'SYNCING' && (
                                                    <Badge className="bg-sky-500/10 text-sky-400 animate-pulse">Senkronize Ediliyor</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground uppercase font-semibold">Son Senkronizasyon</p>
                                                <p className="text-sm font-medium">
                                                    {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString('tr-TR') : 'Hiç yapılmadı'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground uppercase font-semibold">Senk. Durumu</p>
                                                <p className="text-sm font-medium">{conn.syncStatus || 'IDLE'}</p>
                                            </div>
                                            <div className="flex items-end justify-end">
                                                <Button
                                                    onClick={() => handleSync(conn.id)}
                                                    disabled={syncing || conn.syncStatus === 'SYNCING'}
                                                    variant="secondary"
                                                    className="gap-2"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${syncing || conn.syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                                                    Senkronizasyonu Tetikle
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="flex justify-center pt-4">
                                <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                                    <Link href="/customers/crm" className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Bağlantı Ayarlarını Düzenle
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    {logsLoading ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground italic">
                            İşlem geçmişi yükleniyor...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Henüz bir senkronizasyon kaydı bulunamadı.
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead>Toplam</TableHead>
                                        <TableHead className="text-emerald-500">Başarılı</TableHead>
                                        <TableHead className="text-red-500">Hata</TableHead>
                                        <TableHead>Notlar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs font-medium">
                                                {new Date(log.startedAt).toLocaleString('tr-TR')}
                                            </TableCell>
                                            <TableCell>
                                                {log.status === 'SUCCESS' ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none">Bitti</Badge>
                                                ) : log.status === 'ERROR' ? (
                                                    <Badge className="bg-red-500/10 text-red-400 border-none">Hata</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="animate-pulse">Devam Ediyor</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{log.totalRecords}</TableCell>
                                            <TableCell className="text-emerald-500">{log.successCount}</TableCell>
                                            <TableCell className="text-red-500">{log.errorCount}</TableCell>
                                            <TableCell className="text-xs max-w-[200px] truncate" title={log.errorMessage}>
                                                {log.errorMessage || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
