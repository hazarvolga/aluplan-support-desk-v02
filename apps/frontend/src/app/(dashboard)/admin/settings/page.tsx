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
import { Loader2, Save, Mail, Bot, ShieldCheck, Globe, Palette } from 'lucide-react';

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
            const data = await api.settings.list(true); // Decrypt secrets for display if needed
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
            const promises = keys.map(key => {
                const value = getSetting(key);
                return api.settings.upsert({ key, value });
            });
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

                    {/* ─── AI AYARLARI ────────────────────────────────────────────── */}
                    <TabsContent value="ai">
                        <Card>
                            <CardHeader>
                                <CardTitle>Yapay Zeka Entegrasyonu</CardTitle>
                                <CardDescription>Ollama, OpenAI veya Özel (OpenAI Uyumlu) servisleri yapılandırın.</CardDescription>
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
                                            <SelectItem value="custom">Custom (OpenAI Uyumlu API)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    {/* Ollama Ayarları */}
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <Bot className="h-4 w-4" /> Ollama (Yerel)
                                        </h3>
                                        <div className="space-y-2">
                                            <Label>Base URL</Label>
                                            <Input
                                                value={getSetting('ai.ollama.url')}
                                                onChange={e => updateValue('ai.ollama.url', e.target.value)}
                                                placeholder="http://localhost:11434"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Chat Model</Label>
                                            <Input
                                                value={getSetting('ai.ollama.chat_model')}
                                                onChange={e => updateValue('ai.ollama.chat_model', e.target.value)}
                                                placeholder="llama3.2:3b"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Embedding Model</Label>
                                            <Input
                                                value={getSetting('ai.ollama.embed_model')}
                                                onChange={e => updateValue('ai.ollama.embed_model', e.target.value)}
                                                placeholder="nomic-embed-text"
                                            />
                                        </div>
                                    </div>

                                    {/* OpenAI Ayarları */}
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <Globe className="h-4 w-4" /> OpenAI (Bulut)
                                        </h3>
                                        <div className="space-y-2">
                                            <Label>API Key</Label>
                                            <Input
                                                type="password"
                                                value={getSetting('ai.openai.api_key')}
                                                onChange={e => updateValue('ai.openai.api_key', e.target.value)}
                                                placeholder="sk-..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Model (Chat)</Label>
                                            <Input
                                                value={getSetting('ai.openai.chat_model')}
                                                onChange={e => updateValue('ai.openai.chat_model', e.target.value)}
                                                placeholder="gpt-4o-mini"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custom (llmapi.ai, DeepSeek vb.) Ayarları */}
                                <div className="space-y-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
                                    <h3 className="font-medium flex items-center gap-2 text-primary">
                                        <ShieldCheck className="h-4 w-4" /> Custom / OpenAI Uyumlu API (llmapi.ai, DeepSeek, Groq vb.)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Base URL</Label>
                                            <Input
                                                value={getSetting('ai.custom.url')}
                                                onChange={e => updateValue('ai.custom.url', e.target.value)}
                                                placeholder="https://api.openai.com/v1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>API Key</Label>
                                            <Input
                                                type="password"
                                                value={getSetting('ai.custom.key')}
                                                onChange={e => updateValue('ai.custom.key', e.target.value)}
                                                placeholder="API anahtarınızı girin..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Chat Model</Label>
                                            <Input
                                                value={getSetting('ai.custom.chat_model')}
                                                onChange={e => updateValue('ai.custom.chat_model', e.target.value)}
                                                placeholder="gpt-4o"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Embedding Model</Label>
                                            <Input
                                                value={getSetting('ai.custom.embed_model')}
                                                onChange={e => updateValue('ai.custom.embed_model', e.target.value)}
                                                placeholder="text-embedding-3-small"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => handleSave([
                                        'ai.active_provider',
                                        'ai.ollama.url',
                                        'ai.ollama.chat_model',
                                        'ai.ollama.embed_model',
                                        'ai.openai.api_key',
                                        'ai.openai.chat_model',
                                        'ai.custom.url',
                                        'ai.custom.key',
                                        'ai.custom.chat_model',
                                        'ai.custom.embed_model'
                                    ])}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Tüm AI Ayarlarını Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── EP OSTA AYARLARI ────────────────────────────────────────── */}
                    <TabsContent value="email">
                        <Card>
                            <CardHeader>
                                <CardTitle>E-Posta Servisleri</CardTitle>
                                <CardDescription>Bildirimler için Resend veya SMTP yapılandırması.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                            <SelectItem value="resend">Resend (Önerilen)</SelectItem>
                                            <SelectItem value="smtp">SMTP (Özel Sunucu)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Gönderen Adresi (From Email)</Label>
                                    <Input
                                        value={getSetting('email.from_address')}
                                        onChange={e => updateValue('email.from_address', e.target.value)}
                                        placeholder="noreply@aluplan.com"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Resend Ayarları</h3>
                                        <div className="space-y-2">
                                            <Label>API Key</Label>
                                            <Input
                                                type="password"
                                                value={getSetting('email.resend.api_key')}
                                                onChange={e => updateValue('email.resend.api_key', e.target.value)}
                                                placeholder="re_..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium">SMTP Ayarları</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Host</Label>
                                                <Input
                                                    value={getSetting('email.smtp.host')}
                                                    onChange={e => updateValue('email.smtp.host', e.target.value)}
                                                    placeholder="smtp.example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Port</Label>
                                                <Input
                                                    value={getSetting('email.smtp.port')}
                                                    onChange={e => updateValue('email.smtp.port', e.target.value)}
                                                    placeholder="587"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kullanıcı Adı</Label>
                                            <Input
                                                value={getSetting('email.smtp.user')}
                                                onChange={e => updateValue('email.smtp.user', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Şifre</Label>
                                            <Input
                                                type="password"
                                                value={getSetting('email.smtp.pass')}
                                                onChange={e => updateValue('email.smtp.pass', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full md:w-auto"
                                    onClick={() => handleSave([
                                        'email.active_provider',
                                        'email.from_address',
                                        'email.resend.api_key',
                                        'email.smtp.host',
                                        'email.smtp.port',
                                        'email.smtp.user',
                                        'email.smtp.pass'
                                    ])}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    E-Posta Ayarlarını Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── SLA AYARLARI ───────────────────────────────────────────── */}
                    <TabsContent value="sla">
                        <Card>
                            <CardHeader>
                                <CardTitle>SLA Politikaları</CardTitle>
                                <CardDescription>Öncelik seviyelerine göre yanıt ve çözüm sürelerini belirleyin.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['critical', 'high', 'medium', 'low'].map(priority => (
                                        <div key={priority} className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                            <h3 className="font-bold uppercase text-sm">{priority}</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Yanıt Süresi (Saat)</Label>
                                                    <Input
                                                        type="number"
                                                        value={getSetting(`sla.${priority}.response_hours`)}
                                                        onChange={e => updateValue(`sla.${priority}.response_hours`, e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Çözüm Süresi (Saat)</Label>
                                                    <Input
                                                        type="number"
                                                        value={getSetting(`sla.${priority}.resolve_hours`)}
                                                        onChange={e => updateValue(`sla.${priority}.resolve_hours`, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full md:w-auto"
                                    onClick={() => handleSave([
                                        'sla.critical.response_hours', 'sla.critical.resolve_hours',
                                        'sla.high.response_hours', 'sla.high.resolve_hours',
                                        'sla.medium.response_hours', 'sla.medium.resolve_hours',
                                        'sla.low.response_hours', 'sla.low.resolve_hours'
                                    ])}
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    SLA Ayarlarını Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── MARKA AYARLARI ─────────────────────────────────────────── */}
                    <TabsContent value="branding">
                        <Card>
                            <CardHeader>
                                <CardTitle>Görsel Kimlik</CardTitle>
                                <CardDescription>Logo ve kurumsal renkleri özelleştirin.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Kurumsal Logo URL</Label>
                                    <Input
                                        value={getSetting('branding.logo_url')}
                                        onChange={e => updateValue('branding.logo_url', e.target.value)}
                                        placeholder="/logo.png"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ana Renk (Primary)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={getSetting('branding.primary_color')}
                                                onChange={e => updateValue('branding.primary_color', e.target.value)}
                                                placeholder="#10B981"
                                            />
                                            <div
                                                className="w-10 h-10 rounded border"
                                                style={{ backgroundColor: getSetting('branding.primary_color') || '#10B981' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vurgu Rengi (Accent)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={getSetting('branding.accent_color')}
                                                onChange={e => updateValue('branding.accent_color', e.target.value)}
                                                placeholder="#F59E0B"
                                            />
                                            <div
                                                className="w-10 h-10 rounded border"
                                                style={{ backgroundColor: getSetting('branding.accent_color') || '#F59E0B' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={() => handleSave(['branding.logo_url', 'branding.primary_color', 'branding.accent_color'])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Kaydet
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
