'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Database, Globe, FileText, RefreshCw,
    History, CheckCircle2, XCircle, Clock, Search,
    FileIcon, ArrowUpCircle, MousePointer2,
    ChevronDown, ChevronUp, ChevronsUpDown, PlayCircle, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

type SortField = 'name' | 'status' | 'type' | 'lastSyncedAt' | 'embeddings' | 'category';
type SortDir = 'asc' | 'desc';

export default function KnowledgePoolPage() {
    const t = useTranslations('admin.knowledge_pool');
    const [activeTab, setActiveTab] = useState('sources');

    // Sources State
    const [sources, setSources] = useState<any[]>([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [activeSource, setActiveSource] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);

    // Table state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSyncing, setIsSyncing] = useState<Set<string>>(new Set());
    const [isBulkSyncing, setIsBulkSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortField, setSortField] = useState<SortField>('lastSyncedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Articles State
    const [articles, setArticles] = useState<any[]>([]);
    const [totalArticles, setTotalArticles] = useState(0);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [articleSearch, setArticleSearch] = useState('');
    const [articlePage, setArticlePage] = useState(1);
    const [hasMoreArticles, setHasMoreArticles] = useState(false);
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
    const [isPublishing, setIsPublishing] = useState(false);
    const [articleStatusFilter, setArticleStatusFilter] = useState<string>('');

    const { toast } = useToast();

    const [urlName, setUrlName] = useState('');
    const [urlAddress, setUrlAddress] = useState('');
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

    const loadSources = async () => {
        setLoadingSources(true);
        try {
            const data = await api.pool.list();
            setSources(data);
        } catch {
            toast({ title: t('logs.error'), description: t('toasts.fetch_error'), variant: 'destructive' });
        } finally {
            setLoadingSources(false);
        }
    };

    const loadArticles = async (page = 1) => {
        setLoadingArticles(true);
        try {
            const params: Record<string, string> = { limit: '50', page: page.toString() };
            if (articleStatusFilter) params.status = articleStatusFilter;
            if (articleSearch) params.search = articleSearch;
            const res = await api.kb.list(params);
            if (res && res.data) {
                if (page === 1) setArticles(res.data);
                else setArticles(prev => [...prev, ...res.data]);
                setTotalArticles(res.total || 0);
                setHasMoreArticles((page - 1) * 50 + (res.data.length || 0) < (res.total || 0));
            } else {
                setArticles(res as unknown as Array<unknown> || []);
                setTotalArticles((res as unknown as Array<unknown>)?.length || 0);
                setHasMoreArticles(false);
            }
        } catch { /* handled */ }
        setLoadingArticles(false);
    };

    useEffect(() => {
        if (activeTab === 'sources') loadSources();
        if (activeTab === 'articles') { setArticlePage(1); loadArticles(1); }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'articles') { setArticlePage(1); loadArticles(1); }
    }, [articleStatusFilter]);

    // ── Filtered + sorted sources ──────────────────────────────────────────
    const filteredSources = sources
        .filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.fileName || '').toLowerCase().includes(search.toLowerCase()) ||
                (s.url || '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = !statusFilter || s.status === statusFilter;
            const matchType = !typeFilter || (typeFilter === 'URL' ? s.type === 'URL' : s.type !== 'URL');
            return matchSearch && matchStatus && matchType;
        })
        .sort((a, b) => {
            let av: any, bv: any;
            if (sortField === 'name') { av = a.name; bv = b.name; }
            else if (sortField === 'status') { av = a.status; bv = b.status; }
            else if (sortField === 'type') { av = a.type; bv = b.type; }
            else if (sortField === 'lastSyncedAt') { av = a.lastSyncedAt || ''; bv = b.lastSyncedAt || ''; }
            else if (sortField === 'embeddings') { av = a._count?.embeddings || 0; bv = b._count?.embeddings || 0; }
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    const allFilteredSelected = filteredSources.length > 0 && filteredSources.every(s => selectedIds.has(s.id));
    const someSelected = selectedIds.size > 0;

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
        return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            if (n.has(id)) { n.delete(id) } else { n.add(id) };
            return n;
        });
    };

    const toggleSelectAll = () => {
        if (allFilteredSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredSources.map(s => s.id)));
    };

    const handleSync = async (id: string) => {
        try {
            setIsSyncing(prev => new Set(prev).add(id));
            await api.pool.sync(id);
            toast({ title: t('sync.started'), description: t('sync.started_desc'), variant: 'default' });
            loadSources(); 
        } catch (error) {
            toast({ title: t('sync.failed'), description: t('sync.failed_desc'), variant: 'destructive' });
        } finally {
            setIsSyncing(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to completely delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await api.pool.delete(id);
            toast({ title: 'Deleted', description: `Successfully deleted "${name}"`, variant: 'default' });
            setSources(prev => prev.filter(s => s.id !== id));
            setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        } catch (error: any) {
            toast({ title: 'Delete Failed', description: error.message || 'Something went wrong', variant: 'destructive' });
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to completely delete ${selectedIds.size} items? This action cannot be undone.`)) {
            return;
        }

        try {
            const ids = Array.from(selectedIds);
            const res = await api.pool.bulkDelete(ids);
            toast({ title: 'Deleted', description: `Successfully deleted ${res.count} items`, variant: 'default' });
            setSources(prev => prev.filter(s => !ids.includes(s.id)));
            setSelectedIds(new Set());
        } catch (error: any) {
            toast({ title: 'Bulk Delete Failed', description: error.message || 'Something went wrong', variant: 'destructive' });
        }
    };

    const handleBulkSync = async () => {
        if (selectedIds.size === 0) return;
        setIsBulkSyncing(true);
        const ids = Array.from(selectedIds);
        let ok = 0, fail = 0;
        
        // Process in chunks of 5 to avoid overwhelming the browser/backend
        const chunkSize = 5;
        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunk = ids.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (id) => {
                try { 
                    await api.pool.sync(id); 
                    ok++; 
                } catch { 
                    fail++; 
                }
            }));
        }
        toast({
            title: fail === 0 ? t('toasts.bulk_sync_started') : t('toasts.partial_success'),
            description: t('toasts.bulk_sync_desc', { count: ok }) + (fail > 0 ? `, ${t('toasts.bulk_sync_error', { count: fail })}` : ''),
            variant: fail > 0 ? 'destructive' : 'default',
        });
        setIsBulkSyncing(false);
        setSelectedIds(new Set());
        loadSources();
    };

    const handleDatasetSync = async () => {
        try {
            toast({ title: t('toasts.dataset_scan_started'), description: t('toasts.dataset_scan_desc') });
            const res = await api.pool.syncDataset();

            if (res && res.success === false) {
                toast({ title: t('logs.error'), description: res.message || 'Dataset scan failed', variant: 'destructive' });
                return;
            }

            toast({ title: t('toasts.dataset_sync_success'), description: res?.message || t('toasts.dataset_sync_success') });
            loadSources();
        } catch (err: any) {
            toast({ title: t('logs.error'), description: err.message, variant: 'destructive' });
        }
    };

    const handleAddUrl = async () => {
        if (!urlName || !urlAddress) return;
        try {
            await api.pool.addUrl(urlName, urlAddress);
            toast({ title: t('logs.success'), description: t('toasts.url_added') });
            setIsUrlModalOpen(false);
            setUrlName(''); setUrlAddress('');
            loadSources();
        } catch (err: any) {
            toast({ title: t('logs.error'), description: err.message, variant: 'destructive' });
        }
    };

    const viewLogs = async (source: any) => {
        setActiveSource(source);
        try {
            const data = await api.pool.logs(source.id);
            setLogs(data);
        } catch {
            toast({ title: t('logs.error'), description: t('toasts.logs_error'), variant: 'destructive' });
        }
    };

    const handleBulkPublish = async () => {
        if (selectedArticleIds.size === 0) return;
        setIsPublishing(true);
        let ok = 0, fail = 0;
        for (const id of Array.from(selectedArticleIds)) {
            try { await api.kb.review(id, true); ok++; }
            catch { fail++; }
        }
        toast({
            title: fail === 0 ? t('logs.success') : t('toasts.partial_success'),
            description: t('toasts.publish_success', { count: ok }) + (fail > 0 ? `, ${t('toasts.bulk_sync_error', { count: fail })}` : ''),
            variant: fail > 0 ? 'destructive' : 'default',
        });
        setIsPublishing(false);
        setSelectedArticleIds(new Set());
        setArticlePage(1);
        loadArticles(1);
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
            SYNCING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
            FAILED: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
            INACTIVE: 'bg-muted/20 text-muted-foreground border-border/30',
        };
        return (
            <Badge variant="outline" className={`text-[10px] font-mono rounded-none px-1.5 ${map[status] || 'bg-muted/20 text-muted-foreground'}`}>
                {status === 'SYNCING' && <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin inline" />}
                {status}
            </Badge>
        );
    };

    return (
        <div className="p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* ── Header ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[16px] md:text-[18px] font-bold tracking-tight text-foreground uppercase truncate">{t('title')}</h1>
                        <p className="text-[10px] md:text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{t('subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <TabsList className="bg-muted/10 border border-border/40 h-9">
                            <TabsTrigger value="sources" className="text-[10px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.raw_sources')}</TabsTrigger>
                            <TabsTrigger value="articles" className="text-[10px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.seeded_content')}</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary text-primary-foreground h-8 text-[10px] uppercase font-bold tracking-widest gap-2">
                                        <Globe className="h-3 w-3" /> {t('buttons.add_url')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader><DialogTitle>{t('dialogs.new_url')}</DialogTitle></DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>{t('dialogs.name_label')}</Label>
                                            <Input value={urlName} onChange={e => setUrlName(e.target.value)} placeholder={t('placeholder')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('dialogs.url_label')}</Label>
                                            <Input value={urlAddress} onChange={e => setUrlAddress(e.target.value)} placeholder="https://example.com/docs" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddUrl} className="w-full">{t('dialogs.save_sync')}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Link href="/knowledge-pool/upload">
                                <Button variant="outline" className="h-8 border-border/60 text-[10px] uppercase font-bold tracking-widest gap-2 bg-muted/20">
                                    <FileText className="h-3 w-3" /> {t('buttons.upload_file')}
                                </Button>
                            </Link>
                            <Button onClick={handleDatasetSync} variant="outline" className="h-8 border-primary/40 text-[10px] uppercase font-bold tracking-widest gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
                                <Database className="h-3 w-3" /> {t('buttons.scan_dataset')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    SOURCES TAB — Table view with multi-select + bulk sync
                ══════════════════════════════════════════════════════════ */}
                <TabsContent value="sources" className="mt-0">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="xl:col-span-2 space-y-3">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 max-w-sm">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                        <Input
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder={t('articles.search_placeholder')}
                                            className="pl-8 h-8 text-[11px] bg-muted/10 border-border/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Status filter */}
                                    {['', 'ACTIVE', 'SYNCING', 'FAILED'].map(s => (
                                        <button key={s} onClick={() => setStatusFilter(s)}
                                            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border rounded transition-all ${statusFilter === s ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}>
                                            {s || t('filters.all')}
                                        </button>
                                    ))}
                                    <div className="w-px h-4 bg-border/40 mx-1" />
                                    {/* Type filter */}
                                    {[{ v: '', l: t('filters.all_types') }, { v: 'URL', l: t('filters.url') }, { v: 'FILE', l: t('filters.file') }].map(f => (
                                        <button key={f.v} onClick={() => setTypeFilter(f.v)}
                                            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border rounded transition-all ${typeFilter === f.v ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}>
                                            {f.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bulk action bar */}
                            {someSelected && (
                                <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border border-primary/20 rounded">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                        {t('articles.select_page', { count: selectedIds.size }).replace('PAGE', 'SOURCE')}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleBulkSync} disabled={isBulkSyncing}
                                            className="h-7 text-[10px] uppercase font-bold tracking-widest gap-1.5">
                                            {isBulkSyncing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
                                            {t('buttons.bulk_sync', { count: selectedIds.size })}
                                        </Button>
                                        <Button size="sm" onClick={handleBulkDelete} variant="destructive"
                                            className="h-7 text-[10px] uppercase font-bold tracking-widest gap-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/30">
                                            <Trash2 className="h-3 w-3" />
                                            DELETE
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}
                                            className="h-7 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                            {t('buttons.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            <div className="border border-border/50 rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/40">
                                            <TableHead className="w-10 pl-3">
                                                <input
                                                    type="checkbox"
                                                    checked={allFilteredSelected}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 cursor-pointer accent-primary"
                                                    aria-label={t('table.select_all')}
                                                />
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('name')}>
                                                <span className="flex items-center gap-1">{t('table.source')} <SortIcon field="name" /></span>
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none w-24" onClick={() => toggleSort('type')}>
                                                <span className="flex items-center gap-1">{t('table.type')} <SortIcon field="type" /></span>
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none w-32" onClick={() => toggleSort('category')}>
                                                <span className="flex items-center gap-1">Kategori <SortIcon field="category" /></span>
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none w-28" onClick={() => toggleSort('status')}>
                                                <span className="flex items-center gap-1">{t('table.status')} <SortIcon field="status" /></span>
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none w-24 text-right" onClick={() => toggleSort('embeddings')}>
                                                <span className="flex items-center justify-end gap-1">{t('table.vector')} <SortIcon field="embeddings" /></span>
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none w-32" onClick={() => toggleSort('lastSyncedAt')}>
                                                <span className="flex items-center gap-1">{t('table.last_sync')} <SortIcon field="lastSyncedAt" /></span>
                                            </TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase tracking-widest w-24 text-right pr-3">{t('table.action')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingSources ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-16">
                                                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredSources.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                                                    <Database className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                                    <p className="text-[10px] uppercase font-mono tracking-widest">{t('table.no_records')}</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredSources.map(source => (
                                            <TableRow key={source.id}
                                                className={`border-b border-border/20 hover:bg-muted/5 transition-none ${selectedIds.has(source.id) ? 'bg-primary/5' : ''}`}>
                                                <TableCell className="pl-3 w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(source.id)}
                                                        onChange={() => toggleSelect(source.id)}
                                                        className="w-4 h-4 cursor-pointer accent-primary"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`h-7 w-7 border flex items-center justify-center shrink-0 ${source.type === 'URL' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'}`}>
                                                            {source.type === 'URL' ? <Globe className="h-3.5 w-3.5" /> : <FileIcon className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[12px] leading-tight truncate max-w-[200px]">{source.name}</p>
                                                            <p className="text-[10px] text-muted-foreground/50 font-mono truncate max-w-[200px] mt-0.5">
                                                                {source.type === 'URL' ? source.url : source.fileName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-24">
                                                    <Badge variant="outline" className={`text-[10px] font-mono rounded-none px-1.5 ${source.type === 'URL' ? 'border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/5' : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/5'}`}>
                                                        {source.type === 'URL' ? 'URL' : source.type?.replace('FILE_', '') || t('filters.file')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="w-32">
                                                    <span className="text-[10px] font-mono font-medium truncate block w-28" title={(source.metadata as any)?.category || 'General'}>
                                                        {(source.metadata as any)?.category || 'General'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-28">{statusBadge(source.status)}</TableCell>
                                                <TableCell className="w-24 text-right">
                                                    <span className="text-[11px] font-mono text-muted-foreground">{source._count?.embeddings ?? 0}</span>
                                                </TableCell>
                                                <TableCell className="w-32">
                                                    <span className="text-[10px] font-mono text-muted-foreground/60">
                                                        {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleDateString(t('meta.locale')) : '—'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-24 pr-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => handleSync(source.id)} 
                                                            disabled={isSyncing.has(source.id) || source.status === 'SYNCING'}>
                                                            <RefreshCw className={`h-3.5 w-3.5 ${(isSyncing.has(source.id) || source.status === 'SYNCING') ? 'animate-spin' : ''}`} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => viewLogs(source)}>
                                                            <History className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-red-500/10 hover:text-red-500"
                                                            onClick={() => handleDelete(source.id, source.name)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Footer count */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/50 uppercase px-1">
                                <span>{filteredSources.length} / {sources.length} {t('table.source')} {t('table.showing')}</span>
                                {someSelected && <span className="text-primary">{selectedIds.size} {t('articles.select_page', { count: selectedIds.size }).replace('PAGE', 'SELECTED').split(' ')[0]}</span>}
                            </div>
                        </div>

                        {/* ── Logs Sidebar ── */}
                        <div className="space-y-4">
                            <div className="border border-border/60 rounded-md min-h-[400px] overflow-hidden">
                                <div className="py-2.5 px-3 bg-muted/10 border-b border-border/40 flex items-center gap-2">
                                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">{t('logs.title')}</span>
                                    {activeSource && (
                                        <span className="ml-auto text-primary font-mono text-[10px] uppercase truncate max-w-[120px]">{activeSource.name}</span>
                                    )}
                                </div>
                                {!activeSource ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground opacity-30">
                                        <MousePointer2 className="h-8 w-8 mb-4" />
                                        <p className="text-[10px] uppercase font-mono tracking-widest">{t('logs.no_source')}</p>
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground font-mono text-[10px] uppercase opacity-40">{t('logs.no_logs')}</div>
                                ) : (
                                    <div className="divide-y divide-border/20 max-h-[600px] overflow-auto">
                                        {logs.map(log => (
                                            <div key={log.id} className="p-3 space-y-1.5 hover:bg-muted/10">
                                                <div className="flex items-center justify-between">
                                                    {log.status === 'SUCCESS' ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase"><CheckCircle2 className="h-2.5 w-2.5" /> {t('logs.success')}</span>
                                                    ) : log.status === 'FAILED' ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase"><XCircle className="h-2.5 w-2.5" /> {t('logs.error')}</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase animate-pulse"><Clock className="h-2.5 w-2.5" /> {t('logs.processing')}</span>
                                                    )}
                                                    <span className="text-[10px] font-mono text-muted-foreground/60">{new Date(log.syncStartedAt).toLocaleString(t('meta.locale'))}</span>
                                                </div>
                                                <p className="text-[10px] text-foreground/70 font-mono leading-tight uppercase">
                                                    {log.status === 'SUCCESS' ? t('logs.chunks_processed', { count: log.chunksProcessed }) : log.status === 'FAILED' ? log.error : t('logs.processing') + '...'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* ══════════════════════════════════════════════════════════
                    ARTICLES TAB — unchanged logic, same UI
                ══════════════════════════════════════════════════════════ */}
                <TabsContent value="articles" className="mt-0">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/20">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[12px] font-bold uppercase tracking-widest">{t('articles.title')}</h2>
                                <Badge className="bg-primary/10 text-primary font-mono">{t('articles.total', { count: totalArticles })}</Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                                <form onSubmit={e => { e.preventDefault(); setArticlePage(1); loadArticles(1); }} className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                                    <input value={articleSearch} onChange={e => setArticleSearch(e.target.value)}
                                        placeholder={t('articles.search_placeholder')} className="w-full pl-9 pr-4 py-1.5 border border-border/60 bg-black/20 text-[11px] uppercase tracking-tight text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-8" />
                                </form>
                                <Button onClick={() => { setArticlePage(1); loadArticles(1); }} className="h-8 text-[10px] uppercase font-bold tracking-widest bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground">
                                    <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loadingArticles && articlePage === 1 ? 'animate-spin' : ''}`} /> {t('buttons.refresh')}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {[{ value: '', label: t('articles.all') }, { value: 'REVIEW', label: t('articles.review') }, { value: 'PUBLISHED', label: t('articles.published') }, { value: 'DRAFT', label: t('articles.draft') }].map(f => (
                                <button key={f.value} onClick={() => setArticleStatusFilter(f.value)}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded transition-all ${articleStatusFilter === f.value ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {articles.length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-muted/10 border border-border/20 rounded-md">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox"
                                        checked={selectedArticleIds.size === articles.length && articles.length > 0}
                                        onChange={() => selectedArticleIds.size === articles.length ? setSelectedArticleIds(new Set()) : setSelectedArticleIds(new Set(articles.map((a: any) => a.id)))}
                                        className="w-4 h-4 cursor-pointer accent-primary" />
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t('articles.select_page', { count: selectedArticleIds.size })}</span>
                                </div>
                                {selectedArticleIds.size > 0 && (
                                    <Button onClick={handleBulkPublish} disabled={isPublishing} size="sm"
                                        className="h-7 text-[10px] uppercase font-bold bg-primary text-primary-foreground gap-1.5">
                                        {isPublishing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                        {t('buttons.publish_selected')}
                                    </Button>
                                )}
                            </div>
                        )}

                        {loadingArticles && articlePage === 1 ? (
                            <div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
                        ) : articles.length === 0 ? (
                            <div className="border border-border/40 bg-muted/5 p-12 flex flex-col items-center justify-center text-center">
                                <FileText className="h-8 w-8 text-muted-foreground/30 mb-4" />
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('articles.no_records')}</h3>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/20 border-t border-b border-border/40 bg-card rounded-md">
                                {articles.map((a: any) => (
                                    <div key={a.id} className={`group flex flex-col md:flex-row md:items-center justify-between px-4 py-3 hover:bg-muted/10 gap-4 ${selectedArticleIds.has(a.id) ? 'bg-primary/5' : ''}`}>
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <input type="checkbox" checked={selectedArticleIds.has(a.id)}
                                                onChange={() => setSelectedArticleIds(prev => { const n = new Set(prev); if (n.has(a.id)) { n.delete(a.id) } else { n.add(a.id) }; return n; })}
                                                className="w-4 h-4 cursor-pointer accent-primary shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2.5 mb-1 text-[10px] font-mono uppercase">
                                                    <Badge className={`px-1.5 py-0 h-4 border ${a.status === 'PUBLISHED' ? 'border-green-900/50 text-green-700 dark:text-green-400 bg-green-400/5' : a.status === 'DRAFT' ? 'border-amber-900/50 text-amber-700 dark:text-amber-400 bg-amber-400/5' : 'border-orange-900/50 text-orange-700 dark:text-orange-400 bg-orange-400/5'}`}>
                                                        {t(`status_labels.${(a.status || 'DRAFT').toLowerCase()}`)}
                                                    </Badge>
                                                    {a.tags?.map((t: string) => <span key={t} className="text-muted-foreground/40">#{t.toUpperCase()}</span>)}
                                                </div>
                                                <Link href={`/knowledge-base/${a.id}`} className="group-hover:text-primary">
                                                    <p className="font-bold text-foreground text-[14px] leading-tight tracking-tight truncate">{a.title}</p>
                                                </Link>
                                                <div className="flex items-center gap-4 mt-1 text-[10px] font-mono uppercase text-muted-foreground/60">
                                                    <span>{t('articles.author')}: {a.creator?.fullName || t('meta.system')}</span>
                                                    <span>{new Date(a.createdAt).toLocaleDateString(t('meta.locale'))}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <Link href={`/knowledge-base/${a.id}`}>
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/5 hover:bg-primary hover:text-primary-foreground">
                                                    {t('buttons.examine')} <ArrowUpCircle className="h-3 w-3 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasMoreArticles && (
                            <div className="p-4 flex justify-center border-t border-border/20">
                                <Button variant="outline" className="text-[11px] font-bold uppercase tracking-widest bg-muted/5 hover:bg-muted/20 border-border/20"
                                    disabled={loadingArticles}
                                    onClick={() => { const next = articlePage + 1; setArticlePage(next); loadArticles(next); }}>
                                    {loadingArticles ? <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> {t('buttons.loading')}</> : t('buttons.load_more')}
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
