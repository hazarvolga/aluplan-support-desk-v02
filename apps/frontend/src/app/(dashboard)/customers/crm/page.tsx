'use client';


import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Save, CheckCircle2, AlertCircle, History, ExternalLink } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface CrmConnection {
    id: string;
    provider: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
    webhookSecret: string;
    instanceUrl: string;
    isActive: boolean;
    syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
    lastSyncAt: string | null;
}

interface SyncLog {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    totalRecords: number;
    successCount: number;
    errorCount: number;
    errorMessage: string | null;
}

export default function CrmManagementPage() {
    const { toast } = useToast();
    const [config, setConfig] = useState({
        provider: 'DYNAMICS_365',
        tenantId: '',
        clientId: '',
        clientSecret: '',
        webhookSecret: '',
        instanceUrl: '',
    });

    const [connection, setConnection] = useState<CrmConnection | null>(null);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const connections = await api.crm.getConnections();
            if (connections && connections.length > 0) {
                const conn = connections[0]; // Currently supporting one connection
                setConnection(conn);
                setConfig({
                    provider: conn.provider,
                    tenantId: conn.tenantId || '',
                    clientId: conn.clientId || '',
                    clientSecret: conn.clientSecret || '',
                    webhookSecret: conn.webhookSecret || '',
                    instanceUrl: conn.instanceUrl || '',
                });
                loadLogs(conn.id);
            }
        } catch (error) {
            console.error('Failed to load CRM data', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async (id: string) => {
        try {
            const syncLogs = await api.crm.getLogs(id);
            setLogs(syncLogs);
        } catch (error) {
            console.error('Failed to load logs', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.crm.upsertConnection(config);
            toast({ title: '✅ Başarılı', description: 'Bağlantı başarıyla kaydedildi ve doğrulandı.' });
            loadData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ Bağlantı Hatası', description: error.response?.data?.message || error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        if (!connection) return;
        setSyncing(true);
        try {
            await api.crm.triggerSync(connection.id);
            toast({ title: '🔄 Senkronizasyon', description: 'Senkronizasyon işlemi arka planda başlatıldı.' });
            loadData();
        } catch (error) {
            console.error('Sync failed', error);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Kontrol Merkezi</h1>
                    <p className="text-muted-foreground mt-1">Microsoft Dynamics 365 ve Kurumsal CRM entegrasyonlarını yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Card */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sky-600">
                                <ExternalLink className="h-5 w-5" />
                                Dynamics 365 Bağlantı Ayarları
                            </CardTitle>
                            <CardDescription>
                                Azure Portal üzerinden oluşturduğunuz uygulama (App Registration) bilgilerini buraya girin.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tenantId">Azure Tenant ID</Label>
                                        <Input
                                            id="tenantId"
                                            value={config.tenantId}
                                            onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
                                            placeholder="e.g. 88665...a54e"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientId">Uygulama (Client) ID</Label>
                                        <Input
                                            id="clientId"
                                            value={config.clientId}
                                            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                                            placeholder="e.g. 12345...6789"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="clientSecret">İstemci Parolası (Client Secret)</Label>
                                    <Input
                                        id="clientSecret"
                                        type="password"
                                        value={config.clientSecret}
                                        onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="webhookSecret">Webhook API Anahtarı (x-api-key)</Label>
                                    <div className="relative">
                                        <Input
                                            id="webhookSecret"
                                            type="text"
                                            value={config.webhookSecret}
                                            onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                                            placeholder="Gelişmiş güvenlik için rastgele bir anahtar girin"
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Bu anahtarı Power Automate akışınızdaki `x-api-key` başlığına eklemelisiniz.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instanceUrl">Dynamics Instance URL</Label>
                                    <Input
                                        id="instanceUrl"
                                        value={config.instanceUrl}
                                        onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
                                        placeholder="https://org.crm4.dynamics.com"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 bg-muted/30">
                                <Button type="submit" disabled={saving}>
                                    {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Bağlantıyı Kaydet ve Doğrula
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* Status Card */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Bağlantı Durumu</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Durum:</span>
                                {connection?.isActive ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Aktif
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-400">Pasif</Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Son Senkronizasyon:</span>
                                <span className="text-sm text-muted-foreground">
                                    {connection?.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString('tr-TR') : 'Hiç yapılmadı'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Senk. Durumu:</span>
                                {connection?.syncStatus === 'SYNCING' ? (
                                    <Badge className="bg-sky-500/10 text-sky-400 animate-pulse">Devam Ediyor</Badge>
                                ) : connection?.syncStatus === 'ERROR' ? (
                                    <Badge variant="destructive">Hata</Badge>
                                ) : (
                                    <Badge variant="secondary">Hazır</Badge>
                                )}
                            </div>

                            <div className="pt-6 border-t font-mono text-[10px] text-muted-foreground break-all">
                                <p>Provider: {config.provider}</p>
                                <p>Instance: {config.instanceUrl || '-'}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant="outline"
                                disabled={!connection || syncing}
                                onClick={handleSync}
                            >
                                {syncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Şimdi Senkronize Et
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Sync Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Senkronizasyon Günlüğü
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Kayıt Sayısı</TableHead>
                                <TableHead>Başarılı</TableHead>
                                <TableHead>Hata</TableHead>
                                <TableHead>Mesaj</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        İşlem kaydı bulunmuyor.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs">
                                            {new Date(log.startedAt).toLocaleString('tr-TR')}
                                        </TableCell>
                                        <TableCell>
                                            {log.status === 'SUCCESS' ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none">Başarılı</Badge>
                                            ) : log.status === 'ERROR' ? (
                                                <Badge className="bg-red-500/10 text-red-400 border-none">Hata</Badge>
                                            ) : (
                                                <Badge variant="outline">Devam Ediyor</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{log.totalRecords}</TableCell>
                                        <TableCell className="text-emerald-500">{log.successCount}</TableCell>
                                        <TableCell className="text-red-500">{log.errorCount}</TableCell>
                                        <TableCell className="text-xs truncate max-w-xs">{log.errorMessage || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
