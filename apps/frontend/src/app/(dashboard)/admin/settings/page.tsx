'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2, Bot, Globe, Mail, ShieldCheck, Palette, CheckCircle2,
    XCircle, ExternalLink, Plus, Trash2, Edit2, AlertCircle, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import { TicketPriority } from '@aluplan/database';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any[]>([]);
    const [gmailAuthorizing, setGmailAuthorizing] = useState(false);

    // SLA States
    const [policies, setPolicies] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isAddingPolicy, setIsAddingPolicy] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [newPolicy, setNewPolicy] = useState({
        name: '',
        priority: 'MEDIUM',
        departmentId: '',
        firstResponseMinutes: 480,
        resolutionMinutes: 1440,
        businessHoursOnly: true
    });

    // Derived: check if refresh token exists in loaded settings
    const gmailTokenStatus = settings.find(s => s.key === 'mail.gmail.refresh_token')?.value ? 'ok' : 'missing';

    useEffect(() => {
        loadSettings();
        loadSlaData();

        // Read Gmail OAuth2 callback result from URL params
        const gmailStatus = searchParams.get('gmail_status');
        const gmailEmail = searchParams.get('gmail_email');
        const gmailError = searchParams.get('gmail_error');
        if (gmailStatus === 'success') {
            toast({ title: '✅ Gmail Yetkilendirildi', description: `${gmailEmail} hesabı başarıyla bağlandı.` });
        } else if (gmailStatus === 'error') {
            toast({ title: 'Gmail Hatası', description: gmailError || 'Yetkilendirme başarısız.', variant: 'destructive' });
        }
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await api.settings.list(true);
            setSettings(data);
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: 'Ayarlar yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';

    const updateValue = (key: string, value: string) => {
        setSettings(prev => {
            const index = prev.findIndex(s => s.key === key);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = { ...updated[index], value };
                return updated;
            }
            return [...prev, { key, value }];
        });
    };

    const handleSave = async (keys: string[]) => {
        try {
            setSaving(true);
            const secretKeys = [
                'ai.llmapi.api_key',
                'ai.openai.api_key',
                'ai.custom.api_key',
                'mail.resend.api_key',
                'mail.smtp.pass',
                'mail.gmail.client_secret',
                'mail.gmail.refresh_token',
            ];

            const promises = keys
                .map(key => {
                    const value = getSetting(key);
                    const isSecret = secretKeys.includes(key);
                    return { key, value, isSecret };
                })
                .filter(item => item.value !== '')
                .map(payload => api.settings.upsert(payload));
            await Promise.all(promises);
            toast({
                title: 'Başarılı',
                description: 'Ayarlar kaydedildi.',
            });
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: 'Ayarlar kaydedilirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const loadSlaData = async () => {
        try {
            const [policiesData, deptsData] = await Promise.all([
                api.sla.list(),
                api.teams.departments()
            ]);
            setPolicies(policiesData);
            setDepartments(deptsData);
        } catch (err: any) {
            console.error('SLA verileri yüklenemedi:', err);
        }
    };

    const handleSavePolicy = async () => {
        try {
            setSaving(true);
            if (editingPolicy) {
                await api.sla.update(editingPolicy.id, newPolicy);
                toast({ title: 'Başarılı', description: 'Politika güncellendi.' });
            } else {
                await api.sla.create(newPolicy);
                toast({ title: 'Başarılı', description: 'Yeni politika eklendi.' });
            }
            setIsAddingPolicy(false);
            setEditingPolicy(null);
            loadSlaData();
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePolicy = async (id: string) => {
        if (!confirm('Bu politikayı silmek istediğinize emin misiniz?')) return;
        try {
            await api.sla.delete(id);
            toast({ title: 'Başarılı', description: 'Politika silindi.' });
            loadSlaData();
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        }
    };

    const openEditPolicy = (policy: any) => {
        setEditingPolicy(policy);
        setNewPolicy({
            name: policy.name,
            priority: policy.priority,
            departmentId: policy.departmentId,
            firstResponseMinutes: policy.firstResponseMinutes,
            resolutionMinutes: policy.resolutionMinutes,
            businessHoursOnly: policy.businessHoursOnly
        });
        setIsAddingPolicy(true);
    };

    const getPriorityBadge = (priority: string) => {
        const styles: any = {
            CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
            HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            MEDIUM: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
        };
        return <Badge variant="outline" className={styles[priority] || ''}>{priority}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
                <p className="text-muted-foreground">Platform genelindeki yapılandırmaları ve entegrasyonları yönetin.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Genel
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
                        <Bot className="h-4 w-4" /> AI
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> E-Posta
                    </TabsTrigger>
                    <TabsTrigger value="sla" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> SLA
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Marka
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {/* ─── GENEL AYARLAR ────────────────────────────────────────── */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Genel Yapılandırma</CardTitle>
                                <CardDescription>Temel platform ayarları.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Platform Adı</Label>
                                    <Input
                                        value={getSetting('general.portal_name')}
                                        onChange={e => updateValue('general.portal_name', e.target.value)}
                                        placeholder="Örn: Aluplan Destek"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Frontend URL</Label>
                                    <Input
                                        value={getSetting('general.frontend_url')}
                                        onChange={e => updateValue('general.frontend_url', e.target.value)}
                                        placeholder="https://support.aluplan.com"
                                    />
                                </div>
                                <Button onClick={() => handleSave(['general.portal_name', 'general.frontend_url'])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── AI AYARLARI ─────────────────────────────────────────── */}
                    <TabsContent value="ai">
                        <Card>
                            <CardHeader>
                                <CardTitle>Yapay Zeka Entegrasyonu</CardTitle>
                                <CardDescription>Ollama, OpenAI veya Özel servisleri yapılandırın.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Aktif Sağlayıcı</Label>
                                    <Select
                                        value={getSetting('ai.active_provider') || 'ollama'}
                                        onValueChange={v => updateValue('ai.active_provider', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ollama">Ollama (Yerel)</SelectItem>
                                            <SelectItem value="openai">OpenAI (Bulut)</SelectItem>
                                            <SelectItem value="llmapi">LLMAPI (Önerilen)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={() => handleSave(['ai.active_provider'])}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    AI Ayarlarını Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── E-POSTA AYARLARI (RECOVERED) ─────────────────────────── */}
                    <TabsContent value="email">
                        <Card>
                            <CardHeader>
                                <CardTitle>E-Posta Servis Ayarları</CardTitle>
                                <CardDescription>Sistem bildirimleri ve müşteri yazışmaları için sağlayıcı yapılandırması.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Aktif Sağlayıcı</Label>
                                        <Select
                                            value={getSetting('email.active_provider') || 'resend'}
                                            onValueChange={v => updateValue('email.active_provider', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="resend">Resend (API)</SelectItem>
                                                <SelectItem value="smtp">SMTP (Legacy)</SelectItem>
                                                <SelectItem value="gmail">Gmail (OAuth2)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gönderen Email (From Address)</Label>
                                        <Input
                                            value={getSetting('email.from_address')}
                                            onChange={e => updateValue('email.from_address', e.target.value)}
                                            placeholder="noreply@aluplan.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    {getSetting('email.active_provider') === 'resend' && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <h3 className="font-medium">Resend Yapılandırması</h3>
                                            <div className="space-y-2">
                                                <Label>API Key</Label>
                                                <Input
                                                    type="password"
                                                    value={getSetting('mail.resend.api_key')}
                                                    onChange={e => updateValue('mail.resend.api_key', e.target.value)}
                                                    placeholder="re_..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {getSetting('email.active_provider') === 'smtp' && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <h3 className="font-medium">SMTP Yapılandırması</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Host</Label>
                                                    <Input
                                                        value={getSetting('mail.smtp.host')}
                                                        onChange={e => updateValue('mail.smtp.host', e.target.value)}
                                                        placeholder="smtp.gmail.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Port</Label>
                                                    <Input
                                                        value={getSetting('mail.smtp.port')}
                                                        onChange={e => updateValue('mail.smtp.port', e.target.value)}
                                                        placeholder="587"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>User</Label>
                                                    <Input
                                                        value={getSetting('mail.smtp.user')}
                                                        onChange={e => updateValue('mail.smtp.user', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={getSetting('mail.smtp.pass')}
                                                        onChange={e => updateValue('mail.smtp.pass', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {getSetting('email.active_provider') === 'gmail' && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">Gmail OAuth2 Yapılandırması</h3>
                                                {gmailTokenStatus === 'ok' && (
                                                    <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Yetkilendirilmiş
                                                    </span>
                                                )}
                                                {gmailTokenStatus === 'missing' && (
                                                    <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                                                        <XCircle className="h-3.5 w-3.5" /> Yetkilendirilmemiş
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Gönderen E-Posta Adresi</Label>
                                                    <Input
                                                        value={getSetting('mail.gmail.email')}
                                                        onChange={e => updateValue('mail.gmail.email', e.target.value)}
                                                        placeholder="newsletters@aluplan.info"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Client ID</Label>
                                                    <Input
                                                        value={getSetting('mail.gmail.client_id')}
                                                        onChange={e => updateValue('mail.gmail.client_id', e.target.value)}
                                                        placeholder="258437053886-....apps.googleusercontent.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Client Secret</Label>
                                                    <Input
                                                        type="password"
                                                        value={getSetting('mail.gmail.client_secret')}
                                                        onChange={e => updateValue('mail.gmail.client_secret', e.target.value)}
                                                        placeholder="GOCSPX-..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Authorized Redirect URI (Google Cloud Console'a ekleyin)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            disabled
                                                            value="http://localhost:4000/api/v1/email/gmail/callback"
                                                            className="text-xs h-8 bg-muted/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-2"
                                                    disabled={saving}
                                                    onClick={() => handleSave(['mail.gmail.email', 'mail.gmail.client_id', 'mail.gmail.client_secret'])}
                                                >
                                                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                    Credentials Kaydet
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                                    disabled={gmailAuthorizing}
                                                    onClick={async () => {
                                                        try {
                                                            setGmailAuthorizing(true);
                                                            const { url } = await api.email.getGmailAuthUrl();
                                                            window.open(url, '_blank');
                                                        } catch (err: any) {
                                                            toast({ title: 'Hata', description: err.message || 'Auth URL alınamadı. Önce Client ID ve Secret kaydedin.', variant: 'destructive' });
                                                        } finally {
                                                            setGmailAuthorizing(false);
                                                        }
                                                    }}
                                                >
                                                    {gmailAuthorizing
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <ExternalLink className="h-3.5 w-3.5" />
                                                    }
                                                    Google ile Yetkilendir
                                                </Button>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                Önce credentials'ları kaydedin, ardından "Google ile Yetkilendir" butonuna tıklayın.
                                                Google consent ekranında izin verdikten sonra bu sayfaya otomatik dönülecektir.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleSave([
                                            'email.active_provider', 'email.from_address',
                                            'mail.resend.api_key', 'mail.smtp.host', 'mail.smtp.port', 'mail.smtp.user', 'mail.smtp.pass',
                                            'mail.gmail.email', 'mail.gmail.client_id', 'mail.gmail.client_secret',
                                        ])}
                                        disabled={saving}
                                    >
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        E-Posta Sağlayıcısını Kaydet
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={async () => {
                                            try {
                                                const res = await api.email.verifyProvider();
                                                if (res.available) {
                                                    toast({ title: 'Bağlantı Başarılı', description: `${res.provider.toUpperCase()} servisine erişim sağlandı.` });
                                                } else {
                                                    toast({ title: 'Bağlantı Başarısız', description: 'Servis şu an erişilebilir değil.', variant: 'destructive' });
                                                }
                                            } catch (err: any) {
                                                toast({ title: 'Hata', description: err.message || 'Doğrulama sırasında bir hata oluştu.', variant: 'destructive' });
                                            }
                                        }}
                                    >
                                        Bağlantıyı Test Et
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── SLA AYARLARI ─────────────────────────────────────────── */}
                    <TabsContent value="sla">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>SLA Politikaları</CardTitle>
                                    <CardDescription>Öncelik ve departman bazlı hedef yanıt/çözüm süreleri.</CardDescription>
                                </div>
                                <Dialog open={isAddingPolicy} onOpenChange={(open) => {
                                    setIsAddingPolicy(open);
                                    if (!open) {
                                        setEditingPolicy(null);
                                        setNewPolicy({
                                            name: '', priority: 'MEDIUM', departmentId: '',
                                            firstResponseMinutes: 480, resolutionMinutes: 1440, businessHoursOnly: true
                                        });
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" /> Politika Ekle
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>{editingPolicy ? 'Politikayı Düzenle' : 'Yeni SLA Politikası'}</DialogTitle>
                                            <DialogDescription>Bilet önceliği ve departmana göre süre hedeflerini tanımlayın.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Politika Adı</Label>
                                                <Input
                                                    placeholder="Örn: Standart Destek"
                                                    value={newPolicy.name}
                                                    onChange={e => setNewPolicy({ ...newPolicy, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Öncelik</Label>
                                                    <Select
                                                        value={newPolicy.priority}
                                                        onValueChange={val => setNewPolicy({ ...newPolicy, priority: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.values(TicketPriority).map(p => (
                                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Departman</Label>
                                                    <Select
                                                        value={newPolicy.departmentId}
                                                        onValueChange={val => setNewPolicy({ ...newPolicy, departmentId: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Departman Seçin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(departments as any[]).map(d => (
                                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>İlk Yanıt (Dakika)</Label>
                                                    <Input
                                                        type="number"
                                                        value={newPolicy.firstResponseMinutes}
                                                        onChange={e => setNewPolicy({ ...newPolicy, firstResponseMinutes: parseInt(e.target.value) })}
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">≈ {(newPolicy.firstResponseMinutes / 60).toFixed(1)} saat</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Çözüm Süresi (Dakika)</Label>
                                                    <Input
                                                        type="number"
                                                        value={newPolicy.resolutionMinutes}
                                                        onChange={e => setNewPolicy({ ...newPolicy, resolutionMinutes: parseInt(e.target.value) })}
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">≈ {(newPolicy.resolutionMinutes / 60).toFixed(1)} saat</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <Label>Sadece Mesai Saatleri</Label>
                                                    <p className="text-xs text-muted-foreground italic">Hesaplama iş takvimine göre yapılır.</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                                    checked={newPolicy.businessHoursOnly}
                                                    onChange={e => setNewPolicy({ ...newPolicy, businessHoursOnly: e.target.checked })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddingPolicy(false)}>İptal</Button>
                                            <Button onClick={handleSavePolicy} disabled={saving || !newPolicy.name || !newPolicy.departmentId}>
                                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {editingPolicy ? 'Güncelle' : 'Oluştur'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Politika</TableHead>
                                                <TableHead>Departman</TableHead>
                                                <TableHead>Öncelik</TableHead>
                                                <TableHead>Yanıt / Çözüm</TableHead>
                                                <TableHead className="text-right">İşlemler</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {policies.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                                        Henüz bir SLA politikası tanımlanmamış.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                policies.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{p.name}</span>
                                                                {p.businessHoursOnly && (
                                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                        <Clock className="h-2.5 w-2.5" /> Mesai Saatleri
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{p.department?.name || '-'}</TableCell>
                                                        <TableCell>{getPriorityBadge(p.priority)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <Badge variant="secondary" className="font-normal">{p.firstResponseMinutes}dk</Badge>
                                                                <span className="text-muted-foreground">/</span>
                                                                <Badge variant="secondary" className="font-normal">{p.resolutionMinutes}dk</Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" onClick={() => openEditPolicy(p)}>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeletePolicy(p.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                    <div className="text-xs text-blue-700/80 leading-relaxed">
                                        <strong>Nasıl Çalışır?</strong> Yeni bir bilet oluşturulduğunda, sistem önce o departman ve önceliğe uygun bir politika arar.
                                        Eğer bulunamazsa, sistem varsayılan (fallback) süreleri kullanır. Politikalar gelecekteki biletleri etkiler,
                                        mevcut biletlerin SLA süreleri ancak öncelik değişikliğinde yeniden hesaplanır.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── MARKA AYARLARI ────────────────────────────────────────── */}
                    <TabsContent value="branding">
                        <Card>
                            <CardHeader>
                                <CardTitle>Marka & Görsel Kimlik</CardTitle>
                                <CardDescription>Kurumsal kimlik ve iletişim bilgileri. Bu bilgiler e-posta Footer alanında otomatik gösterilir.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Firma Adı</Label>
                                            <Input
                                                value={getSetting('branding.company_name')}
                                                onChange={e => updateValue('branding.company_name', e.target.value)}
                                                placeholder="Örn: Aluplan A.Ş."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kurumsal Logo URL</Label>
                                            <Input
                                                value={getSetting('branding.logo_url')}
                                                onChange={e => updateValue('branding.logo_url', e.target.value)}
                                                placeholder="/logo.png"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>İletişim Adresi (Footer)</Label>
                                            <textarea
                                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={getSetting('branding.address')}
                                                onChange={e => updateValue('branding.address', e.target.value)}
                                                placeholder="Örn: Barbaros Mah. Çiğdem Sok. No:1..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium border-b pb-2">Sosyal Medya Linkleri</h3>
                                        <div className="space-y-2">
                                            <Label>LinkedIn</Label>
                                            <Input
                                                value={getSetting('branding.social_linkedin')}
                                                onChange={e => updateValue('branding.social_linkedin', e.target.value)}
                                                placeholder="https://linkedin.com/company/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Twitter / X</Label>
                                            <Input
                                                value={getSetting('branding.social_twitter')}
                                                onChange={e => updateValue('branding.social_twitter', e.target.value)}
                                                placeholder="https://x.com/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Facebook</Label>
                                            <Input
                                                value={getSetting('branding.social_facebook')}
                                                onChange={e => updateValue('branding.social_facebook', e.target.value)}
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Instagram</Label>
                                            <Input
                                                value={getSetting('branding.social_instagram')}
                                                onChange={e => updateValue('branding.social_instagram', e.target.value)}
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pinterest</Label>
                                            <Input
                                                value={getSetting('branding.social_pinterest')}
                                                onChange={e => updateValue('branding.social_pinterest', e.target.value)}
                                                placeholder="https://pinterest.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full sm:w-auto"
                                    onClick={() => handleSave([
                                        'branding.company_name',
                                        'branding.logo_url',
                                        'branding.address',
                                        'branding.social_linkedin',
                                        'branding.social_twitter',
                                        'branding.social_facebook',
                                        'branding.social_instagram',
                                        'branding.social_pinterest'
                                    ])}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Marka Ayarlarını Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
