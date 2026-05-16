'use client';

export const dynamic = "force-dynamic";


import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Save, CheckCircle2, AlertCircle, History, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { FieldMapping } from './field-mapping';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations, useLocale } from 'next-intl';
import { getSocket } from '@/lib/socket';

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

interface SyncDetails {
    failedRecords: Array<{ externalId: string; entityType: string; errorMessage: string; errorCode?: string }>;
    skippedRecords: Array<{ externalId: string; reason: string }>;
    skippedLinks: Array<{ contactExternalId: string; missingAccountExternalId: string }>;
    summary: { successCount: number; errorCount: number; skippedCount: number };
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
    details: SyncDetails | null;
}

interface CrmChangeLog {
    id: string;
    entityType: string;
    entityId: string;
    localRecordId: string | null;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    source: string;
    status: string;
    changedAt: string;
}

import { use } from 'react';

export default function CrmManagementPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('customers');
    const tc = useTranslations('common');
    const { toast } = useToast();
    const [config, setConfig] = useState({
        provider: 'DYNAMICS_365',
        tenantId: '',
        clientId: '',
        clientSecret: '',
        webhookSecret: '',
        instanceUrl: '',
        syncSettings: {
            accountMapping: {},
            contactMapping: {},
            displaySettings: {
                account: [] as unknown as Array<{ key: string; visible?: boolean }>,
                contact: [] as unknown as Array<{ key: string; visible?: boolean }>,
            }
        },
    });

    const [fieldDefinitions, setFieldDefinitions] = useState<{
        account: any[];
        contact: any[];
    } | null>(null);

    const [discoveryData, setDiscoveryData] = useState<{
        account: any[];
        contact: any[];
    } | null>(null);

    const [connection, setConnection] = useState<CrmConnection | null>(null);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [changes, setChanges] = useState<CrmChangeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [deltaSyncing, setDeltaSyncing] = useState(false);

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
                    syncSettings: (conn as any).syncSettings || {
                        accountMapping: {} as any,
                        contactMapping: {} as any,
                        displaySettings: { account: [], contact: [] },
                    },
                });
                loadLogs(conn.id);
                loadChanges(conn.id);
                loadDiscovery(conn.id);
            }
            // Load field definitions
            const definitions = await api.crm.getFieldDefinitions();
            setFieldDefinitions(definitions);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to load CRM data', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async (id: string) => {
        try {
            const syncLogs = await api.crm.getLogs(id);
            setLogs(syncLogs);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to load logs', error);
        }
    };

    const loadChanges = async (id: string) => {
        try {
            const recentChanges = await api.crm.getChanges(id, 50);
            setChanges(recentChanges);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to load CRM changes', error);
        }
    };

    const loadDiscovery = async (id: string) => {
        try {
            const data = await api.crm.getDiscoveryData(id);
            setDiscoveryData(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to load discovery data', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!connection?.id) return;

        const socket = getSocket();
        const refreshCrmData = async (payload?: { connectionId?: string }) => {
            if (payload?.connectionId && payload.connectionId !== connection.id) return;
            await Promise.all([
                loadChanges(connection.id),
                api.crm.getConnections().then(connections => {
                    if (connections?.[0]) setConnection(connections[0]);
                }),
            ]);
        };

        socket.on('crm:changes', refreshCrmData);
        socket.on('crm:sync_error', refreshCrmData);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('crm:changes', refreshCrmData);
            socket.off('crm:sync_error', refreshCrmData);
        };
    }, [connection?.id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.crm.upsertConnection(config);
            toast({ title: '✅ ' + tc('success_title'), description: t('toasts.bulk_update_success', { count: 1 }) });
            loadData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: '❌ ' + t('crm.error'), description: error.response?.data?.message || error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        if (!connection) return;
        setSyncing(true);
        try {
            await api.crm.triggerSync(connection.id);
            toast({ title: '🔄 ' + t('crm.sync_btn'), description: t('toasts.sync_started') });
            loadData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Sync failed', error);
        } finally {
            setSyncing(false);
        }
    };

    const handleDeltaSync = async () => {
        if (!connection) return;
        setDeltaSyncing(true);
        try {
            await api.crm.triggerDeltaSync(connection.id);
            toast({ title: '🔄 ' + t('crm.delta_sync_btn'), description: t('crm.delta_sync_started') });
            await Promise.all([loadData(), loadChanges(connection.id)]);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Delta sync failed', error);
        } finally {
            setDeltaSyncing(false);
        }
    };

    if (loading || !fieldDefinitions) {
        return <div className="flex items-center justify-center h-64">{tc('loading')}</div>;
    }

    const handleMappingChange = (entity: 'account' | 'contact', key: string, value: string) => {
        const mappingKey = entity === 'account' ? 'accountMapping' : 'contactMapping';
        setConfig((prev: any) => {
            const newMapping = { ...prev.syncSettings[mappingKey] };
            if (value === '') {
                delete newMapping[key];
            } else {
                newMapping[key] = value;
            }
            return {
                ...prev,
                syncSettings: {
                    ...prev.syncSettings,
                    [mappingKey]: newMapping,
                },
            };
        });
    };

    const handleDisplaySettingsChange = (entity: 'account' | 'contact', settings: any[]) => {
        setConfig((prev: any) => ({
            ...prev,
            syncSettings: {
                ...prev.syncSettings,
                displaySettings: {
                    ...prev.syncSettings.displaySettings,
                    [entity]: settings,
                },
            },
        }));
    };

    const handleResetMapping = (entity: 'account' | 'contact') => {
        const mappingKey = entity === 'account' ? 'accountMapping' : 'contactMapping';
        setConfig((prev: any) => ({
            ...prev,
            syncSettings: {
                ...prev.syncSettings,
                [mappingKey]: {},
            },
        }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('crm.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('crm.desc')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Card */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sky-600">
                                <ExternalLink className="h-5 w-5" />
                                {t('crm.connection_settings')}
                            </CardTitle>
                            <CardDescription>
                                {t('crm.connection_desc')}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tenantId">{t('crm.tenant_id')}</Label>
                                        <Input
                                            id="tenantId"
                                            value={config.tenantId}
                                            onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
                                            placeholder="8fb...-4b...-8fb..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientId">{t('crm.client_id')}</Label>
                                        <Input
                                            id="clientId"
                                            value={config.clientId}
                                            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                                            placeholder="f64...-4...-f64..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="clientSecret">{t('crm.client_secret')}</Label>
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
                                    <Label htmlFor="webhookSecret">{t('crm.webhook_api_key')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="webhookSecret"
                                            type="text"
                                            value={config.webhookSecret}
                                            onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                                            placeholder={t('import.processing')}
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {t('crm.webhook_hint')}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instanceUrl">{t('crm.instance_url')}</Label>
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
                                    {t('crm.save_and_verify')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* Status Card */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{t('crm.status_card_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('labels.status')}:</span>
                                {connection?.isActive ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> {t('labels.active')}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-400">{t('labels.passive')}</Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('crm.last_sync')}:</span>
                                <span className="text-sm text-muted-foreground">
                                    {connection?.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString(locale) : t('crm.never_synced')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('labels.syncing')}:</span>
                                {connection?.syncStatus === 'SYNCING' ? (
                                    <Badge className="bg-sky-500/10 text-sky-400 animate-pulse">{t('crm.in_progress')}</Badge>
                                ) : connection?.syncStatus === 'ERROR' ? (
                                    <Badge variant="destructive">{t('crm.error')}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t('crm.ready')}</Badge>
                                )}
                            </div>

                            <div className="pt-6 border-t font-mono text-[10px] text-muted-foreground break-all">
                                <p>{t('crm.provider_label')}: {config.provider}</p>
                                <p>{t('crm.instance_label')}: {config.instanceUrl || '-'}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="grid w-full grid-cols-1 gap-2">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    disabled={!connection || deltaSyncing}
                                    onClick={handleDeltaSync}
                                >
                                    {deltaSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    {t('crm.delta_sync_btn')}
                                </Button>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    disabled={!connection || syncing}
                                    onClick={handleSync}
                                >
                                    {syncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    {t('crm.sync_btn')}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Tabs defaultValue="account-mapping" className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <TabsList className="bg-transparent h-auto p-0 gap-8">
                                <TabsTrigger
                                    value="account-mapping"
                                    className="bg-transparent border-none p-0 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#3b82f6] rounded-none transition-all"
                                >
                                    {t('sync.mapping.account_title')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="contact-mapping"
                                    className="bg-transparent border-none p-0 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-white data-[state=active]:shadow-[0_2px_0_0_#3b82f6] rounded-none transition-all"
                                >
                                    {t('sync.mapping.contact_title')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="account-mapping">
                            <FieldMapping
                                entityType="account"
                                definitions={fieldDefinitions.account}
                                discoveryData={discoveryData?.account || []}
                                currentMapping={config.syncSettings.accountMapping}
                                displaySettings={config.syncSettings.displaySettings?.account || []}
                                onMappingChange={(key, val) => handleMappingChange('account', key, val)}
                                onDisplayChange={(settings) => handleDisplaySettingsChange('account', settings)}
                                onReset={() => handleResetMapping('account')}
                                onSave={() => handleSave({ preventDefault: () => { } } as unknown as React.FormEvent)}
                                saving={saving}
                            />
                        </TabsContent>

                        <TabsContent value="contact-mapping">
                            <FieldMapping
                                entityType="contact"
                                definitions={fieldDefinitions.contact}
                                discoveryData={discoveryData?.contact || []}
                                currentMapping={config.syncSettings.contactMapping}
                                displaySettings={config.syncSettings.displaySettings?.contact || []}
                                onMappingChange={(key, val) => handleMappingChange('contact', key, val)}
                                onDisplayChange={(settings) => handleDisplaySettingsChange('contact', settings)}
                                onReset={() => handleResetMapping('contact')}
                                onSave={() => handleSave({ preventDefault: () => { } } as unknown as React.FormEvent)}
                                saving={saving}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Sync Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t('crm.log_title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('labels.created_at')}</TableHead>
                                <TableHead>{t('labels.status')}</TableHead>
                                <TableHead>{t('labels.total')}</TableHead>
                                <TableHead>{t('labels.passed')}</TableHead>
                                <TableHead>{t('labels.failed')}</TableHead>
                                <TableHead>{t('labels.system_info')}</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {t('crm.log_empty')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <SyncLogRow key={log.id} log={log} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t('crm.change_history_title')}
                    </CardTitle>
                    <CardDescription>{t('crm.change_history_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('labels.created_at')}</TableHead>
                                <TableHead>{tc('type')}</TableHead>
                                <TableHead>{t('crm.external_id')}</TableHead>
                                <TableHead>{t('crm.changed_field')}</TableHead>
                                <TableHead>{t('crm.old_value')}</TableHead>
                                <TableHead>{t('crm.new_value')}</TableHead>
                                <TableHead>{t('labels.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {changes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {t('crm.change_history_empty')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                changes.map((change) => (
                                    <TableRow key={change.id}>
                                        <TableCell className="text-xs">{new Date(change.changedAt).toLocaleString(locale)}</TableCell>
                                        <TableCell className="text-xs">{change.entityType}</TableCell>
                                        <TableCell className="text-xs font-mono">{change.entityId}</TableCell>
                                        <TableCell className="text-xs">{change.fieldName}</TableCell>
                                        <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{change.oldValue || '-'}</TableCell>
                                        <TableCell className="max-w-[220px] truncate text-xs">{change.newValue || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={change.status === 'SUCCESS' ? 'secondary' : 'destructive'}>{change.status}</Badge>
                                        </TableCell>
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

function SyncLogRow({ log }: { log: SyncLog }) {
    const t = useTranslations('customers');
    const tc = useTranslations('common');
    const locale = useLocale();
    const [expanded, setExpanded] = useState(false);
    const hasFailedRecords = (log.details?.failedRecords?.length ?? 0) > 0;

    return (
        <>
            <TableRow>
                <TableCell className="text-xs">
                    {new Date(log.startedAt).toLocaleString(locale)}
                </TableCell>
                <TableCell>
                    {log.status === 'SUCCESS' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none">{t('crm.success')}</Badge>
                    ) : log.status === 'ERROR' ? (
                        <Badge className="bg-red-500/10 text-red-400 border-none">{t('crm.error')}</Badge>
                    ) : (
                        <Badge variant="outline">{t('crm.in_progress')}</Badge>
                    )}
                </TableCell>
                <TableCell>{log.totalRecords}</TableCell>
                <TableCell className="text-emerald-500">{log.successCount}</TableCell>
                <TableCell className="text-red-500">{log.errorCount}</TableCell>
                <TableCell className="text-xs truncate max-w-xs">{log.errorMessage || '-'}</TableCell>
                <TableCell>
                    {hasFailedRecords && (
                        <Button
                            variant="ghost"
                            size="sm"
                            data-testid="details-button"
                            onClick={() => setExpanded((v) => !v)}
                            className="h-7 px-2 text-xs"
                        >
                            {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                            {t('accounts.details')}
                        </Button>
                    )}
                </TableCell>
            </TableRow>
            {expanded && hasFailedRecords && (
                <TableRow>
                    <TableCell colSpan={7} className="bg-muted/30 p-0">
                        <div className="p-4">
                            <p className="text-xs font-semibold text-red-400 mb-2">{t('import.stats_error')}</p>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">{t('crm.external_id')}</TableHead>
                                        <TableHead className="text-xs">{tc('type')}</TableHead>
                                        <TableHead className="text-xs">{t('crm.log_message')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {log.details!.failedRecords.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-xs font-mono">{r.externalId}</TableCell>
                                            <TableCell className="text-xs">{r.entityType}</TableCell>
                                            <TableCell className="text-xs text-red-400">{r.errorMessage}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
