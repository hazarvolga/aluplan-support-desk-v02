'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Globe, Mail, ShieldCheck, Palette } from 'lucide-react';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any[]>([]);

    useEffect(() => {
        loadSettings();
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
                'mail.smtp.pass'
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
                                        <div className="p-4 border rounded-lg bg-amber-500/10 border-amber-500/20">
                                            <p className="text-sm text-amber-600 dark:text-amber-400">Gmail OAuth2 yapılandırması şu an beta aşamasındadır.</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => handleSave([
                                        'email.active_provider', 'email.from_address',
                                        'mail.resend.api_key', 'mail.smtp.host', 'mail.smtp.port', 'mail.smtp.user', 'mail.smtp.pass'
                                    ])}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    E-Posta Sağlayıcısını Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── SLA AYARLARI ─────────────────────────────────────────── */}
                    <TabsContent value="sla">
                        <Card>
                            <CardHeader>
                                <CardTitle>SLA Politikaları</CardTitle>
                                <CardDescription>Hedef yanıt ve çözüm süreleri.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground italic">SLA modülü yapılandırması bu alandan yönetilmektedir.</p>
                                <Button onClick={() => handleSave(['sla.critical.response_hours'])} disabled={saving}>SLA Kaydet</Button>
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
                                    </div>
                                </div>

                                <Button
                                    className="w-full sm:w-auto"
                                    onClick={() => handleSave([
                                        'branding.company_name',
                                        'branding.logo_url',
                                        'branding.address',
                                        'branding.social_linkedin',
                                        'branding.social_twitter'
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
