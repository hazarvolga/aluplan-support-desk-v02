'use client';

import { useEffect, useState } from 'react';
import {
    Database, Plus, Globe, FileText, RefreshCw,
    History, CheckCircle2, XCircle, Clock, Search,
    ExternalLink, FileIcon, Trash2, ArrowUpCircle,
    MousePointer2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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

export default function KnowledgePoolPage() {
    const [activeTab, setActiveTab] = useState('articles');

    // Sources State
    const [sources, setSources] = useState<any[]>([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [activeSource, setActiveSource] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);

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

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);

    const loadSources = async () => {
        setLoadingSources(true);
        try {
            const data = await api.pool.list();
            setSources(data);
        } catch (err) {
            toast({ title: 'Hata', description: 'Kaynaklar yüklenemedi', variant: 'destructive' });
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
                if (page === 1) {
                    setArticles(res.data);
                } else {
                    setArticles(prev => [...prev, ...res.data]);
                }
                setTotalArticles(res.total || 0);

                const loadedCount = (page - 1) * 50 + (res.data.length || 0);
                setHasMoreArticles(loadedCount < (res.total || 0));
            } else {
                setArticles(res as any || []);
                setTotalArticles((res as any)?.length || 0);
                setHasMoreArticles(false);
            }
        } catch { /* handled */ }
        setLoadingArticles(false);
    };

    const toggleArticleSelection = (id: string) => {
        setSelectedArticleIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedArticleIds.size === articles.length) {
            setSelectedArticleIds(new Set());
        } else {
            setSelectedArticleIds(new Set(articles.map(a => a.id)));
        }
    };

    const handleBulkPublish = async () => {
        if (selectedArticleIds.size === 0) return;
        setIsPublishing(true);
        let successCount = 0;
        let failCount = 0;

        try {
            const ids = Array.from(selectedArticleIds);
            for (const id of ids) {
                try {
                    await api.kb.review(id, true);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to publish article ${id}:`, err);
                    failCount++;
                }
            }

            if (failCount === 0) {
                toast({ title: 'Başarılı', description: `${successCount} makale başarıyla yayınlandı ve vektörize edildi.` });
            } else {
                toast({
                    title: 'Bitti (Kısmi Başarı)',
                    description: `${successCount} başarılı, ${failCount} hatalı işlem. Hata detayları konsolda.`,
                    variant: 'destructive'
                });
            }

            setArticlePage(1);
            loadArticles(1);
            setSelectedArticleIds(new Set());
        } catch (error: any) {
            toast({ title: 'Hata', description: 'İşlem sırasında beklenmedik bir hata oluştu.', variant: 'destructive' });
        } finally {
            setIsPublishing(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'sources') loadSources();
        if (activeTab === 'articles') {
            setArticlePage(1);
            loadArticles(1);
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'articles') {
            setArticlePage(1);
            loadArticles(1);
        }
    }, [articleStatusFilter]);

    const handleAddUrl = async () => {
        if (!urlName || !urlAddress) return;
        try {
            await api.pool.addUrl(urlName, urlAddress);
            toast({ title: 'Başarılı', description: 'URL kaynağı eklendi' });
            setIsUrlModalOpen(false);
            setUrlName('');
            setUrlAddress('');
            loadSources();
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        }
    };


    const handleSync = async (id: string) => {
        try {
            await api.pool.sync(id);
            toast({ title: 'Eşitleme Başlatıldı', description: 'Arka plan görevi kuyruğa alındı' });
            loadSources();
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        }
    };

    const viewLogs = async (source: any) => {
        setActiveSource(source);
        try {
            const data = await api.pool.logs(source.id);
            setLogs(data);
        } catch (err) {
            toast({ title: 'Hata', description: 'Günlükler yüklenemedi', variant: 'destructive' });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aktif</Badge>;
            case 'SYNCING': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex gap-1 items-center"><RefreshCw className="h-3 w-3 animate-spin" /> Eşitleniyor</Badge>;
            case 'FAILED': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Hatalı</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                    <div>
                        <h1 className="text-[18px] font-bold tracking-tight text-foreground uppercase">KNOWLEDGE_POOL_INGESTION</h1>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest leading-none">Automated verification and indexing of external data streams.</p>
                    </div>

                    <TabsList className="bg-muted/10 border border-border/40">
                        <TabsTrigger value="sources" className="text-[10px] uppercase font-bold tracking-widest">RAW_SOURCES (URL)</TabsTrigger>
                        <TabsTrigger value="articles" className="text-[10px] uppercase font-bold tracking-widest">SEEDED_CONTENT (MD)</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2">
                        <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary text-primary-foreground h-8 text-[10px] uppercase font-bold tracking-widest gap-2">
                                    <Globe className="h-3 w-3" /> ADD_URL_STREAM
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <DialogHeader>
                                    <DialogTitle>Yeni URL Kaynağı</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Kaynak Adı</Label>
                                        <Input id="name" value={urlName} onChange={(e) => setUrlName(e.target.value)} placeholder="Örn: Teknik Dokümantasyon" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url">URL Adresi</Label>
                                        <Input id="url" value={urlAddress} onChange={(e) => setUrlAddress(e.target.value)} placeholder="https://example.com/docs" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddUrl} className="bg-brand-600 hover:bg-brand-700 rounded-xl w-full">Kaydet ve Eşitle</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Link href="/knowledge-pool/upload">
                            <Button variant="outline" className="h-8 border-border/60 text-[10px] uppercase font-bold tracking-widest gap-2 bg-muted/20">
                                <FileText className="h-3 w-3" /> UPLOAD_DATASET
                            </Button>
                        </Link>
                    </div>
                </div>

                <TabsContent value="sources" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Sources List */}
                        <div className="lg:col-span-2 space-y-4">
                            {loadingSources ? (
                                <div className="flex items-center justify-center p-20 border border-border/40 bg-muted/5">
                                    <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                                </div>
                            ) : sources.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 border border-dashed border-border/40 text-center">
                                    <Database className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-[12px] font-bold text-foreground uppercase tracking-widest">NO_INGESTION_STREAMS_DETECTED</h3>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase mt-2">Initialize knowledge streams to bootstrap automated intelligence.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {sources.map(source => (
                                        <Card key={source.id} className={`transition-none border-border/60 ${activeSource?.id === source.id ? 'border-primary bg-primary/5' : 'bg-muted/5'}`}>
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex gap-3">
                                                        <div className={`h-10 w-10 border border-border flex items-center justify-center shrink-0 ${source.type === 'URL' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                            {source.type === 'URL' ? <Globe className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-[14px] leading-none uppercase tracking-tight">{source.name}</h3>
                                                                <Badge className={`h-4 px-1.5 text-[8px] font-mono rounded-none ${source.status === 'ACTIVE' ? 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5' :
                                                                    source.status === 'SYNCING' ? 'border-amber-900/50 text-amber-400 bg-amber-400/5' : 'border-red-900/50 text-red-500 bg-red-500/5'
                                                                    }`}>{source.status}</Badge>
                                                                {source.product && (
                                                                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-mono rounded-none border-blue-500/50 text-blue-400 bg-blue-400/5 uppercase">
                                                                        {source.product.name}
                                                                    </Badge>
                                                                )}
                                                                {source.metadata?.matchedCategory && (
                                                                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-mono rounded-none border-purple-500/50 text-purple-400 bg-purple-400/5 uppercase">
                                                                        {source.metadata.matchedCategory}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-md mt-1.5 opacity-60">
                                                                {source.type === 'URL' ? source.url : source.fileName}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-2 text-[9px] font-mono uppercase text-muted-foreground/60">
                                                                <span className="flex items-center gap-1">OBJECTS: {source._count?.embeddings || 0} UNITS</span>
                                                                <span className="flex items-center gap-1">LAST_SYNC: {source.lastSyncedAt ? new Date(source.lastSyncedAt).toISOString().split('T')[0] : 'NEVER'}</span>
                                                                {source.metadata?.score !== undefined && (
                                                                    <span className="flex items-center gap-1 text-primary/40">MATCH_SCORE: {source.metadata.score}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-primary/10 hover:text-primary" onClick={() => handleSync(source.id)}>
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-primary/10 hover:text-primary" onClick={() => viewLogs(source)}>
                                                            <History className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-red-500/10 hover:text-red-500" onClick={() => {/* delete handled in logic */ }}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar / Logs */}
                        <div className="space-y-4">
                            <Card className="border-border/60 min-h-[400px]">
                                <CardHeader className="py-2.5 px-3 bg-muted/10 border-b border-border/40">
                                    <CardTitle className="text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                                        <History className="h-3.5 w-3.5" /> SYNC_TELEMETRY_LOGS
                                    </CardTitle>
                                    {activeSource && (
                                        <CardDescription className="text-primary font-mono text-[9px] uppercase">STREAM_ID: {activeSource.name.toUpperCase()}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!activeSource ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground opacity-30">
                                            <MousePointer2 className="h-8 w-8 mb-4" />
                                            <p className="text-[10px] uppercase font-mono tracking-widest">SELECT_DATA_STREAM</p>
                                        </div>
                                    ) : logs.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground font-mono text-[10px] uppercase opacity-40 italic">NO_TELEMETRY_FOUND_FOR_STREAM.</div>
                                    ) : (
                                        <div className="divide-y divide-border/20 max-h-[600px] overflow-auto">
                                            {logs.map(log => (
                                                <div key={log.id} className="p-3 space-y-2 hover:bg-muted/10 transition-none">
                                                    <div className="flex items-center justify-between">
                                                        {log.status === 'SUCCESS' ? (
                                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                                                                <CheckCircle2 className="h-2.5 w-2.5" /> EMITTED_SUCCESS
                                                            </span>
                                                        ) : log.status === 'FAILED' ? (
                                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-500 uppercase tracking-tighter">
                                                                <XCircle className="h-2.5 w-2.5" /> EMITTED_ERROR
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase tracking-tighter animate-pulse">
                                                                <Clock className="h-2.5 w-2.5" /> IN_FLIGHT
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] font-mono text-muted-foreground/60">{new Date(log.syncStartedAt).toISOString().replace(/T/, ' ').replace(/\..+/, '')}</span>
                                                    </div>
                                                    <div className="text-[10px] text-foreground/70 font-mono leading-tight uppercase tracking-tight">
                                                        {log.status === 'SUCCESS' ? (
                                                            <p>BLOCKS_SYNCED: {log.chunksProcessed} UNITS_READY.</p>
                                                        ) : log.status === 'FAILED' ? (
                                                            <p className="text-red-500/80 line-clamp-2">EXCEPTION: {log.error}</p>
                                                        ) : (
                                                            <p>STREAMING_&_VEC_COMPUTATION_INITIATED...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="articles" className="mt-0">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/20">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[12px] font-bold uppercase tracking-widest">ARTICLE_POOL</h2>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-none font-mono">
                                    {totalArticles} TOTAL
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                                <form onSubmit={(e) => { e.preventDefault(); setArticlePage(1); loadArticles(1); }} className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                                    <input
                                        value={articleSearch}
                                        onChange={(e) => setArticleSearch(e.target.value)}
                                        placeholder="SEEDED FILE SEARCH..."
                                        className="w-full pl-9 pr-4 py-1.5 border border-border/60 bg-black/20 text-[11px] uppercase tracking-tight text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-8"
                                    />
                                </form>
                                <Button onClick={() => { setArticlePage(1); loadArticles(1); }} className="h-8 text-[10px] uppercase font-bold tracking-widest bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground">
                                    <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loadingArticles && articlePage === 1 ? 'animate-spin' : ''}`} /> RELOAD
                                </Button>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5">
                            {[
                                { value: '', label: 'ALL', color: 'bg-muted/20 text-muted-foreground hover:bg-muted/40' },
                                { value: 'REVIEW', label: 'UNDER_REVIEW', color: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' },
                                { value: 'PUBLISHED', label: 'PUBLISHED', color: 'bg-green-500/10 text-green-400 hover:bg-green-500/20' },
                                { value: 'DRAFT', label: 'DRAFT', color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setArticleStatusFilter(f.value)}
                                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border rounded transition-all ${articleStatusFilter === f.value
                                            ? `${f.color} border-current ring-1 ring-current/30`
                                            : 'bg-transparent border-border/30 text-muted-foreground/60 hover:text-muted-foreground'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Action Bar */}
                        {articles.length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-muted/10 border border-border/20 rounded-md">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedArticleIds.size === articles.length && articles.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 cursor-pointer accent-primary"
                                    />
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                                        SELECT ALL PAGE ({selectedArticleIds.size} SELECTED)
                                    </span>
                                </div>
                                {selectedArticleIds.size > 0 && (
                                    <Button
                                        onClick={handleBulkPublish}
                                        disabled={isPublishing}
                                        size="sm"
                                        className="h-7 text-[10px] uppercase font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        {isPublishing ? (
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                        )}
                                        PUBLISH SELECTED
                                    </Button>
                                )}
                            </div>
                        )}
                        {loadingArticles && articlePage === 1 ? (
                            <div className="p-12 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                            </div>
                        ) : articles.length === 0 ? (
                            <div className="border border-border/40 bg-muted/5 p-12 flex flex-col items-center justify-center text-center">
                                <FileText className="h-8 w-8 text-muted-foreground/30 mb-4" />
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">KAYIT_BULUNAMADI</h3>
                                <p className="text-[10px] font-mono text-muted-foreground/60 mt-2 uppercase tracking-tighter">İncelenmesi gereken makale veya doküman parçası bulunamadı.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/20 border-t border-b border-border/40 bg-card rounded-md">
                                {articles.map((a) => (
                                    <div key={a.id} className={`group flex flex-col md:flex-row md:items-center justify-between px-4 py-3 hover:bg-muted/10 transition-none gap-4 ${selectedArticleIds.has(a.id) ? 'bg-primary/5' : ''}`}>
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedArticleIds.has(a.id)}
                                                onChange={() => toggleArticleSelection(a.id)}
                                                className="w-4 h-4 cursor-pointer accent-primary shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2.5 mb-1 text-[9px] font-mono uppercase tracking-tighter">
                                                    <Badge className={`px-1.5 py-0 h-4 border ${a.status === 'PUBLISHED' ? 'border-green-900/50 text-green-400 bg-green-400/5' : a.status === 'DRAFT' ? 'border-amber-900/50 text-amber-400 bg-amber-400/5' : 'border-orange-900/50 text-orange-400 bg-orange-400/5'}`}>
                                                        {a.status === 'REVIEW' ? 'UNDER_REVIEW' : a.status || 'DRAFT'}
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        {a.tags?.map((t: string) => (
                                                            <span key={t} className="text-muted-foreground/40">#{t.toUpperCase()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Link href={`/knowledge-base/${a.id}`} className="group-hover:text-primary transition-none">
                                                    <p className="font-bold text-foreground text-[14px] leading-tight tracking-tight truncate">{a.title}</p>
                                                </Link>
                                                <div className="flex items-center gap-4 mt-1 text-[9px] font-mono uppercase text-muted-foreground/60">
                                                    <span>OFFICER: {a.creator?.fullName || 'SYSTEM'}</span>
                                                    <span>EXTRACTED_AT: {new Date(a.createdAt).toISOString().split('T')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-end">
                                            <Link href={`/knowledge-base/${a.id}`}>
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/5 hover:bg-primary hover:text-primary-foreground transition-none">
                                                    INCELE VE ONAYLA <ArrowUpCircle className="h-3 w-3 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {hasMoreArticles && (
                            <div className="p-4 flex justify-center border-t border-border/20">
                                <Button
                                    variant="outline"
                                    className="text-[11px] font-bold uppercase tracking-widest bg-muted/5 hover:bg-muted/20 border-border/20"
                                    disabled={loadingArticles}
                                    onClick={() => {
                                        const nextPage = articlePage + 1;
                                        setArticlePage(nextPage);
                                        loadArticles(nextPage);
                                    }}
                                >
                                    {loadingArticles ? (
                                        <><RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> YÜKLENİYOR...</>
                                    ) : (
                                        'DAHA FAZLA YÜKLE'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
