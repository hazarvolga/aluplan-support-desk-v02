export const dynamic = "force-dynamic";

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
    XCircle, ExternalLink, Plus, Trash2, Edit2, AlertCircle, Clock,
    Upload, Trash, MessageSquare, Phone, Monitor, Database
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
import { AiTelemetryDashboard } from '@/components/admin/AiTelemetryDashboard';
import { useTranslations } from 'next-intl';
import { SystemRequirementsForm } from '@/components/admin/settings/SystemRequirementsForm';

enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export default function AdminSettingsPage() {
    const t = useTranslations('settings');
    const tc = useTranslations('common');
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any[]>([]);
    const [gmailAuthorizing, setGmailAuthorizing] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [aiHealth, setAiHealth] = useState<any>(null);

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
        loadAiHealth();

        // Read Gmail OAuth2 callback result from URL params
        const gmailStatus = searchParams.get('gmail_status');
        const gmailEmail = searchParams.get('gmail_email');
        const gmailError = searchParams.get('gmail_error');
        if (gmailStatus === 'success') {
            toast({ title: '✅ ' + t('email.authorized'), description: t('toasts.gmail_success') });
        } else if (gmailStatus === 'error') {
            toast({ title: t('email.gmail_title'), description: gmailError || t('toasts.gmail_error'), variant: 'destructive' });
        }
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await api.settings.list(true);
            setSettings(data);
        } catch (error: any) {
            toast({
                title: t('toasts.load_error').split(':')[0],
                description: t('toasts.load_error'),
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadAiHealth = async () => {
        try {
            const res = await api.ai.getHealthStatus();
            setAiHealth(res);
        } catch (e) {
            console.error('Failed to load AI health', e);
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

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingLogo(true);
            const res = await api.branding.uploadLogo(file);
            updateValue('branding.logo_url', res.url);
            toast({ title: '✅ ' + t('branding.logo_title'), description: t('toasts.logo_success') });
        } catch (error: any) {
            toast({
                title: t('toasts.save_error').split(':')[0],
                description: t('toasts.logo_error') + ': ' + error.message,
                variant: 'destructive',
            });
        } finally {
            setUploadingLogo(false);
            // Clear input
            e.target.value = '';
        }
    };

    const handleSave = async (keys: string[]) => {
        try {
            setSaving(true);

            // AI Validation
            const aiKeys = keys.filter(k => k.startsWith('ai.'));
            if (aiKeys.length > 0) {
                const currentChatProvider = getSetting('ai.chat_provider');
                const currentEmbedProvider = getSetting('ai.embed_provider');

                const validateProvider = (p: string) => {
                    const fieldLabels: Record<string, string> = {
                        'api_key': t('ai.validation.fields.api_key'),
                        'chat_model': t('ai.validation.fields.chat_model'),
                        'embed_model': t('ai.validation.fields.embed_model'),
                        'url': t('ai.validation.fields.url')
                    };

                    const checkFields = (providerName: string, fields: string[]) => {
                        const missing = fields.filter(f => !getSetting(f));
                        if (missing.length > 0) {
                            const missingLabels = missing.map(f => {
                                const lastPart = f.split('.').pop() || '';
                                return fieldLabels[lastPart] || lastPart;
                            }).join(', ');

                            throw new Error(t('ai.validation.missing_fields', { fields: missingLabels }));
                        }
                    };

                    if (p === 'openai') {
                        checkFields('OpenAI', ['ai.openai.api_key', 'ai.openai.chat_model', 'ai.openai.embed_model']);
                    } else if (p === 'ollama') {
                        checkFields('Ollama', ['ai.ollama.url', 'ai.ollama.chat_model', 'ai.ollama.embed_model']);
                    } else if (['xai', 'deepseek', 'groq', 'custom', 'llmapi'].includes(p)) {
                        const models = {
                            xai: ['ai.xai.api_key', 'ai.xai.chat_model'],
                            deepseek: ['ai.deepseek.api_key', 'ai.deepseek.chat_model'],
                            groq: ['ai.groq.api_key', 'ai.groq.chat_model'],
                            custom: ['ai.custom.api_key', 'ai.custom.url', 'ai.custom.chat_model', 'ai.custom.embed_model'],
                            llmapi: ['ai.llmapi.api_key', 'ai.llmapi.chat_model', 'ai.llmapi.embed_model']
                        };
                        checkFields(p.toUpperCase(), (models as any)[p]);
                    }
                };

                if (currentChatProvider) validateProvider(currentChatProvider);
                if (currentEmbedProvider && currentEmbedProvider !== currentChatProvider) validateProvider(currentEmbedProvider);
            }


            const secretKeys = [
                'ai.llmapi.api_key',
                'ai.openai.api_key',
                'ai.xai.api_key',
                'ai.deepseek.api_key',
                'ai.groq.api_key',
                'ai.custom.api_key',
                'email.resend.api_key',
                'email.smtp.pass',
                'email.gmail.client_secret',
                'email.gmail.refresh_token',
                'whatsapp.access_token',
                'whatsapp.verify_token',
            ];

            const promises = keys
                .map(key => {
                    const value = getSetting(key);
                    const isSecret = secretKeys.includes(key);
                    return { key, value, isSecret };
                })
                .filter(item => item.value !== '' && item.value !== '********')
                .map(payload => api.settings.upsert(payload));
            await Promise.all(promises);
            toast({
                title: t('toasts.success'),
                description: t('toasts.save_success'),
            });
        } catch (error: any) {
            toast({
                title: t('toasts.generic_error'),
                description: error.message || t('toasts.save_error'),
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
            console.error(t('sla.load_error'), err);
        }
    };

    const handleSavePolicy = async () => {
        try {
            setSaving(true);
            if (editingPolicy) {
                await api.sla.update(editingPolicy.id, newPolicy);
                toast({ title: t('toasts.success'), description: t('toasts.policy_save_success') });
            } else {
                await api.sla.create(newPolicy);
                toast({ title: t('toasts.success'), description: t('toasts.policy_save_success') });
            }
            setIsAddingPolicy(false);
            setEditingPolicy(null);
            loadSlaData();
        } catch (err: any) {
            toast({ title: t('toasts.save_error').split(':')[0], description: err.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePolicy = async (id: string) => {
        if (!confirm(t('toasts.policy_confirm_delete'))) return;
        try {
            await api.sla.delete(id);
            toast({ title: t('toasts.success'), description: t('toasts.policy_delete_success') });
            loadSlaData();
        } catch (err: any) {
            toast({ title: t('toasts.save_error').split(':')[0], description: err.message, variant: 'destructive' });
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
            URGENT: 'bg-red-500/10 text-red-500 border-red-500/20',
            CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
            HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            MEDIUM: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            LOW: 'bg-green-500/10 text-green-500 border-green-500/20',
        };
        return <Badge variant="outline" className={styles[priority] || ''}>{tc(`priorities.${priority}`)}</Badge>;
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
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 lg:w-[840px]">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> {t('tabs.general')}
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
                        <Bot className="h-4 w-4" /> {t('tabs.ai')}
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> {t('tabs.email')}
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> {t('tabs.whatsapp')}
                    </TabsTrigger>
                    <TabsTrigger value="sla" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> {t('tabs.sla')}
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" /> {t('tabs.branding')}
                    </TabsTrigger>
                    <TabsTrigger value="requirements" className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" /> {t('tabs.requirements')}
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {/* ─── GENEL AYARLAR ────────────────────────────────────────── */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('general.title')}</CardTitle>
                                <CardDescription>{t('general.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('general.portal_name')}</Label>
                                    <Input
                                        value={getSetting('general.portal_name')}
                                        onChange={e => updateValue('general.portal_name', e.target.value)}
                                        placeholder={t('general.portal_name_placeholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('general.frontend_url')}</Label>
                                    <Input
                                        value={getSetting('general.frontend_url')}
                                        onChange={e => updateValue('general.frontend_url', e.target.value)}
                                        placeholder={t('general.frontend_url_placeholder')}
                                    />
                                </div>
                                <Button onClick={() => handleSave(['general.portal_name', 'general.frontend_url'])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('ai.save_btn')}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── AI AYARLARI ─────────────────────────────────────────── */}
                    <TabsContent value="ai">
                        <AiTelemetryDashboard />
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('ai.title')}</CardTitle>
                                <CardDescription>{t('ai.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Auto-Fallback & Health Info Card */}
                                <div className="mb-6 p-5 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-background to-indigo-500/5 backdrop-blur-xl relative overflow-hidden shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                    <div className="space-y-1 z-10 w-full md:w-3/4">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                                            <h3 className="font-semibold text-base text-foreground tracking-tight">Auto-Fallback & Live Routing</h3>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                            Ana AI modeli çöktüğünde veya hız limitine takıldığında, konuşmalar ve işlemler hataya düşmeden otomatik olarak belirlediğiniz 'Fallback' (Yedek) modeline devredilir.
                                        </p>
                                    </div>
                                    <div className="z-10 flex items-center gap-4 bg-background/50 border rounded-lg p-3 shrink-0">
                                        {aiHealth ? (
                                            <>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Primary</span>
                                                    <Badge variant="outline" className={`text-[10px] ${aiHealth?.providers?.[aiHealth?.chatProvider]?.available ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 'bg-red-500/15 text-red-500 border-red-500/20'}`}>
                                                        {aiHealth?.providers?.[aiHealth?.chatProvider]?.available ? 'ONLINE' : 'DOWN'}
                                                    </Badge>
                                                </div>
                                                <div className="h-6 w-px bg-border"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Fallback</span>
                                                    <Badge variant="outline" className={`text-[10px] ${getSetting('ai.fallback_provider') && getSetting('ai.fallback_provider') !== 'none' ? (aiHealth?.providers?.[getSetting('ai.fallback_provider')]?.available ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 'bg-red-500/15 text-red-500 border-red-500/20') : 'bg-muted text-muted-foreground border-border'}`}>
                                                        {!getSetting('ai.fallback_provider') || getSetting('ai.fallback_provider') === 'none' ? 'OFF' : (aiHealth?.providers?.[getSetting('ai.fallback_provider')]?.available ? 'STANDBY' : 'DOWN')}
                                                    </Badge>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> <span className="text-xs text-muted-foreground">Checking...</span></div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6 pb-6 border-b border-border/40">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                        {/* Primary Providers */}
                                        <div className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                                            <div className="flex items-center justify-between border-b pb-2 mb-2">
                                                <h4 className="font-bold text-sm tracking-wide text-foreground">1. Primary AI</h4>
                                                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">ACTIVE</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[12px] font-bold tracking-widest uppercase">{t('ai.chat_provider')}</Label>
                                                <Select value={getSetting('ai.chat_provider') || getSetting('ai.active_provider') || 'ollama'} onValueChange={v => updateValue('ai.chat_provider', v)}>
                                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ollama">{t('ai.providers.ollama')}</SelectItem>
                                                        <SelectItem value="openai">{t('ai.providers.openai_cloud')}</SelectItem>
                                                        <SelectItem value="xai">{t('ai.providers.xai')}</SelectItem>
                                                        <SelectItem value="groq">{t('ai.providers.groq')}</SelectItem>
                                                        <SelectItem value="deepseek">{t('ai.providers.deepseek')}</SelectItem>
                                                        <SelectItem value="llmapi">{t('ai.providers.llmapi')}</SelectItem>
                                                        <SelectItem value="custom">{t('ai.providers.custom')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[12px] font-bold tracking-widest uppercase">{t('ai.embed_provider')}</Label>
                                                <Select value={getSetting('ai.embed_provider') || getSetting('ai.active_provider') || 'ollama'} onValueChange={v => updateValue('ai.embed_provider', v)}>
                                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ollama">{t('ai.providers.ollama')}</SelectItem>
                                                        <SelectItem value="openai">{t('ai.providers.openai_cloud')}</SelectItem>
                                                        <SelectItem value="groq">{t('ai.providers.groq_no_embed')}</SelectItem>
                                                        <SelectItem value="llmapi">{t('ai.providers.llmapi')}</SelectItem>
                                                        <SelectItem value="custom">{t('ai.providers.custom_info')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Fallback Providers */}
                                        <div className="space-y-4 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                            <div className="flex items-center justify-between border-b border-orange-500/10 pb-2 mb-2">
                                                <h4 className="font-bold text-sm tracking-wide text-foreground">2. Fallback AI</h4>
                                                <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">STANDBY</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[12px] font-bold tracking-widest uppercase flex items-center gap-1.5"><Globe className="h-3 w-3" /> FALLBACK CHAT</Label>
                                                <Select value={getSetting('ai.fallback_provider') || 'none'} onValueChange={v => updateValue('ai.fallback_provider', v)}>
                                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- Devre Dışı --</SelectItem>
                                                        <SelectItem value="ollama">{t('ai.providers.ollama')}</SelectItem>
                                                        <SelectItem value="openai">{t('ai.providers.openai_cloud')}</SelectItem>
                                                        <SelectItem value="xai">{t('ai.providers.xai')}</SelectItem>
                                                        <SelectItem value="groq">{t('ai.providers.groq')}</SelectItem>
                                                        <SelectItem value="deepseek">{t('ai.providers.deepseek')}</SelectItem>
                                                        <SelectItem value="llmapi">{t('ai.providers.llmapi')}</SelectItem>
                                                        <SelectItem value="custom">{t('ai.providers.custom')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[12px] font-bold tracking-widest uppercase flex items-center gap-1.5"><Database className="h-3 w-3" /> FALLBACK EMBED</Label>
                                                <Select value={getSetting('ai.embed_fallback_provider') || 'none'} onValueChange={v => updateValue('ai.embed_fallback_provider', v)}>
                                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- Devre Dışı --</SelectItem>
                                                        <SelectItem value="ollama">{t('ai.providers.ollama')}</SelectItem>
                                                        <SelectItem value="openai">{t('ai.providers.openai_cloud')}</SelectItem>
                                                        <SelectItem value="llmapi">{t('ai.providers.llmapi')}</SelectItem>
                                                        <SelectItem value="custom">{t('ai.providers.custom_info')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {([getSetting('ai.chat_provider'), getSetting('ai.embed_provider'), getSetting('ai.fallback_provider'), getSetting('ai.embed_fallback_provider')].includes('ollama')) && (
                                        /* Ollama Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <Bot className="h-4 w-4" /> {t('ai.ollama.title')}
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('ollama');
                                                        toast({ title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'), description: res.message || (res.success ? t('toasts.ollama_ok') : t('toasts.ollama_fail')), variant: res.success ? 'default' : 'destructive' });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.base_url')}</Label>
                                                <Input value={getSetting('ai.ollama.url')} onChange={e => updateValue('ai.ollama.url', e.target.value)} placeholder="http://localhost:11434" className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.ollama.chat_model')}</Label>
                                                    <Input value={getSetting('ai.ollama.chat_model')} onChange={e => updateValue('ai.ollama.chat_model', e.target.value)} placeholder="llama3.2:3b" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.ollama.embed_model')}</Label>
                                                    <Input value={getSetting('ai.ollama.embed_model')} onChange={e => updateValue('ai.ollama.embed_model', e.target.value)} placeholder="nomic-embed-text" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {([getSetting('ai.chat_provider'), getSetting('ai.embed_provider'), getSetting('ai.fallback_provider'), getSetting('ai.embed_fallback_provider')].includes('openai')) && (
                                        /* OpenAI Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <Globe className="h-4 w-4" /> {t('ai.openai.title')}
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('openai');
                                                        toast({ title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'), description: res.message || (res.success ? t('toasts.openai_ok') : t('toasts.openai_fail')), variant: res.success ? 'default' : 'destructive' });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.api_key')}</Label>
                                                <Input type="password" value={getSetting('ai.openai.api_key')} onChange={e => updateValue('ai.openai.api_key', e.target.value)} placeholder="sk-..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.openai.chat_model')}</Label>
                                                    <Input value={getSetting('ai.openai.chat_model')} onChange={e => updateValue('ai.openai.chat_model', e.target.value)} placeholder="gpt-4o-mini" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.openai.embed_model')}</Label>
                                                    <Input value={getSetting('ai.openai.embed_model')} onChange={e => updateValue('ai.openai.embed_model', e.target.value)} placeholder="text-embedding-3-small" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {([getSetting('ai.chat_provider'), getSetting('ai.fallback_provider')].includes('xai')) && (
                                        /* xAI (Grok) Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <Bot className="h-4 w-4" /> {t('ai.xai.title')}
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('xai');
                                                        toast({
                                                            title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'),
                                                            description: res.message || (res.success ? t('toasts.xai_ok') : t('toasts.xai_fail')),
                                                            variant: res.success ? 'default' : 'destructive'
                                                        });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.api_key')}</Label>
                                                <Input type="password" value={getSetting('ai.xai.api_key')} onChange={e => updateValue('ai.xai.api_key', e.target.value)} placeholder="xai-..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.base_url_optional')}</Label>
                                                <Input value={getSetting('ai.xai.url')} onChange={e => updateValue('ai.xai.url', e.target.value)} placeholder="https://api.x.ai/v1" className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.xai.chat_model')}</Label>
                                                    <Input value={getSetting('ai.xai.chat_model')} onChange={e => updateValue('ai.xai.chat_model', e.target.value)} placeholder="grok-2-latest" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">{t('tabs.ai')}</Label>
                                                    <Input disabled value={t('ai.xai.not_supported')} className="bg-black/20 h-8 text-sm text-muted-foreground border-dashed" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {([getSetting('ai.chat_provider'), getSetting('ai.embed_provider'), getSetting('ai.fallback_provider'), getSetting('ai.embed_fallback_provider')].includes('groq')) && (
                                        /* Groq Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <Bot className="h-4 w-4" /> {t('ai.providers.groq')}
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('groq');
                                                        toast({
                                                            title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'),
                                                            description: res.message || (res.success ? t('toasts.groq_ok') : t('toasts.groq_fail')),
                                                            variant: res.success ? 'default' : 'destructive'
                                                        });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.api_key')}</Label>
                                                <Input type="password" value={getSetting('ai.groq.api_key')} onChange={e => updateValue('ai.groq.api_key', e.target.value)} placeholder="gsk_..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.base_url_optional')}</Label>
                                                <Input value={getSetting('ai.groq.url')} onChange={e => updateValue('ai.groq.url', e.target.value)} placeholder="https://api.groq.com/openai/v1" className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Model</label>
                                                    <Input value={getSetting('ai.groq.chat_model')} onChange={e => updateValue('ai.groq.chat_model', e.target.value)} placeholder="llama-3.1-8b-instant" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">{t('ai.embedding')}</Label>
                                                    <Input disabled value={t('ai.unsupported')} className="bg-black/20 h-8 text-sm text-muted-foreground border-dashed" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {([getSetting('ai.chat_provider'), getSetting('ai.fallback_provider')].includes('deepseek')) && (
                                        /* DeepSeek Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <Bot className="h-4 w-4" /> {t('ai.providers.deepseek')}
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('deepseek');
                                                        toast({
                                                            title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'),
                                                            description: res.message || (res.success ? t('toasts.deepseek_ok') : t('toasts.deepseek_fail')),
                                                            variant: res.success ? 'default' : 'destructive'
                                                        });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.api_key')}</Label>
                                                <Input type="password" value={getSetting('ai.deepseek.api_key')} onChange={e => updateValue('ai.deepseek.api_key', e.target.value)} placeholder="sk-..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.base_url_optional')}</Label>
                                                <Input value={getSetting('ai.deepseek.url')} onChange={e => updateValue('ai.deepseek.url', e.target.value)} placeholder="https://api.deepseek.com/v1" className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.chat_model')}</Label>
                                                    <Input value={getSetting('ai.deepseek.chat_model')} onChange={e => updateValue('ai.deepseek.chat_model', e.target.value)} placeholder="deepseek-chat" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">{t('ai.embedding')}</Label>
                                                    <Input disabled value={t('ai.unsupported')} className="bg-black/20 h-8 text-sm text-muted-foreground border-dashed" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {([getSetting('ai.chat_provider'), getSetting('ai.embed_provider'), getSetting('ai.fallback_provider'), getSetting('ai.embed_fallback_provider')].includes('llmapi')) && (
                                        /* LLMAPI Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <ShieldCheck className="h-4 w-4" /> LLMAPI.ai
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('llmapi');
                                                        toast({
                                                            title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'),
                                                            description: res.message || (res.success ? t('toasts.llmapi_ok') : t('toasts.llmapi_fail')),
                                                            variant: res.success ? 'default' : 'destructive'
                                                        });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.api_key')}</Label>
                                                <Input type="password" value={getSetting('ai.llmapi.api_key')} onChange={e => updateValue('ai.llmapi.api_key', e.target.value)} placeholder="llm-..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.base_url_optional')}</Label>
                                                <Input value={getSetting('ai.llmapi.base_url')} onChange={e => updateValue('ai.llmapi.base_url', e.target.value)} placeholder="https://api.llmapi.io" className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.chat_model')}</Label>
                                                    <Input value={getSetting('ai.llmapi.chat_model')} onChange={e => updateValue('ai.llmapi.chat_model', e.target.value)} placeholder="gpt-4o" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.embed_model')}</Label>
                                                    <Input value={getSetting('ai.llmapi.embed_model')} onChange={e => updateValue('ai.llmapi.embed_model', e.target.value)} placeholder="text-embedding-3-small" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {([getSetting('ai.chat_provider'), getSetting('ai.embed_provider'), getSetting('ai.fallback_provider'), getSetting('ai.embed_fallback_provider')].includes('custom')) && (
                                        /* Custom OpenAI Ayarları */
                                        <div className={`space-y-4 p-5 border-2 rounded-lg relative overflow-hidden transition-all duration-200 border-primary/40 bg-primary/5`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 text-foreground`}>
                                                    <Bot className="h-4 w-4" /> {t('ai.providers.other_custom')}
                                                </h3>
                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={async () => {
                                                    try {
                                                        const res = await api.ai.testConnection('custom');
                                                        toast({
                                                            title: res.success ? t('toasts.connection_success') : t('toasts.connection_failed'),
                                                            description: res.message || (res.success ? t('toasts.custom_ok') : t('toasts.custom_fail')),
                                                            variant: res.success ? 'default' : 'destructive'
                                                        });
                                                    } catch (e: any) {
                                                        toast({ title: t('toasts.connection_error'), description: e.message || t('toasts.server_unreachable'), variant: 'destructive' });
                                                    }
                                                }}>{t('ai.test_btn')}</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('email.redirect_uri_label')}</Label>
                                                <Input value={getSetting('ai.custom.url')} onChange={e => updateValue('ai.custom.url', e.target.value)} placeholder="https://..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t('ai.api_key')}</Label>
                                                <Input type="password" value={getSetting('ai.custom.api_key')} onChange={e => updateValue('ai.custom.api_key', e.target.value)} placeholder="sk-..." className="bg-black/50 h-8 text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.chat_model')}</Label>
                                                    <Input value={getSetting('ai.custom.chat_model')} onChange={e => updateValue('ai.custom.chat_model', e.target.value)} placeholder="model-name" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">{t('ai.embed_model')}</Label>
                                                    <Input value={getSetting('ai.custom.embed_model')} onChange={e => updateValue('ai.custom.embed_model', e.target.value)} placeholder="embed-name" className="bg-black/50 h-8 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 mt-4 border-t border-border/40 flex justify-end">
                                    <Button
                                        onClick={() => handleSave([
                                            'ai.chat_provider',
                                            'ai.embed_provider',
                                            'ai.fallback_provider',
                                            'ai.embed_fallback_provider',
                                            'ai.active_provider', // kept for backwards compatibility during migration 
                                            'ai.ollama.url',
                                            'ai.ollama.chat_model',
                                            'ai.ollama.embed_model',
                                            'ai.openai.api_key',
                                            'ai.openai.chat_model',
                                            'ai.openai.embed_model',
                                            'ai.llmapi.api_key',
                                            'ai.llmapi.base_url',
                                            'ai.llmapi.chat_model',
                                            'ai.llmapi.embed_model',
                                            'ai.xai.api_key',
                                            'ai.xai.url',
                                            'ai.xai.chat_model',
                                            'ai.groq.api_key',
                                            'ai.groq.url',
                                            'ai.groq.chat_model',
                                            'ai.deepseek.api_key',
                                            'ai.deepseek.url',
                                            'ai.deepseek.chat_model',
                                            'ai.custom.url',
                                            'ai.custom.api_key',
                                            'ai.custom.chat_model',
                                            'ai.custom.embed_model'
                                        ])}
                                        disabled={saving}
                                        className="h-10 px-8 font-bold"
                                    >
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('ai.save_btn')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── E-POSTA AYARLARI (RECOVERED) ─────────────────────────── */}
                    <TabsContent value="email">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('email.title')}</CardTitle>
                                <CardDescription>{t('email.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('email.active_provider')}</Label>
                                        <Select
                                            value={getSetting('email.active_provider') || 'resend'}
                                            onValueChange={v => updateValue('email.active_provider', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="resend">{t('email.providers.resend')}</SelectItem>
                                                <SelectItem value="smtp">{t('email.providers.smtp')}</SelectItem>
                                                <SelectItem value="gmail">{t('email.providers.gmail')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('email.from_address')}</Label>
                                        <Input
                                            value={getSetting('email.from_address')}
                                            onChange={e => updateValue('email.from_address', e.target.value)}
                                            placeholder="noreply@aluplan.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    {((getSetting('email.active_provider') === 'resend') || !getSetting('email.active_provider')) && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <h3 className="font-medium">{t('email.resend_title')}</h3>
                                            <div className="space-y-2">
                                                <Label>{t('email.resend_api_key')}</Label>
                                                <Input
                                                    type="password"
                                                    value={getSetting('email.resend.api_key')}
                                                    onChange={e => updateValue('email.resend.api_key', e.target.value)}
                                                    placeholder="re_..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {getSetting('email.active_provider') === 'smtp' && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <h3 className="font-medium">{t('email.smtp_title')}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>{t('email.smtp_host')}</Label>
                                                    <Input
                                                        value={getSetting('email.smtp.host')}
                                                        onChange={e => updateValue('email.smtp.host', e.target.value)}
                                                        placeholder="smtp.gmail.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('email.smtp_port')}</Label>
                                                    <Input
                                                        value={getSetting('email.smtp.port')}
                                                        onChange={e => updateValue('email.smtp.port', e.target.value)}
                                                        placeholder="587"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('email.smtp_user')}</Label>
                                                    <Input
                                                        value={getSetting('email.smtp.user')}
                                                        onChange={e => updateValue('email.smtp.user', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('email.smtp_pass')}</Label>
                                                    <Input
                                                        type="password"
                                                        value={getSetting('email.smtp.pass')}
                                                        onChange={e => updateValue('email.smtp.pass', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {getSetting('email.active_provider') === 'gmail' && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">{t('email.gmail_title')}</h3>
                                                {gmailTokenStatus === 'ok' && (
                                                    <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('email.authorized')}
                                                    </span>
                                                )}
                                                {gmailTokenStatus === 'missing' && (
                                                    <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                                                        <XCircle className="h-3.5 w-3.5" /> {t('email.not_authorized')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label>{t('email.from_address_label')}</Label>
                                                    <Input
                                                        value={getSetting('email.gmail.email')}
                                                        onChange={e => updateValue('email.gmail.email', e.target.value)}
                                                        placeholder="newsletters@aluplan.info"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('email.gmail_client_id')}</Label>
                                                    <Input
                                                        value={getSetting('email.gmail.client_id')}
                                                        onChange={e => updateValue('email.gmail.client_id', e.target.value)}
                                                        placeholder="258437053886-....apps.googleusercontent.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('email.gmail_client_secret')}</Label>
                                                    <Input
                                                        type="password"
                                                        value={getSetting('email.gmail.client_secret')}
                                                        onChange={e => updateValue('email.gmail.client_secret', e.target.value)}
                                                        placeholder="GOCSPX-..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">{t('email.redirect_uri_label')}</Label>
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
                                                    onClick={() => handleSave(['email.gmail.email', 'email.gmail.client_id', 'email.gmail.client_secret'])}
                                                >
                                                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                    {t('email.gmail.credentials_save')}
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
                                                            toast({ title: t('toasts.connection_error'), description: err.message || t('toasts.gmail_credentials_hint'), variant: 'destructive' });
                                                        } finally {
                                                            setGmailAuthorizing(false);
                                                        }
                                                    }}
                                                >
                                                    {gmailAuthorizing
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <ExternalLink className="h-3.5 w-3.5" />
                                                    }
                                                    {t('email.gmail.authorize_btn')}
                                                </Button>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {t('email.gmail.auth_hint')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleSave([
                                            'email.active_provider', 'email.from_address',
                                            'email.resend.api_key', 'email.smtp.host', 'email.smtp.port', 'email.smtp.user', 'email.smtp.pass',
                                            'email.gmail.email', 'email.gmail.client_id', 'email.gmail.client_secret',
                                        ])}
                                        disabled={saving}
                                    >
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('email.save_provider_btn')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={async () => {
                                            try {
                                                const res = await api.email.verifyProvider();
                                                if (res.available) {
                                                    toast({ title: t('toasts.connection_success'), description: t('toasts.generic_success_hint', { provider: res.provider.toUpperCase() }) });
                                                } else {
                                                    toast({ title: t('toasts.connection_failed'), description: t('toasts.generic_fail_hint'), variant: 'destructive' });
                                                }
                                            } catch (err: any) {
                                                toast({ title: t('toasts.error') || t('toasts.generic_error'), description: err.message || t('toasts.generic_error'), variant: 'destructive' });
                                            }
                                        }}
                                    >
                                        {t('email.test_connection_btn')}
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
                                    <CardTitle>{t('sla.title')}</CardTitle>
                                    <CardDescription>{t('sla.description')}</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingPolicy(null); setIsAddingPolicy(true); }}>
                                    <Plus className="mr-2 h-4 w-4" /> {t('sla.add_policy')}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('sla.table.name')}</TableHead>
                                            <TableHead>{t('sla.table.priority')}</TableHead>
                                            <TableHead>{t('sla.table.department')}</TableHead>
                                            <TableHead className="text-center">{t('sla.table.response')}</TableHead>
                                            <TableHead className="text-center">{t('sla.table.resolution')}</TableHead>
                                            <TableHead>{t('sla.table.hours')}</TableHead>
                                            <TableHead className="text-right">{t('sla.table.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {policies.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
                                                    {t('sla.empty_state') || 'No SLA policies defined yet.'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            policies.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{p.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getPriorityBadge(p.priority)}</TableCell>
                                                    <TableCell>{p.department?.name || '-'}</TableCell>
                                                    <TableCell className="text-center font-medium text-blue-500">{p.firstResponseMinutes} dk</TableCell>
                                                    <TableCell className="text-center font-medium text-blue-500">{p.resolutionMinutes} dk</TableCell>
                                                    <TableCell>
                                                        {p.businessHoursOnly ? (
                                                            <span className="flex items-center gap-1.5 text-xs text-amber-500">
                                                                <Clock className="h-3.5 w-3.5" /> {t('sla.form.business_hours')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">24/7</span>
                                                        )}
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

                                <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                    <div className="text-xs text-blue-700/80 leading-relaxed">
                                        <strong>{t('sla.how_it_works')}</strong> {t('sla.how_it_works_desc')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Dialog open={isAddingPolicy} onOpenChange={setIsAddingPolicy}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingPolicy ? t('sla.form.edit_title') : t('sla.form.new_title')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>{t('sla.form.name_label')}</Label>
                                        <Input id="sla_name" placeholder={t('sla.form.placeholders.name')} defaultValue={editingPolicy?.name} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('sla.form.priority_label')}</Label>
                                            <Select defaultValue={editingPolicy?.priority || 'MEDIUM'}>
                                                <SelectTrigger id="sla_priority_trigger">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LOW">{tc('priorities.LOW')}</SelectItem>
                                                    <SelectItem value="MEDIUM">{tc('priorities.MEDIUM')}</SelectItem>
                                                    <SelectItem value="HIGH">{tc('priorities.HIGH')}</SelectItem>
                                                    <SelectItem value="URGENT">{tc('priorities.URGENT')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('sla.form.department_label')}</Label>
                                            <Input id="sla_department" placeholder={t('sla.form.placeholders.department')} defaultValue={editingPolicy?.department || ''} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('sla.form.response_label')}</Label>
                                            <Input id="sla_response" type="number" defaultValue={editingPolicy?.firstResponseMinutes || 60} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('sla.form.resolve_label')}</Label>
                                            <Input id="sla_resolve" type="number" defaultValue={editingPolicy?.resolutionMinutes || 240} />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="sla_business"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                            defaultChecked={editingPolicy?.businessHoursOnly}
                                        />
                                        <Label htmlFor="sla_business" className="text-sm font-normal">
                                            {t('sla.form.business_hours')}
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddingPolicy(false)}>{t('sla.form.cancel_btn')}</Button>
                                    <Button onClick={handleSavePolicy} disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('ai.save_btn')}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* ─── MARKA AYARLARI ────────────────────────────────────────── */}
                    <TabsContent value="branding">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('branding.title')}</CardTitle>
                                <CardDescription>{t('branding.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label>{t('branding.logo_label')}</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-40 rounded border bg-muted/20 flex items-center justify-center overflow-hidden">
                                            {getSetting('branding.logo_url') ? (
                                                <img
                                                    src={getSetting('branding.logo_url')}
                                                    alt="Logo"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <Palette className="h-8 w-8 text-muted-foreground/40" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                                    disabled={uploadingLogo}
                                                >
                                                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                                    {t('branding.upload_btn')}
                                                </Button>
                                                {getSetting('branding.logo_url') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() => updateValue('branding.logo_url', '')}
                                                    >
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        {tc('reset')}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{t('branding.logo_hint')}</p>
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                className="hidden"
                                                accept="image/png,image/jpeg,image/svg+xml"
                                                onChange={handleLogoSelect}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div className="space-y-2">
                                        <Label>{t('branding.company_label')}</Label>
                                        <Input
                                            value={getSetting('branding.company_name')}
                                            onChange={e => updateValue('branding.company_name', e.target.value)}
                                            placeholder={t('branding.placeholders.company')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('branding.email_label')}</Label>
                                        <Input
                                            value={getSetting('branding.email')}
                                            onChange={e => updateValue('branding.email', e.target.value)}
                                            placeholder={t('branding.placeholders.email')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('branding.phone_label')}</Label>
                                        <Input
                                            value={getSetting('branding.phone')}
                                            onChange={e => updateValue('branding.phone', e.target.value)}
                                            placeholder={t('branding.placeholders.phone')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('branding.address_label')}</Label>
                                        <textarea
                                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={getSetting('branding.address')}
                                            onChange={e => updateValue('branding.address', e.target.value)}
                                            placeholder={t('branding.placeholders.address')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-sm font-medium border-b pb-2">{t('branding.social_links')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={() => handleSave([
                                            'branding.company_name',
                                            'branding.logo_url',
                                            'branding.email',
                                            'branding.phone',
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
                                        {t('branding.save_btn')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── WHATSAPP AYARLARI ─────────────────────────────────────── */}
                    <TabsContent value="whatsapp">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t('whatsapp.title')}</CardTitle>
                                        <CardDescription>{t('whatsapp.description')}</CardDescription>
                                    </div>
                                    <Badge variant={getSetting('whatsapp.access_token') && getSetting('whatsapp.phone_number_id') ? "default" : "secondary"}>
                                        {getSetting('whatsapp.access_token') && getSetting('whatsapp.phone_number_id') ? t('whatsapp.status_configured') : t('whatsapp.status_missing')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('whatsapp.verify_token')}</Label>
                                        <Input
                                            value={getSetting('whatsapp.verify_token')}
                                            onChange={e => updateValue('whatsapp.verify_token', e.target.value)}
                                            placeholder="my_secure_token_123"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('whatsapp.phone_number_id')}</Label>
                                        <Input
                                            value={getSetting('whatsapp.phone_number_id')}
                                            onChange={e => updateValue('whatsapp.phone_number_id', e.target.value)}
                                            placeholder="123456789012345"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('whatsapp.access_token')}</Label>
                                    <Input
                                        type="password"
                                        value={getSetting('whatsapp.access_token')}
                                        onChange={e => updateValue('whatsapp.access_token', e.target.value)}
                                        placeholder="EAAB..."
                                    />
                                </div>

                                <div className="p-4 rounded-lg bg-muted/40 border space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                        {t('whatsapp.webhook_url')}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            className="font-mono text-xs bg-background"
                                            value={`${typeof window !== 'undefined' ? (window.location.origin.includes('localhost') ? 'http://localhost:4000' : window.location.origin.replace('//dashboard.', '//api.')) : ''}/api/v1/whatsapp/webhook`}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const origin = window.location.origin;
                                                const url = origin.includes('localhost')
                                                    ? 'http://localhost:4000/api/v1/whatsapp/webhook'
                                                    : `${origin.replace('//dashboard.', '//api.')}/api/v1/whatsapp/webhook`;
                                                navigator.clipboard.writeText(url);
                                                toast({ title: tc('success_title'), description: t('toasts.url_copied') });
                                            }}
                                        >
                                            {tc('copy')}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('whatsapp.webhook_hint')}
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={() => handleSave(['whatsapp.verify_token', 'whatsapp.access_token', 'whatsapp.phone_number_id'])}
                                        disabled={saving}
                                    >
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('whatsapp.save_btn')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requirements">
                        <SystemRequirementsForm />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
