'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardDrive, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage, type Setting } from '../settings-types';
import { toCredentialOverride } from '@/lib/ai-provider-policy';

export function StorageSettings() {
    const t = useTranslations('settings.storage');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const [accessKey, setAccessKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [bucket, setBucket] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const settings = await api.settings.list();
                const typedSettings = settings as Setting[];
                setAccessKey(typedSettings.find((setting) => setting.key === 'r2_access_key_id')?.value || '');
                setSecretKey(typedSettings.find((setting) => setting.key === 'r2_secret_access_key')?.value || '');
                setEndpoint(typedSettings.find((setting) => setting.key === 'r2_endpoint')?.value || '');
                setBucket(typedSettings.find((setting) => setting.key === 'r2_bucket_name')?.value || 'aluplan-docs');
            } catch (error: unknown) {
                console.error('Failed to load storage settings:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const accessKeyOverride = toCredentialOverride(accessKey);
            const secretKeyOverride = toCredentialOverride(secretKey);
            const updates = [
                api.settings.upsert({ key: 'r2_endpoint', value: endpoint, isSecret: false }),
                api.settings.upsert({ key: 'r2_bucket_name', value: bucket, isSecret: false })
            ];
            if (accessKeyOverride) {
                updates.push(api.settings.upsert({ key: 'r2_access_key_id', value: accessKeyOverride, isSecret: true }));
            }
            if (secretKeyOverride) {
                updates.push(api.settings.upsert({ key: 'r2_secret_access_key', value: secretKeyOverride, isSecret: true }));
            }
            await Promise.all(updates);
            if (accessKeyOverride) setAccessKey('********');
            if (secretKeyOverride) setSecretKey('********');
            toast.success(t('save_success'));
        } catch (error: unknown) {
            toast.error(t('save_error', { message: getErrorMessage(error) }));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

    return (
        <Card className="bg-card/20 backdrop-blur-xl border-white/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-brand-500" /> {t('title')}
                </CardTitle>
                <CardDescription>{t('desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="r2-access-key">{t('access_key')}</Label>
                    <Input
                        id="r2-access-key"
                        type="password"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        className="bg-slate-900/50"
                        placeholder="23d3003..."
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="r2-secret-key">{t('secret_key')}</Label>
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
                            id="r2-secret-key"
                            type={showSecret ? 'text' : 'password'}
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            className="bg-slate-900/50 pr-10"
                            placeholder="••••••••••••••••"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="r2-endpoint">{t('endpoint')}</Label>
                    <Input
                        id="r2-endpoint"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="bg-slate-900/50"
                        placeholder="https://<id>.r2.cloudflarestorage.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="r2-bucket">{t('bucket')}</Label>
                    <Input
                        id="r2-bucket"
                        value={bucket}
                        onChange={(e) => setBucket(e.target.value)}
                        className="bg-slate-900/50"
                        placeholder="aluplan-support-attachments"
                    />
                </div>
            </CardContent>
            <CardFooter className="bg-white/5 py-4 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-brand-600 hover:bg-brand-500 gap-2"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t('save_btn', { defaultValue: 'Kaydet' })}
                </Button>
            </CardFooter>
        </Card>
    );
}
