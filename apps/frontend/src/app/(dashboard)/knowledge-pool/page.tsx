'use client';

import { useEffect, useState } from 'react';
import {
    Database, Plus, Globe, FileText, RefreshCw,
    History, CheckCircle2, XCircle, Clock, Search,
    ExternalLink, FileIcon, Trash2, ArrowUpCircle,
    MousePointer2
} from 'lucide-react';
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

    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    const handleUploadFile = async () => {
        if (!fileName || !selectedFile) return;
        try {
            await api.pool.upload(fileName, selectedFile);
            toast({ title: 'Başarılı', description: 'Dosya yüklendi' });
            setIsFileModalOpen(false);
            setFileName('');
            setSelectedFile(null);
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
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bilgi Havuzu</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Harici kaynaklardan (URL, PDF, CSV) otomatik veri besleme merkezi.</p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 rounded-xl gap-2">
                                <Globe className="h-4 w-4" /> URL Ekle
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

                    <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl gap-2 border-slate-200 dark:border-slate-800">
                                <FileText className="h-4 w-4" /> Dosya Yükle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DialogHeader>
                                <DialogTitle>Bilgi Dosyası Yükle</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fname">Görünen Ad</Label>
                                    <Input id="fname" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Örn: 2024 Katalog" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">Dosya (PDF, CSV, MD, TXT)</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="cursor-pointer file:bg-brand-50 file:text-brand-700 file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-4"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleUploadFile} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl w-full">Yükle ve İndeksle</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sources List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center p-20 border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                        </div>
                    ) : sources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800 text-center">
                            <Database className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Henüz Kaynak Yok</h3>
                            <p className="text-slate-500 max-w-xs mt-2">Bilgi havuzunu beslemek için ilk URL veya dosyanızı ekleyin.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {sources.map(source => (
                                <Card key={source.id} className={`group border-slate-200 dark:border-slate-800 hover:border-brand-500/30 transition-all rounded-2xl overflow-hidden ${activeSource?.id === source.id ? 'ring-2 ring-brand-500/20 border-brand-500/50' : ''}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${source.type === 'URL' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {source.type === 'URL' ? <Globe className="h-6 w-6" /> : <FileIcon className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 dark:text-white">{source.name}</h3>
                                                        {getStatusBadge(source.status)}
                                                    </div>
                                                    <p className="text-sm text-slate-500 truncate max-w-md mt-1">
                                                        {source.type === 'URL' ? source.url : source.fileName}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1"><ArrowUpCircle className="h-3 w-3" /> {source._count?.embeddings || 0} Parça</span>
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Son Güncelleme: {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleDateString('tr-TR') : 'Hiç'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => handleSync(source.id)}>
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => viewLogs(source)}>
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
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
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden min-h-[400px]">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                            <CardTitle className="text-lg flex items-center gap-2 italic">
                                <History className="h-5 w-5 text-slate-400" /> Eşitleme Günlüğü
                            </CardTitle>
                            {activeSource && (
                                <CardDescription className="text-brand-600 font-medium">#{activeSource.name}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {!activeSource ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                    <MousePointer2 className="h-8 w-8 mb-4 opacity-20" />
                                    <p className="text-sm italic">Detaylar için bir kaynak seçin</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic text-sm">Log bulunamadı.</div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[600px] overflow-auto">
                                    {logs.map(log => (
                                        <div key={log.id} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                {log.status === 'SUCCESS' ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 className="h-3 w-3" /> TAMAMLANDI
                                                    </span>
                                                ) : log.status === 'FAILED' ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                                                        <XCircle className="h-3 w-3" /> HATA
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
                                                        <Clock className="h-3 w-3" /> İŞLENİYOR
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400">{new Date(log.syncStartedAt).toLocaleString('tr-TR')}</span>
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                {log.status === 'SUCCESS' ? (
                                                    <p>{log.chunksProcessed} yeni veri parçası oluşturuldu.</p>
                                                ) : log.status === 'FAILED' ? (
                                                    <p className="text-red-500/80 line-clamp-2">{log.error}</p>
                                                ) : (
                                                    <p>Veri taranıyor ve vektörleştiriliyor...</p>
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
