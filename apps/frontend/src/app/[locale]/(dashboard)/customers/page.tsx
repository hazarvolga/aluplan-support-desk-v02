'use client';

export const dynamic = "force-dynamic";

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
    XCircle,
    Calendar,
    Check,
    ArrowRight,
    Layers
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { DataTableHeader } from './components/DataTableHeader';
import { MessageCircle } from 'lucide-react';
import { ProactiveChatPendingBadge } from '@/components/proactive-chat/ProactiveChatPendingBadge';
import { ProactiveChatWindow } from '@/components/proactive-chat/ProactiveChatWindow';

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
        subscriptionModel?: string;
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
    accountNumber?: string;
    crmVerified: boolean;
    _count: {
        customers: number;
    };
}

type SortField = 'companyName' | 'fullName' | 'jobTitle' | 'email' | 'status' | 'createdAt' | 'contractStatus' | 'subscriptionModel' | 'industry' | 'customerNo' | 'phoneNumber' | 'crmVerified' | 'name' | 'website' | 'address' | 'accountNumber';
type SortOrder = 'asc' | 'desc';

import { use } from 'react';

export default function CustomersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('customers');
    const tc = useTranslations('common');
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
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [groupBy, setGroupBy] = useState<string | null>(null);
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

    const [pendingChatSession, setPendingChatSession] = useState<{ sessionId: string; customerName: string } | null>(null);
    const [activeChatSession, setActiveChatSession] = useState<{ sessionId: string; customerName: string } | null>(null);
    const [startingChat, setStartingChat] = useState<string | null>(null); // customerId being started

    // Dynamic Table Configuration
    const displaySettings = useMemo(() => {
        const conn = connections.find(c => (c as any).isActive !== false) || connections[0];
        if (!conn?.syncSettings || typeof conn.syncSettings !== 'object') return null;
        const settings = conn.syncSettings as any;
        return settings.displaySettings || null;
    }, [connections]);

    const contactColumns = useMemo(() => {
        const defaultCols = [
            { key: 'customerNo', label: 'table.headers.customer_no', visible: true },
            { key: 'fullName', label: 'table.headers.name', visible: true },
            { key: 'email', label: 'table.headers.email', visible: true },
            { key: 'companyName', label: 'table.headers.company', visible: true },
            { key: 'jobTitle', label: 'table.headers.title', visible: true },
            { key: 'phoneNumber', label: 'table.headers.phone', visible: true },
            { key: 'contractStatus', label: 'table.headers.contractStatus', visible: true },
            { key: 'subscriptionModel', label: 'table.headers.subscriptionModel', visible: true },
            { key: 'industry', label: 'table.headers.industry', visible: true },
            { key: 'status', label: 'table.headers.status', visible: true },
        ];

        if (!displaySettings?.contact || displaySettings.contact.length === 0) return defaultCols;

        // Merge with current definitions to ensure labels are present
        const settings = displaySettings.contact as any[];
        return settings
            .filter(s => s.visible !== false)
            .map(s => ({
                ...s,
                label: defaultCols.find(d => d.key === s.key)?.label || s.key
            }));
    }, [displaySettings]);

    const accountColumns = useMemo(() => {
        const defaultCols = [
            { key: 'accountNumber', label: 'table.headers.customer_no', visible: true },
            { key: 'name', label: 'accounts.structure', visible: true },
            { key: 'industry', label: 'accounts.industry_domain', visible: true },
            { key: 'website', label: 'accounts.website', visible: true },
            { key: 'address', label: 'accounts.address', visible: true },
            { key: 'crmVerified', label: 'accounts.crm_verification', visible: true },
        ];

        if (!displaySettings?.account || displaySettings.account.length === 0) return defaultCols;

        const settings = displaySettings.account as any[];
        return settings
            .filter(s => s.visible !== false)
            .map(s => ({
                ...s,
                label: defaultCols.find(d => d.key === s.key)?.label || s.key
            }));
    }, [displaySettings]);

    const loadCustomers = () => {
        setLoading(true);
        api.customers
            .list()
            .then((data) => {
                setCustomers(data);
                setSelectedIds([]);
            })
            .catch((err: any) => { if (process.env.NODE_ENV === 'development') console.error(err); })
            .finally(() => setLoading(false));
    };

    const loadAccounts = () => {
        setAccountsLoading(true);
        api.crm
            .getAccounts()
            .then(setAccounts)
            .catch((err: any) => { if (process.env.NODE_ENV === 'development') console.error(err); })
            .finally(() => setAccountsLoading(false));
    };

    const loadConnections = () => {
        setConnectionsLoading(true);
        api.crm
            .getConnections()
            .then((conns) => {
                setConnections(conns);
                const isAnySyncing = conns.some((c: any) => c.syncStatus === 'SYNCING');
                if (conns.length > 0) {
                    loadLogs(conns[0].id);
                }
            })
            .catch((err: any) => { if (process.env.NODE_ENV === 'development') console.error(err); })
            .finally(() => setConnectionsLoading(false));
    };

    // Polling logic for sync progress
    useEffect(() => {
        const isSyncing = connections.some(c => c.syncStatus === 'SYNCING');
        let interval: NodeJS.Timeout;

        if (isSyncing) {
            interval = setInterval(() => {
                api.crm.getConnections().then(conns => {
                    setConnections(conns);
                    if (conns.length > 0) {
                        loadLogs(conns[0].id);
                    }
                    const stillSyncing = conns.some((c: any) => c.syncStatus === 'SYNCING');
                    if (!stillSyncing) {
                        clearInterval(interval);
                        loadCustomers();
                        loadAccounts();
                    }
                });
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [connections]);

    const loadLogs = (connectionId: string) => {
        setLogsLoading(true);
        api.crm
            .getLogs(connectionId)
            .then(setLogs)
            .catch((err: any) => { if (process.env.NODE_ENV === 'development') console.error(err); })
            .finally(() => setLogsLoading(false));
    };

    useEffect(() => {
        loadCustomers();
        loadAccounts();
        loadConnections();
    }, []);

    const handleSort = (field: SortField, order?: SortOrder) => {
        if (order) {
            setSortOrder(order);
            setSortField(field);
        } else {
            if (sortField === field) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
                setSortField(field);
                setSortOrder('asc');
            }
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        setColumnFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGroupByChange = (field: string | null) => {
        setGroupBy(field);
        // When grouping, we usually want to sort by that field first
        if (field) {
            setSortField(field as SortField);
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
                toast({ title: '✅ ' + t('toasts.delete_success_title'), description: t('toasts.delete_success_desc', { count: ids.length }) });
                loadAccounts();
                setSelectedAccountIds([]);
            } else {
                await api.customers.bulkDelete(ids);
                toast({ title: '✅ ' + t('toasts.delete_success_title'), description: t('toasts.delete_success_desc', { count: ids.length }) });
                loadCustomers();
                setSelectedIds([]);
            }
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: t('toasts.bulk_update_error', { message: error.message || tc('unknown') }) });
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
            toast({ title: '🔄 ' + t('crm.sync_btn'), description: t('toasts.sync_started') });
            loadConnections();
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: error.message });
        } finally {
            setSyncing(false);
        }
    };

    const handleStartProactiveChat = async (customerId: string, customerName: string) => {
        setStartingChat(customerId);
        try {
            const session = await api.proactiveChat.createSession(customerId);
            setPendingChatSession({ sessionId: session.id, customerName });
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: error.message || tc('unknown') });
        } finally {
            setStartingChat(null);
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
            toast({ title: '✅ ' + tc('success_title'), description: t('toasts.verify_success', { count: emailsToVerify.length }) });
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: error.message });
        } finally {
            setValidating(false);
        }
    };

    const filteredAndSortedCustomers = useMemo(() => {
        let result = [...customers];

        // Global search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.fullName.toLowerCase().includes(lowerTerm) ||
                c.email.toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.companyName || '').toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.customerNo || '').toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.contractStatus || '').toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.subscriptionModel || '').toLowerCase().includes(lowerTerm)
            );
        }

        // Per-column filtering
        Object.entries(columnFilters).forEach(([key, value]) => {
            if (!value) return;
            const lowerValue = value.toLowerCase();
            result = result.filter(c => {
                let fieldValue = '';
                switch (key) {
                    case 'fullName': fieldValue = c.fullName; break;
                    case 'email': fieldValue = c.email; break;
                    case 'companyName': fieldValue = c.customerProfile?.companyName || ''; break;
                    case 'customerNo': fieldValue = c.customerProfile?.customerNo || ''; break;
                    case 'jobTitle': fieldValue = c.customerProfile?.jobTitle || ''; break;
                    case 'contractStatus': fieldValue = c.customerProfile?.contractStatus || ''; break;
                    case 'subscriptionModel': fieldValue = c.customerProfile?.subscriptionModel || ''; break;
                    case 'industry': fieldValue = c.customerProfile?.industry || ''; break;
                    case 'phoneNumber': fieldValue = c.customerProfile?.phoneNumber || ''; break;
                    case 'status': fieldValue = c.status; break;
                }
                return fieldValue.toLowerCase().includes(lowerValue);
            });
        });

        // Sort
        result.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortField) {
                case 'companyName': aValue = a.customerProfile?.companyName || ''; bValue = b.customerProfile?.companyName || ''; break;
                case 'fullName': aValue = a.fullName || ''; bValue = b.fullName || ''; break;
                case 'jobTitle': aValue = a.customerProfile?.jobTitle || ''; bValue = b.customerProfile?.jobTitle || ''; break;
                case 'email': aValue = a.email || ''; bValue = b.email || ''; break;
                case 'status': aValue = a.status || ''; bValue = b.status || ''; break;
                case 'contractStatus': aValue = a.customerProfile?.contractStatus || ''; bValue = b.customerProfile?.contractStatus || ''; break;
                case 'subscriptionModel': aValue = a.customerProfile?.subscriptionModel || ''; bValue = b.customerProfile?.subscriptionModel || ''; break;
                case 'industry': aValue = a.customerProfile?.industry || ''; bValue = b.customerProfile?.industry || ''; break;
                case 'customerNo': aValue = a.customerProfile?.customerNo || ''; bValue = b.customerProfile?.customerNo || ''; break;
                case 'phoneNumber': aValue = a.customerProfile?.phoneNumber || ''; bValue = b.customerProfile?.phoneNumber || ''; break;
                case 'crmVerified': aValue = a.customerProfile?.crmVerified ? 1 : 0; bValue = b.customerProfile?.crmVerified ? 1 : 0; break;
                case 'createdAt': aValue = new Date(a.createdAt).getTime(); bValue = new Date(b.createdAt).getTime(); break;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // Grouping
        if (groupBy && activeTab === 'list') {
            const groups: Record<string, CustomerItem[]> = {};
            result.forEach(item => {
                let groupValue = '';
                switch (groupBy) {
                    case 'status': groupValue = item.status; break;
                    case 'industry': groupValue = item.customerProfile?.industry || tc('unassigned').toUpperCase(); break;
                    case 'contractStatus': groupValue = item.customerProfile?.contractStatus || tc('unassigned').toUpperCase(); break;
                    case 'companyName': groupValue = item.customerProfile?.companyName || tc('unassigned').toUpperCase(); break;
                    default: groupValue = tc('general').toUpperCase();
                }
                if (!groups[groupValue]) groups[groupValue] = [];
                groups[groupValue].push(item);
            });

            const groupedResult: any[] = [];
            Object.entries(groups).forEach(([value, items]) => {
                groupedResult.push({ isGroupHeader: true, value, count: items.length });
                groupedResult.push(...items);
            });
            return groupedResult;
        }

        return result;
    }, [customers, searchTerm, columnFilters, sortField, sortOrder, groupBy, activeTab]);

    const filteredAccounts = useMemo(() => {
        let result = [...accounts];

        // Global search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(a =>
                a.name.toLowerCase().includes(lowerTerm) ||
                (a.industry || '').toLowerCase().includes(lowerTerm) ||
                (a.website || '').toLowerCase().includes(lowerTerm) ||
                (a.address || '').toLowerCase().includes(lowerTerm) ||
                (a.accountNumber || '').toLowerCase().includes(lowerTerm)
            );
        }

        // Per-column filtering
        Object.entries(columnFilters).forEach(([key, value]) => {
            if (!value) return;
            const lowerValue = value.toLowerCase();
            result = result.filter(a => {
                let fieldValue = '';
                switch (key) {
                    case 'name': fieldValue = a.name; break;
                    case 'industry': fieldValue = a.industry || ''; break;
                    case 'accountNumber': fieldValue = a.accountNumber || ''; break;
                    case 'website': fieldValue = a.website || ''; break;
                    case 'address': fieldValue = a.address || ''; break;
                }
                return fieldValue.toLowerCase().includes(lowerValue);
            });
        });

        // Sort
        result.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortField) {
                case 'accountNumber': aValue = a.accountNumber || ''; bValue = b.accountNumber || ''; break;
                case 'name': aValue = a.name || ''; bValue = b.name || ''; break;
                case 'industry': aValue = a.industry || ''; bValue = b.industry || ''; break;
                case 'website': aValue = a.website || ''; bValue = b.website || ''; break;
                case 'address': aValue = a.address || ''; bValue = b.address || ''; break;
                case 'crmVerified': aValue = a.crmVerified ? 1 : 0; bValue = b.crmVerified ? 1 : 0; break;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // Grouping
        if (groupBy && activeTab === 'accounts') {
            const groups: Record<string, AccountItem[]> = {};
            result.forEach(item => {
                let groupValue = '';
                switch (groupBy) {
                    case 'industry': groupValue = item.industry || tc('unassigned').toUpperCase(); break;
                    default: groupValue = tc('general').toUpperCase();
                }
                if (!groups[groupValue]) groups[groupValue] = [];
                groups[groupValue].push(item);
            });

            const groupedResult: any[] = [];
            Object.entries(groups).forEach(([value, items]) => {
                groupedResult.push({ isGroupHeader: true, value, count: items.length });
                groupedResult.push(...items);
            });
            return groupedResult;
        }

        return result;
    }, [accounts, searchTerm, columnFilters, sortField, sortOrder, groupBy, activeTab]);

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
                        {t('title')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-14 font-medium opacity-70">
                        {t('subtitle')}
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
                            {deleting ? t('actions.deleting') : t('actions.delete_selected', { count: activeTab === 'accounts' ? selectedAccountIds.length : selectedIds.length })}
                        </Button>
                    )}
                    <Button
                        onClick={handleBulkVerify}
                        disabled={loading || validating || (selectedIds.length === 0 && filteredAndSortedCustomers.length === 0)}
                        className="h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20"
                    >
                        {validating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        {selectedIds.length > 0 ? t('actions.verify_selected', { count: selectedIds.length }) : t('actions.verify_emails')}
                    </Button>
                    <Button
                        asChild
                        disabled={loading}
                        className="h-9 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                    >
                        <Link href="/customers/import">
                            <Upload className="mr-2 h-4 w-4" />
                            {t('actions.import')}
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-8" onValueChange={setActiveTab}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                    <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-11 shrink-0">
                        <TabsTrigger value="list" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            {t('tabs.customers')}
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            {t('tabs.accounts')}
                        </TabsTrigger>
                        <TabsTrigger value="sync" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            {t('tabs.sync')}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                            {t('tabs.history')}
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
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
                                    {contactColumns.map(col => (
                                        <DataTableHeader
                                            key={col.key}
                                            columnKey={col.key}
                                            label={t(col.label)}
                                            currentSortField={sortField}
                                            currentSortOrder={sortOrder}
                                            onSort={handleSort as any}
                                            onGroupBy={handleGroupByChange}
                                            isGrouped={groupBy === col.key}
                                            onFilterChange={handleFilterChange}
                                            currentFilterValue={columnFilters[col.key]}
                                        />
                                    ))}
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={contactColumns.length + 2} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t('table.loading')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAndSortedCustomers.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={contactColumns.length + 2} className="py-20 text-center opacity-30">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t('table.empty')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedCustomers.map((c: any, idx: number) => {
                                        if (c.isGroupHeader) {
                                            return (
                                                <TableRow key={`group-${c.value}-${idx}`} className="bg-blue-500/[0.03] border-white/5 hover:bg-blue-500/[0.05] transition-colors h-12">
                                                    <TableCell colSpan={contactColumns.length + 2} className="px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20">
                                                                <Layers className="h-3 w-3 text-blue-500" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                                                                {c.value.toUpperCase()}
                                                            </span>
                                                            <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-bold px-1.5 h-4">
                                                                {c.count} {t('labels.items')}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }

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

                                                {contactColumns.map(col => {
                                                    switch (col.key) {
                                                        case 'customerNo':
                                                            return (
                                                                <TableCell key={col.key} className="text-white/40 font-mono text-[10px] whitespace-nowrap">
                                                                    {c.customerProfile?.customerNo || tc('unassigned').toUpperCase()}
                                                                </TableCell>
                                                            );
                                                        case 'fullName':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    <Link href={`/customers/${c.id}`} className="font-bold text-white hover:text-blue-400 underline-offset-4 hover:underline transition-colors block">
                                                                        {c.fullName}
                                                                    </Link>
                                                                </TableCell>
                                                            );
                                                        case 'email':
                                                            return (
                                                                <TableCell key={col.key} className="text-white/60 font-mono text-[11px]">
                                                                    <div className="flex items-center gap-2">
                                                                        {c.email}
                                                                        {validationResults[c.email] && (
                                                                            <div title={`${t('labels.score')}: ${validationResults[c.email].score}`}>
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
                                                            );
                                                        case 'companyName':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    {c.customerProfile?.account ? (
                                                                        <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[9px] font-bold px-2 py-0.5">
                                                                            <Building2 className="h-3 w-3 mr-1" />
                                                                            {c.customerProfile.account.name}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-white/40 italic text-xs">{c.customerProfile?.companyName || '-'}</span>
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        case 'jobTitle':
                                                            return <TableCell key={col.key} className="text-white/60 text-xs font-medium">{c.customerProfile?.jobTitle || '-'}</TableCell>;
                                                        case 'phoneNumber':
                                                            return <TableCell key={col.key} className="text-white/60 font-mono text-[11px]">{c.customerProfile?.phoneNumber || '-'}</TableCell>;
                                                        case 'contractStatus':
                                                            return <TableCell key={col.key} className="text-white/60 text-xs font-medium">{c.customerProfile?.contractStatus || '-'}</TableCell>;
                                                        case 'subscriptionModel':
                                                            return <TableCell key={col.key} className="text-white/60 text-xs font-medium">{c.customerProfile?.subscriptionModel || '-'}</TableCell>;
                                                        case 'industry':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold text-white/50 border border-white/5">
                                                                        {c.customerProfile?.industry || t('labels.general')}
                                                                    </span>
                                                                </TableCell>
                                                            );
                                                        case 'status':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    <Badge className={`${c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'} border-none text-[9px] font-black tracking-widest px-2 py-0.5`}>
                                                                        {(() => {
                                                                            const status = c.status?.toLowerCase();
                                                                            const labelKey = `labels.${status}`;
                                                                            return t.has(labelKey) ? t(labelKey) : c.status;
                                                                        })()}
                                                                    </Badge>
                                                                </TableCell>
                                                            );
                                                        default:
                                                            return <TableCell key={col.key} className="text-white/40 text-xs">-</TableCell>;
                                                    }
                                                })}

                                                <TableCell className="px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-green-500/10 hover:text-green-500 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Proaktif Chat Başlat"
                                                            disabled={startingChat === c.id}
                                                            onClick={() => handleStartProactiveChat(c.id, c.fullName)}
                                                        >
                                                            {startingChat === c.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MessageCircle className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground">
                                                            <Link href={`/customers/${c.id}`}><ChevronRight className="h-4 w-4" /></Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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
                                    {accountColumns.map(col => (
                                        <DataTableHeader
                                            key={col.key}
                                            columnKey={col.key}
                                            label={t(col.label)}
                                            currentSortField={sortField}
                                            currentSortOrder={sortOrder}
                                            onSort={handleSort as any}
                                            onGroupBy={handleGroupByChange}
                                            isGrouped={groupBy === col.key}
                                            onFilterChange={handleFilterChange}
                                            currentFilterValue={columnFilters[col.key]}
                                        />
                                    ))}
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 text-right pr-6">{t('table.headers.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountsLoading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={accountColumns.length + 2} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAccounts.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={accountColumns.length + 2} className="py-20 text-center opacity-30">
                                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t('table.empty')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAccounts.map((a: any, idx: number) => {
                                        if (a.isGroupHeader) {
                                            return (
                                                <TableRow key={`group-acc-${a.value}-${idx}`} className="bg-amber-500/[0.03] border-white/5 hover:bg-amber-500/[0.05] transition-colors h-12">
                                                    <TableCell colSpan={accountColumns.length + 2} className="px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                                                                <Layers className="h-3 w-3 text-amber-500" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                                                                {a.value.toUpperCase()}
                                                            </span>
                                                            <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-bold px-1.5 h-4">
                                                                {a.count} {t('labels.items')}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }

                                        return (
                                            <TableRow key={a.id} className="group border-white/5 hover:bg-white/[0.02] transition-colors h-16">
                                                <TableCell className="px-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAccountIds.includes(a.id)}
                                                        onChange={(e) => handleSelectOneAccount(a.id, e.target.checked)}
                                                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                                                    />
                                                </TableCell>

                                                {accountColumns.map(col => {
                                                    switch (col.key) {
                                                        case 'accountNumber':
                                                            return <TableCell key={col.key} className="text-white/40 font-mono text-[10px]">{a.accountNumber || tc('unassigned').toUpperCase()}</TableCell>;
                                                        case 'name':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Link href={`/customers/accounts/${a.id}`} className="font-bold text-white hover:text-blue-400 underline-offset-4 hover:underline transition-colors block">
                                                                            {a.name}
                                                                        </Link>
                                                                        {a.crmVerified && <ShieldCheck className="h-3 w-3 text-blue-500" />}
                                                                    </div>
                                                                </TableCell>
                                                            );
                                                        case 'industry':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold text-white/50 border border-white/5">
                                                                        {a.industry || t('labels.general')}
                                                                    </span>
                                                                </TableCell>
                                                            );
                                                        case 'website':
                                                            return (
                                                                <TableCell key={col.key}>
                                                                    {a.website ? (
                                                                        <a href={a.website.startsWith('http') ? a.website : `https://${a.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:text-blue-300 text-[10px] font-medium transition-colors">
                                                                            <Globe className="h-3 w-3 mr-1.5" />
                                                                            {a.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                                            <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-white/20">-</span>
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        case 'address':
                                                            return <TableCell key={col.key} className="text-white/40 text-[10px] max-w-[200px] truncate">{a.address || '-'}</TableCell>;
                                                        case 'crmVerified':
                                                            return <TableCell key={col.key} className="text-white/60 text-[10px] font-bold">{a._count?.customers || 0} {t('labels.items')}</TableCell>;
                                                        default:
                                                            return <TableCell key={col.key} className="text-white/40 text-xs">-</TableCell>;
                                                    }
                                                })}

                                                <TableCell className="px-6 text-right">
                                                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground">
                                                        <Link href={`/customers/accounts/${a.id}`}><ChevronRight className="h-4 w-4" /></Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="sync" className="space-y-6">
                    <AnimatePresence mode="wait">
                        {connectionsLoading ? (
                            <div className="flex items-center justify-center py-20 text-muted-foreground font-mono text-[10px] uppercase tracking-widest italic animate-pulse">
                                {t('sync.checking')}
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
                                <h3 className="text-xl font-bold mb-2 text-white">{t('sync.no_integration')}</h3>
                                <p className="text-muted-foreground text-center max-w-md mb-8 text-sm font-medium">
                                    {t('sync.no_integration_desc')}
                                </p>
                                <Button asChild className="h-12 px-8 bg-blue-600 hover:bg-blue-500 font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-blue-500/10">
                                    <Link href="/customers/crm">{t('sync.configure_btn')}</Link>
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
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black tracking-[0.2em] px-2">{t('labels.active')}</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500 border-white/10 text-[8px] font-black tracking-[0.2em] px-2">{t('labels.passive')}</Badge>
                                                    )}
                                                    {conn.syncStatus === 'SYNCING' && (
                                                        <Badge className="bg-blue-500/10 text-blue-400 animate-pulse border-none text-[8px] font-black tracking-[0.2em] px-2">{t('labels.syncing')}</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">{t('sync.last_transfer')}</p>
                                                        <p className="text-sm font-bold text-white">
                                                            {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString(locale) : t('sync.last_transfer_none')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-2">{t('sync.system_status')}</p>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-bold text-blue-400 font-mono">{conn.syncStatus || 'IDLE'}</p>
                                                            {conn.syncStatus === 'SYNCING' && logs.length > 0 && (
                                                                <div className="flex-1 max-w-[200px] flex flex-col gap-1.5">
                                                                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-white/40">
                                                                        <span>{t('sync.progress')}</span>
                                                                        <span>{Math.round(((logs[0].successCount + logs[0].errorCount) / Math.max(1, logs[0].totalRecords)) * 100)}%</span>
                                                                    </div>
                                                                    <Progress
                                                                        value={((logs[0].successCount + logs[0].errorCount) / Math.max(1, logs[0].totalRecords)) * 100}
                                                                        className="h-1.5 bg-white/5 border-none"
                                                                    />
                                                                    <div className="flex justify-between text-[9px] font-medium text-white/60">
                                                                        <span className="flex items-center gap-1">
                                                                            <Check className="h-2 w-2 text-emerald-500" />
                                                                            {logs[0].successCount}
                                                                        </span>
                                                                        {logs[0].errorCount > 0 && (
                                                                            <span className="flex items-center gap-1">
                                                                                <AlertCircle className="h-2 w-2 text-rose-500" />
                                                                                {logs[0].errorCount}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-white/30">{logs[0].totalRecords} {t('labels.total')}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-end items-end gap-3">
                                                    <Button
                                                        onClick={() => handleSync(conn.id)}
                                                        disabled={syncing || conn.syncStatus === 'SYNCING'}
                                                        className="w-full h-11 bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-[10px] font-bold uppercase tracking-widest transition-all"
                                                    >
                                                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing || conn.syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                                                        {t('sync.trigger_sync')}
                                                    </Button>
                                                    <Button asChild variant="ghost" className="text-[9px] font-bold text-muted-foreground hover:text-white group">
                                                        <Link href="/customers/crm">
                                                            {t('sync.edit_settings')} <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
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
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 px-6">{t('labels.created_at')}</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">{t('labels.status')}</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4">{t('labels.total')}</TableHead>
                                    <TableHead className="font-bold text-[10px] text-emerald-500/70 uppercase py-4 tracking-widest">{t('labels.passed')}</TableHead>
                                    <TableHead className="font-bold text-[10px] text-rose-500/70 uppercase py-4 tracking-widest">{t('labels.failed')}</TableHead>
                                    <TableHead className="font-bold text-[10px] text-muted-foreground uppercase py-4 pr-6">{t('labels.system_info')}</TableHead>
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
                                            <p className="text-[10px] font-bold uppercase tracking-widest">{t('history.no_data')}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.01]">
                                            <TableCell className="font-mono text-[11px] text-white/50 px-6">
                                                {new Date(log.startedAt).toLocaleString(locale)}
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
                                                    <Badge variant="outline" className="animate-pulse border-blue-500/20 text-blue-400 text-[9px]">{t('labels.pending')}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-bold text-white/80">{log.totalRecords}</TableCell>
                                            <TableCell className="text-emerald-500 font-mono text-[11px]">{log.successCount}</TableCell>
                                            <TableCell className="text-rose-500 font-mono text-[11px]">{log.errorCount}</TableCell>
                                            <TableCell className="text-[10px] text-white/20 font-mono italic max-w-[200px] truncate pr-6" title={log.errorMessage}>
                                                {log.errorMessage || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Proactive Chat Pending Badge */}
            {pendingChatSession && (
                <div className="fixed bottom-6 right-6 z-50 w-80">
                    <ProactiveChatPendingBadge
                        sessionId={pendingChatSession.sessionId}
                        customerName={pendingChatSession.customerName}
                        onAccepted={(sessionId) => {
                            setActiveChatSession({ sessionId, customerName: pendingChatSession.customerName });
                            setPendingChatSession(null);
                        }}
                        onClose={() => setPendingChatSession(null)}
                    />
                </div>
            )}

            {/* Proactive Chat Window */}
            {activeChatSession && (
                <ProactiveChatWindow
                    sessionId={activeChatSession.sessionId}
                    currentUserId=""
                    isAgent={true}
                    otherPartyName={activeChatSession.customerName}
                    onClose={() => setActiveChatSession(null)}
                />
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title={t('confirm.delete_title')}
                description={t('confirm.delete_desc', { count: activeTab === 'accounts' ? selectedAccountIds.length : selectedIds.length })}
                confirmText={t('confirm.delete_confirm')}
                cancelText={t('confirm.cancel')}
                variant="danger"
                loading={deleting}
            />
        </motion.div>
    );
}


