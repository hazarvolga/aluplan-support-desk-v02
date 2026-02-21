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
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSource, setActiveSource] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const { toast } = useToast();

    const [urlName, setUrlName] = useState('');
    const [urlAddress, setUrlAddress] = useState('');
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);

    const loadSources = async () => {
        try {
            const data = await api.pool.list();
            setSources(data);
        } catch (err) {
            toast({ title: 'Hata', description: 'Kaynaklar yüklenemedi', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSources();
    }, []);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[18px] font-bold tracking-tight text-foreground uppercase">KNOWLEDGE_POOL_INGESTION</h1>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest leading-none">Automated verification and indexing of external data streams (URL, PDF, CSV, MD).</p>
                </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sources List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
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
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-md mt-1.5 opacity-60">
                                                        {source.type === 'URL' ? source.url : source.fileName}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-[9px] font-mono uppercase text-muted-foreground/60">
                                                        <span className="flex items-center gap-1">OBJECTS: {source._count?.embeddings || 0} UNITS</span>
                                                        <span className="flex items-center gap-1">LAST_SYNC: {source.lastSyncedAt ? new Date(source.lastSyncedAt).toISOString().split('T')[0] : 'NEVER'}</span>
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
        </div>
    );
}
