'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, Lock, Eye, EyeOff, Save, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function CrmSettings() {
    const t = useTranslations('settings.crm');
    const [loading, setLoading] = useState(true);
    const [savingConnection, setSavingConnection] = useState(false);
    const [savingApiKey, setSavingApiKey] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const [instanceUrl, setInstanceUrl] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [crmApiKey, setCrmApiKey] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [connections, apiKeySetting] = await Promise.all([
                    api.crm.getConnections(),
                    api.settings.get('dynamics_api_key')
                ]);

                const dynamics = connections.find((c: any) => c.provider === 'DYNAMICS_365');
                if (dynamics) {
                    setInstanceUrl(dynamics.instanceUrl || '');
                    setTenantId(dynamics.tenantId || '');
                    setClientId(dynamics.clientId || '');
                    setClientSecret(dynamics.clientSecret || '');
                }

                setCrmApiKey(apiKeySetting?.value || '');
            } catch (error: any) {
                console.error('Failed to load CRM settings:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSaveConnection = async () => {
        setSavingConnection(true);
        try {
            await api.crm.upsertConnection({
                provider: 'DYNAMICS_365',
                instanceUrl,
                tenantId,
                clientId,
                clientSecret,
            });
            toast.success(t('save_success'));
        } catch (error: any) {
            toast.error(t('save_error', { message: error.message }));
        } finally {
            setSavingConnection(false);
        }
    };

    const handleSaveApiKey = async () => {
        setSavingApiKey(true);
        try {
            await api.settings.upsert({ key: 'dynamics_api_key', value: crmApiKey, isSecret: true });
            toast.success(t('save_success'));
        } catch (error: any) {
            toast.error(t('save_error', { message: error.message }));
        } finally {
            setSavingApiKey(false);
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

    return (
        <div className="space-y-6">
            <Card className="bg-card/20 backdrop-blur-xl border-white/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-brand-500" /> {t('title')}
                    </CardTitle>
                    <CardDescription>{t('desc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="crm-instance-url">{t('instance_url')}</Label>
                            <Input
                                id="crm-instance-url"
                                value={instanceUrl}
                                onChange={(e) => setInstanceUrl(e.target.value)}
                                className="bg-slate-900/50"
                                placeholder="https://org.crm.dynamics.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="crm-tenant-id">{t('tenant_id')}</Label>
                            <Input
                                id="crm-tenant-id"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                className="bg-slate-900/50"
                                placeholder="00000000-0000..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="crm-client-id">{t('client_id')}</Label>
                            <Input
                                id="crm-client-id"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="bg-slate-900/50"
                                placeholder="00000000-0000..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="crm-client-secret">{t('client_secret')}</Label>
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                                >
                                    {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {showSecret ? 'Gizle' : 'Göster'}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="crm-client-secret"
                                    type={showSecret ? 'text' : 'password'}
                                    value={clientSecret}
                                    onChange={(e) => setClientSecret(e.target.value)}
                                    className="bg-slate-900/50 pr-10"
                                    placeholder="••••••••••••••••"
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="crm-api-key">{t('api_key')}</Label>
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                                >
                                    {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {showApiKey ? 'Gizle' : 'Göster'}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="crm-api-key"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={crmApiKey}
                                    onChange={(e) => setCrmApiKey(e.target.value)}
                                    className="bg-slate-900/50 pr-10"
                                    placeholder="••••••••••••••••"
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-white/5 py-4 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleSaveApiKey}
                        disabled={savingApiKey || savingConnection}
                    >
                        {savingApiKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        {t('save_api_key')}
                    </Button>
                    <Button
                        onClick={handleSaveConnection}
                        disabled={savingConnection || savingApiKey}
                        className="bg-brand-600 hover:bg-brand-500 gap-2"
                    >
                        {savingConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {t('save_connection')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
