'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Database, Globe, FileText, RefreshCw,
    History, CheckCircle2, XCircle, Clock, Search,
    FileIcon, ArrowUpCircle, MousePointer2,
    ChevronDown, ChevronUp, ChevronsUpDown, PlayCircle, Trash2, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { api, CrawlCandidate, LearnNowCrawlFormat } from '@/lib/api';
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

    // Crawler State
    const [crawlCandidates, setCrawlCandidates] = useState<CrawlCandidate[]>([]);
    const [loadingCrawlCandidates, setLoadingCrawlCandidates] = useState(false);
    const [crawlSearch, setCrawlSearch] = useState('');
    const [crawlStatusFilter, setCrawlStatusFilter] = useState('PENDING_REVIEW');
    const [crawlSourceFilter, setCrawlSourceFilter] = useState('');
    const [crawlFormats, setCrawlFormats] = useState<Set<LearnNowCrawlFormat>>(new Set(['knowledge_article', 'pdf']));
    const [crawlDryRun, setCrawlDryRun] = useState<any>(null);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [importingCandidateIds, setImportingCandidateIds] = useState<Set<string>>(new Set());
    const [selectedCrawlCandidateIds, setSelectedCrawlCandidateIds] = useState<Set<string>>(new Set());
    const [deletingCandidateIds, setDeletingCandidateIds] = useState<Set<string>>(new Set());
    const [isBulkDeletingCandidates, setIsBulkDeletingCandidates] = useState(false);

    const { toast } = useToast();

    const [urlName, setUrlName] = useState('');
    const [urlAddress, setUrlAddress] = useState('');
    const [urlIngestionMode, setUrlIngestionMode] = useState<'single' | 'crawl'>('single');
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [isUrlSubmitting, setIsUrlSubmitting] = useState(false);

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
        if (activeTab === 'crawler') loadCrawlCandidates();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'articles') { setArticlePage(1); loadArticles(1); }
    }, [articleStatusFilter]);

    useEffect(() => {
        if (activeTab === 'crawler') loadCrawlCandidates();
    }, [crawlStatusFilter, crawlSourceFilter]);

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
        setIsUrlSubmitting(true);
        try {
            if (urlIngestionMode === 'crawl') {
                const result = await api.pool.discoverGenericWeb({
                    name: urlName,
                    startUrl: urlAddress,
                    maxDepth: 2,
                    maxCandidates: 50,
                    sameDomainOnly: true,
                    dryRun: false,
                });
                toast({
                    title: t('crawler.toasts.discover_done'),
                    description: t('crawler.toasts.discover_desc', { count: result.inserted ?? 0 }),
                });
                setActiveTab('crawler');
                setCrawlSourceFilter('generic_web');
                setCrawlStatusFilter('PENDING_REVIEW');
            } else {
                await api.pool.addUrl(urlName, urlAddress);
                toast({ title: t('logs.success'), description: t('toasts.url_added') });
                loadSources();
            }
            setIsUrlModalOpen(false);
            setUrlName(''); setUrlAddress('');
            setUrlIngestionMode('single');
        } catch (err: any) {
            toast({ title: t('logs.error'), description: err.message, variant: 'destructive' });
        } finally {
            setIsUrlSubmitting(false);
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

    const loadCrawlCandidates = async () => {
        setLoadingCrawlCandidates(true);
        try {
            const data = await api.pool.crawlCandidates(crawlStatusFilter || undefined, crawlSourceFilter || undefined);
            setCrawlCandidates(data);
            const visibleIds = new Set(data.map(candidate => candidate.id));
            setSelectedCrawlCandidateIds(prev => new Set(Array.from(prev).filter(id => visibleIds.has(id))));
        } catch (error: any) {
            toast({ title: t('logs.error'), description: error.message || t('crawler.toasts.fetch_error'), variant: 'destructive' });
        } finally {
            setLoadingCrawlCandidates(false);
        }
    };

    const handleDiscoverLearnNow = async (dryRun: boolean) => {
        setIsDiscovering(true);
        try {
            const result = await api.pool.discoverLearnNow({
                search: crawlSearch,
                formats: Array.from(crawlFormats),
                maxPages: 1,
                maxCandidates: 50,
                dryRun,
            });
            setCrawlDryRun(result);
            toast({
                title: dryRun ? t('crawler.toasts.dry_run_done') : t('crawler.toasts.discover_done'),
                description: dryRun
                    ? t('crawler.toasts.dry_run_desc', { count: result.discovered ?? 0 })
                    : t('crawler.toasts.discover_desc', { count: result.inserted ?? 0 }),
            });
            if (!dryRun) loadCrawlCandidates();
        } catch (error: any) {
            toast({ title: t('logs.error'), description: error.message || t('crawler.toasts.discover_error'), variant: 'destructive' });
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleImportCandidate = async (id: string) => {
        setImportingCandidateIds(prev => new Set(prev).add(id));
        try {
            const result = await api.pool.importCrawlCandidate(id);
            toast({
                title: result.skipped ? t('crawler.toasts.import_skipped') : t('crawler.toasts.import_started'),
                description: result.reason || t('crawler.toasts.import_desc'),
            });
            loadCrawlCandidates();
            loadSources();
        } catch (error: any) {
            toast({ title: t('logs.error'), description: error.message || t('crawler.toasts.import_error'), variant: 'destructive' });
        } finally {
            setImportingCandidateIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    const allCrawlCandidatesSelected = crawlCandidates.length > 0 && crawlCandidates.every(candidate => selectedCrawlCandidateIds.has(candidate.id));

    const toggleCrawlCandidateSelect = (id: string) => {
        setSelectedCrawlCandidateIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAllCrawlCandidates = () => {
        if (allCrawlCandidatesSelected) {
            setSelectedCrawlCandidateIds(new Set());
            return;
        }
        setSelectedCrawlCandidateIds(new Set(crawlCandidates.map(candidate => candidate.id)));
    };

    const handleDeleteCrawlCandidate = async (candidate: CrawlCandidate) => {
        if (!window.confirm(t('crawler.confirm_delete', { title: candidate.title }))) {
            return;
        }

        setDeletingCandidateIds(prev => new Set(prev).add(candidate.id));
        try {
            await api.pool.deleteCrawlCandidate(candidate.id);
            toast({ title: t('crawler.toasts.delete_done'), description: t('crawler.toasts.delete_desc') });
            setCrawlCandidates(prev => prev.filter(item => item.id !== candidate.id));
            setSelectedCrawlCandidateIds(prev => {
                const next = new Set(prev);
                next.delete(candidate.id);
                return next;
            });
        } catch (error: any) {
            toast({ title: t('logs.error'), description: error.message || t('crawler.toasts.delete_error'), variant: 'destructive' });
        } finally {
            setDeletingCandidateIds(prev => { const next = new Set(prev); next.delete(candidate.id); return next; });
        }
    };

    const handleBulkDeleteCrawlCandidates = async () => {
        const ids = Array.from(selectedCrawlCandidateIds);
        if (ids.length === 0) return;
        if (!window.confirm(t('crawler.confirm_bulk_delete', { count: ids.length }))) {
            return;
        }

        setIsBulkDeletingCandidates(true);
        try {
            const result = await api.pool.bulkDeleteCrawlCandidates(ids);
            toast({ title: t('crawler.toasts.bulk_delete_done'), description: t('crawler.toasts.bulk_delete_desc', { count: result.count }) });
            setCrawlCandidates(prev => prev.filter(candidate => !ids.includes(candidate.id)));
            setSelectedCrawlCandidateIds(new Set());
        } catch (error: any) {
            toast({ title: t('logs.error'), description: error.message || t('crawler.toasts.bulk_delete_error'), variant: 'destructive' });
        } finally {
            setIsBulkDeletingCandidates(false);
        }
    };

    const toggleCrawlFormat = (format: LearnNowCrawlFormat) => {
        setCrawlFormats(prev => {
            const next = new Set(prev);
            if (next.has(format)) next.delete(format);
            else next.add(format);
            return next.size > 0 ? next : prev;
        });
    };

    const getCandidateReviewQuality = (candidate: CrawlCandidate): Record<string, unknown> | null => {
        const metadata = candidate.metadata ?? {};
        const reviewQuality = metadata.reviewQuality;
        if (reviewQuality && typeof reviewQuality === 'object') {
            return reviewQuality as Record<string, unknown>;
        }

        const crawler = metadata.crawler;
        if (crawler && typeof crawler === 'object' && 'learnNow' in crawler) {
            const learnNow = (crawler as Record<string, any>).learnNow ?? {};
            return {
                sourceType: learnNow.type ?? candidate.crawlFilter,
                contentLength: undefined,
                imageCount: learnNow.imageCount,
                transcriptStatus: learnNow.transcriptStatus,
                transcriptLanguage: learnNow.transcriptLanguage,
                transcriptLength: learnNow.transcriptLength,
                readyForImport: learnNow.transcriptStatus === 'AVAILABLE' || candidate.crawlFilter !== 'explaining_video',
            };
        }

        return null;
    };

    const renderCandidateQuality = (candidate: CrawlCandidate) => {
        const quality = getCandidateReviewQuality(candidate);
        if (!quality) return null;

        const contentLength = typeof quality.contentLength === 'number' ? quality.contentLength : null;
        const imageCount = typeof quality.imageCount === 'number' ? quality.imageCount : null;
        const transcriptStatus = typeof quality.transcriptStatus === 'string' ? quality.transcriptStatus : null;
        const transcriptLength = typeof quality.transcriptLength === 'number' ? quality.transcriptLength : null;
        const sourceType = typeof quality.sourceType === 'string' ? quality.sourceType : candidate.crawlFilter;
        const readyForImport = quality.readyForImport === true;
        const reasonCode = typeof quality.reasonCode === 'string' ? quality.reasonCode : null;
        const reasonKeyByCode: Record<string, string> = {
            ARTICLE_CONTENT_READY: 'article_ready',
            MEDIA_TRANSCRIPT_READY: 'media_ready',
            TRANSCRIPT_REQUIRED: 'transcript_required',
            CONTENT_TOO_SHORT: 'content_too_short',
            PDF_VALIDATED_ON_IMPORT: 'pdf_validated_on_import',
            NEEDS_CONTENT_REVIEW: 'needs_content_review',
        };
        const reasonLabel = reasonCode && reasonKeyByCode[reasonCode]
            ? t(`crawler.quality_reasons.${reasonKeyByCode[reasonCode]}` as any)
            : null;

        return (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {sourceType && (
                    <Badge variant="outline" className="text-[8px] font-mono rounded-none px-1 border-border/40 text-muted-foreground">
                        {sourceType}
                    </Badge>
                )}
                {contentLength !== null && (
                    <Badge variant="outline" className="text-[8px] font-mono rounded-none px-1 border-border/40 text-muted-foreground">
                        {t('crawler.quality.content')}: {contentLength}
                    </Badge>
                )}
                {imageCount !== null && imageCount > 0 && (
                    <Badge variant="outline" className="text-[8px] font-mono rounded-none px-1 border-cyan-500/25 text-cyan-400">
                        {t('crawler.quality.images')}: {imageCount}
                    </Badge>
                )}
                {transcriptStatus && transcriptStatus !== 'NOT_APPLICABLE' && (
                    <Badge
                        variant="outline"
                        className={`text-[8px] font-mono rounded-none px-1 ${transcriptStatus === 'AVAILABLE' ? 'border-emerald-500/25 text-emerald-400' : 'border-amber-500/25 text-amber-400'}`}
                    >
                        {t('crawler.quality.transcript')}: {transcriptStatus}
                        {transcriptLength ? ` (${transcriptLength})` : ''}
                    </Badge>
                )}
                <Badge
                    variant="outline"
                    className={`text-[8px] font-mono rounded-none px-1 ${readyForImport ? 'border-emerald-500/25 text-emerald-400' : 'border-amber-500/25 text-amber-400'}`}
                >
                    {readyForImport ? <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> : <Clock className="h-2.5 w-2.5 mr-1" />}
                    {readyForImport ? t('crawler.quality.ready') : t('crawler.quality.needs_review')}
                </Badge>
                {reasonLabel && (
                    <Badge
                        variant="outline"
                        className={`text-[8px] font-mono rounded-none px-1 ${readyForImport ? 'border-emerald-500/20 text-emerald-300' : 'border-amber-500/20 text-amber-300'}`}
                    >
                        {reasonLabel}
                    </Badge>
                )}
            </div>
        );
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            SYNCING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
            INACTIVE: 'bg-muted/20 text-muted-foreground border-border/30',
        };
        return (
            <Badge variant="outline" className={`text-[9px] font-mono rounded-none px-1.5 ${map[status] || 'bg-muted/20 text-muted-foreground'}`}>
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
                        <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{t('subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <TabsList className="bg-muted/10 border border-border/40 h-9">
                            <TabsTrigger value="sources" className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.raw_sources')}</TabsTrigger>
                            <TabsTrigger value="articles" className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.seeded_content')}</TabsTrigger>
                            <TabsTrigger value="crawler" className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest px-2 md:px-3">{t('tabs.crawler')}</TabsTrigger>
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
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: 'single' as const, label: t('dialogs.url_mode_single'), desc: t('dialogs.url_mode_single_desc') },
                                                { value: 'crawl' as const, label: t('dialogs.url_mode_crawl'), desc: t('dialogs.url_mode_crawl_desc') },
                                            ].map(mode => (
                                                <button
                                                    key={mode.value}
                                                    type="button"
                                                    onClick={() => setUrlIngestionMode(mode.value)}
                                                    className={`border p-3 text-left rounded-sm transition-colors ${urlIngestionMode === mode.value ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/10 text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    <span className="block text-[10px] font-bold uppercase tracking-widest">{mode.label}</span>
                                                    <span className="mt-1 block text-[9px] leading-snug text-current/70">{mode.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddUrl} disabled={isUrlSubmitting || !urlName || !urlAddress} className="w-full">
                                            {isUrlSubmitting && <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />}
                                            {urlIngestionMode === 'crawl' ? t('dialogs.save_candidates') : t('dialogs.save_sync')}
                                        </Button>
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
                                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded transition-all ${statusFilter === s ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}>
                                            {s || t('filters.all')}
                                        </button>
                                    ))}
                                    <div className="w-px h-4 bg-border/40 mx-1" />
                                    {/* Type filter */}
                                    {[{ v: '', l: t('filters.all_types') }, { v: 'URL', l: t('filters.url') }, { v: 'FILE', l: t('filters.file') }].map(f => (
                                        <button key={f.v} onClick={() => setTypeFilter(f.v)}
                                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded transition-all ${typeFilter === f.v ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}>
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
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('name')}>
                                                <span className="flex items-center gap-1">{t('table.source')} <SortIcon field="name" /></span>
                                            </TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none w-24" onClick={() => toggleSort('type')}>
                                                <span className="flex items-center gap-1">{t('table.type')} <SortIcon field="type" /></span>
                                            </TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none w-32" onClick={() => toggleSort('category')}>
                                                <span className="flex items-center gap-1">Kategori <SortIcon field="category" /></span>
                                            </TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none w-28" onClick={() => toggleSort('status')}>
                                                <span className="flex items-center gap-1">{t('table.status')} <SortIcon field="status" /></span>
                                            </TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none w-24 text-right" onClick={() => toggleSort('embeddings')}>
                                                <span className="flex items-center justify-end gap-1">{t('table.vector')} <SortIcon field="embeddings" /></span>
                                            </TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none w-32" onClick={() => toggleSort('lastSyncedAt')}>
                                                <span className="flex items-center gap-1">{t('table.last_sync')} <SortIcon field="lastSyncedAt" /></span>
                                            </TableHead>
                                            <TableHead className="text-[9px] font-bold uppercase tracking-widest w-24 text-right pr-3">{t('table.action')}</TableHead>
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
                                                        <div className={`h-7 w-7 border flex items-center justify-center shrink-0 ${source.type === 'URL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                            {source.type === 'URL' ? <Globe className="h-3.5 w-3.5" /> : <FileIcon className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-[12px] leading-tight truncate max-w-[200px]">{source.name}</p>
                                                            <p className="text-[9px] text-muted-foreground/50 font-mono truncate max-w-[200px] mt-0.5">
                                                                {source.type === 'URL' ? source.url : source.fileName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-24">
                                                    <Badge variant="outline" className={`text-[9px] font-mono rounded-none px-1.5 ${source.type === 'URL' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-amber-500/30 text-amber-400 bg-amber-500/5'}`}>
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
                            <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/50 uppercase px-1">
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
                                        <span className="ml-auto text-primary font-mono text-[9px] uppercase truncate max-w-[120px]">{activeSource.name}</span>
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
                                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase"><CheckCircle2 className="h-2.5 w-2.5" /> {t('logs.success')}</span>
                                                    ) : log.status === 'FAILED' ? (
                                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-500 uppercase"><XCircle className="h-2.5 w-2.5" /> {t('logs.error')}</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase animate-pulse"><Clock className="h-2.5 w-2.5" /> {t('logs.processing')}</span>
                                                    )}
                                                    <span className="text-[9px] font-mono text-muted-foreground/60">{new Date(log.syncStartedAt).toLocaleString(t('meta.locale'))}</span>
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
                                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border rounded transition-all ${articleStatusFilter === f.value ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}>
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
                                                <div className="flex items-center gap-2.5 mb-1 text-[9px] font-mono uppercase">
                                                    <Badge className={`px-1.5 py-0 h-4 border ${a.status === 'PUBLISHED' ? 'border-green-900/50 text-green-400 bg-green-400/5' : a.status === 'DRAFT' ? 'border-amber-900/50 text-amber-400 bg-amber-400/5' : 'border-orange-900/50 text-orange-400 bg-orange-400/5'}`}>
                                                        {t(`status_labels.${(a.status || 'DRAFT').toLowerCase()}`)}
                                                    </Badge>
                                                    {a.tags?.map((t: string) => <span key={t} className="text-muted-foreground/40">#{t.toUpperCase()}</span>)}
                                                </div>
                                                <Link href={`/knowledge-base/${a.id}`} className="group-hover:text-primary">
                                                    <p className="font-bold text-foreground text-[14px] leading-tight tracking-tight truncate">{a.title}</p>
                                                </Link>
                                                <div className="flex items-center gap-4 mt-1 text-[9px] font-mono uppercase text-muted-foreground/60">
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

                <TabsContent value="crawler" className="mt-0">
                    <div className="space-y-4">
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3 pb-3 border-b border-border/30">
                            <div className="space-y-1">
                                <h2 className="text-[12px] font-bold uppercase tracking-widest">{t('crawler.title')}</h2>
                                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{t('crawler.subtitle')}</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:items-center">
                                <div className="relative min-w-[260px]">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <Input
                                        value={crawlSearch}
                                        onChange={e => setCrawlSearch(e.target.value)}
                                        placeholder={t('crawler.search_placeholder')}
                                        className="pl-8 h-8 text-[11px] bg-muted/10 border-border/50"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { value: 'knowledge_article' as const, label: t('crawler.formats.article') },
                                        { value: 'pdf' as const, label: t('crawler.formats.pdf') },
                                        { value: 'technical_manual' as const, label: t('crawler.formats.technical_manual') },
                                        { value: 'explaining_video' as const, label: t('crawler.formats.explaining_video') },
                                        { value: 'recorded_online_session' as const, label: t('crawler.formats.recorded_online_session') },
                                    ].map(format => (
                                        <button
                                            key={format.value}
                                            onClick={() => toggleCrawlFormat(format.value)}
                                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded ${crawlFormats.has(format.value) ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60'}`}
                                        >
                                            {format.label}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    onClick={() => handleDiscoverLearnNow(true)}
                                    disabled={isDiscovering}
                                    variant="outline"
                                    className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2"
                                >
                                    {isDiscovering ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                                    {t('crawler.buttons.dry_run')}
                                </Button>
                                <Button
                                    onClick={() => handleDiscoverLearnNow(false)}
                                    disabled={isDiscovering}
                                    className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2"
                                >
                                    {isDiscovering ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                                    {t('crawler.buttons.save_candidates')}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            <div className="border border-primary/20 bg-primary/5 rounded-md p-3 flex gap-3">
                                <Globe className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('crawler.public_notice_title')}</p>
                                    <p className="text-[10px] leading-relaxed text-muted-foreground">{t('crawler.public_notice_desc')}</p>
                                </div>
                            </div>
                            <div className="border border-amber-500/20 bg-amber-500/5 rounded-md p-3 flex gap-3">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{t('crawler.enrollment_notice_title')}</p>
                                    <p className="text-[10px] leading-relaxed text-muted-foreground">{t('crawler.enrollment_notice_desc')}</p>
                                </div>
                            </div>
                        </div>

                        {crawlDryRun?.dryRun && (
                            <div className="border border-primary/20 bg-primary/5 rounded-md p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('crawler.dry_run_title')}</span>
                                    <Badge className="bg-primary/10 text-primary font-mono">{t('crawler.discovered', { count: crawlDryRun.discovered ?? 0 })}</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[220px] overflow-auto">
                                    {(crawlDryRun.candidates || []).slice(0, 12).map((candidate: any) => (
                                        <div key={candidate.sourceUrl} className="border border-border/30 bg-background/40 p-2 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[8px] rounded-none">{candidate.format}</Badge>
                                                <span className="text-[8px] font-mono text-muted-foreground">{candidate.categorySlug}</span>
                                            </div>
                                            <p className="text-[11px] font-bold truncate">{candidate.title}</p>
                                            <p className="text-[9px] font-mono text-muted-foreground/60 truncate">{candidate.sourceUrl}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {[
                                        { value: '', label: t('crawler.sources.all') },
                                        { value: 'allplan_learnnow', label: t('crawler.sources.learnnow') },
                                        { value: 'generic_web', label: t('crawler.sources.generic_web') },
                                    ].map(source => (
                                        <button
                                            key={source.value || 'all-sources'}
                                            onClick={() => setCrawlSourceFilter(source.value)}
                                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded ${crawlSourceFilter === source.value ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}
                                        >
                                            {source.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {['PENDING_REVIEW', 'IMPORTED', 'SKIPPED_DUPLICATE', 'FAILED', ''].map(status => (
                                        <button
                                            key={status || 'ALL'}
                                            onClick={() => setCrawlStatusFilter(status)}
                                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded ${crawlStatusFilter === status ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'}`}
                                        >
                                            {status || t('filters.all')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={loadCrawlCandidates} variant="outline" className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2">
                                <RefreshCw className={`h-3.5 w-3.5 ${loadingCrawlCandidates ? 'animate-spin' : ''}`} />
                                {t('buttons.refresh')}
                            </Button>
                        </div>

                        {selectedCrawlCandidateIds.size > 0 && (
                            <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border border-primary/20 rounded">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                    {t('crawler.selected', { count: selectedCrawlCandidateIds.size })}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleBulkDeleteCrawlCandidates}
                                        disabled={isBulkDeletingCandidates}
                                        variant="destructive"
                                        className="h-7 text-[10px] uppercase font-bold tracking-widest gap-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                    >
                                        {isBulkDeletingCandidates ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                        {t('crawler.buttons.delete_selected')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedCrawlCandidateIds(new Set())}
                                        className="h-7 text-[10px] uppercase font-bold tracking-widest text-muted-foreground"
                                    >
                                        {t('buttons.cancel')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="border border-border/50 rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/40">
                                        <TableHead className="w-10 pl-3">
                                            <input
                                                type="checkbox"
                                                checked={allCrawlCandidatesSelected}
                                                onChange={toggleSelectAllCrawlCandidates}
                                                className="w-4 h-4 cursor-pointer accent-primary"
                                                aria-label={t('table.select_all')}
                                            />
                                        </TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest">{t('crawler.table.title')}</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest w-32">{t('crawler.table.source')}</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest w-28">{t('crawler.table.format')}</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest w-40">{t('crawler.table.category')}</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest w-36">{t('crawler.table.status')}</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase tracking-widest w-32 text-right">{t('table.action')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingCrawlCandidates ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : crawlCandidates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                                <Globe className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                                <p className="text-[10px] uppercase font-mono tracking-widest">{t('crawler.no_candidates')}</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : crawlCandidates.map(candidate => (
                                        <TableRow key={candidate.id} className={`border-b border-border/20 hover:bg-muted/5 ${selectedCrawlCandidateIds.has(candidate.id) ? 'bg-primary/5' : ''}`}>
                                            <TableCell className="pl-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCrawlCandidateIds.has(candidate.id)}
                                                    onChange={() => toggleCrawlCandidateSelect(candidate.id)}
                                                    className="w-4 h-4 cursor-pointer accent-primary"
                                                />
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <p className="font-bold text-[12px] leading-tight truncate max-w-[420px]">{candidate.title}</p>
                                                <a
                                                    href={candidate.sourceUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[9px] font-mono text-muted-foreground/60 hover:text-primary truncate max-w-[420px] block"
                                                >
                                                    {candidate.sourceUrl}
                                                </a>
                                                {typeof candidate.metadata?.discoveredFrom === 'string' && (
                                                    <p className="text-[8px] font-mono text-muted-foreground/40 truncate max-w-[420px] mt-0.5">
                                                        {t('crawler.table.discovered_from')}: {String(candidate.metadata.discoveredFrom)}
                                                    </p>
                                                )}
                                                {candidate.rejectionReason && (
                                                    <p className="text-[8px] font-mono text-amber-500/80 truncate max-w-[420px] mt-0.5">
                                                        {t('crawler.table.rejection_reason')}: {candidate.rejectionReason}
                                                    </p>
                                                )}
                                                {renderCandidateQuality(candidate)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <Badge variant="outline" className="text-[8px] font-mono rounded-none px-1.5">
                                                        {candidate.source === 'generic_web' ? t('crawler.sources.generic_web') : t('crawler.sources.learnnow')}
                                                    </Badge>
                                                    <p className="text-[8px] font-mono text-muted-foreground/50 truncate max-w-[120px]">
                                                        {(() => {
                                                            try { return new URL(candidate.sourceUrl).hostname; } catch { return candidate.source; }
                                                        })()}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] font-mono rounded-none px-1.5">
                                                    {candidate.format}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[10px] font-mono text-muted-foreground">{candidate.categorySlug || 'uncategorized'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] font-mono rounded-none px-1.5">
                                                    {candidate.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        onClick={() => handleImportCandidate(candidate.id)}
                                                        disabled={['IMPORTED', 'SKIPPED_DUPLICATE'].includes(candidate.status) || importingCandidateIds.has(candidate.id) || deletingCandidateIds.has(candidate.id)}
                                                        size="sm"
                                                        className="h-7 text-[10px] uppercase font-bold tracking-widest gap-1.5"
                                                    >
                                                        {importingCandidateIds.has(candidate.id) ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ArrowUpCircle className="h-3 w-3" />}
                                                        {t('crawler.buttons.import')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteCrawlCandidate(candidate)}
                                                        disabled={deletingCandidateIds.has(candidate.id)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-none hover:bg-red-500/10 hover:text-red-500"
                                                        aria-label={t('crawler.buttons.delete')}
                                                    >
                                                        {deletingCandidateIds.has(candidate.id) ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
