'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Brain,
    Bot,
    Cpu,
    Zap,
    CheckCircle2,
    AlertCircle,
    RefreshCcw,
    Settings2,
    Lock,
    Eye,
    EyeOff,
    Terminal,
    Search,
    Cloud
} from 'lucide-react';
import { toast } from 'sonner';

interface ProviderStatus {
    name: string;
    active: boolean;
    available: boolean;
    priority: number;
    error?: string;
}

export function AiSettings() {
    const t = useTranslations('settings.ai');
    const [status, setStatus] = useState<ProviderStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState<string | null>(null);
    const [showKey, setShowKey] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form states
    const [openaiKey, setOpenaiKey] = useState('');
    const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
    const [anthropicKey, setAnthropicKey] = useState('');
    const [anthropicModel, setAnthropicModel] = useState('claude-3-opus-20240229');
    const [geminiKey, setGeminiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro');
    const [llmapiKey, setLlmApiKey] = useState('');
    const [llmapiModel, setLlmApiModel] = useState('gpt-4o');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [ollamaModel, setOllamaModel] = useState('llama3');

    const [vertexProjectId, setVertexProjectId] = useState('');
    const [vertexCredentials, setVertexCredentials] = useState('');
    const [vertexModel, setVertexModel] = useState('gemini-1.5-pro-preview-0409');

    // Specialized mappings
    const [specializedCategorization, setSpecializedCategorization] = useState('global');
    const [specializedSummarization, setSpecializedSummarization] = useState('global');
    const [specializedReformatting, setSpecializedReformatting] = useState('global');
    const [specializedSentiment, setSpecializedSentiment] = useState('global');
    const [specializedTranslation, setSpecializedTranslation] = useState('global');

    const loadData = async () => {
        setLoading(true);
        try {
            const [healthData, settingsData] = await Promise.all([
                api.get('/ai/health-status'),
                api.settings.list(true)
            ]);

            setStatus(healthData.providers || []);

            // Map settings
            const findValue = (key: string) => settingsData.find((s: any) => s.key === key)?.value || '';

            setOpenaiKey(findValue('ai.openai.api_key'));
            setOpenaiModel(findValue('ai.openai.chat_model') || 'gpt-4o-mini');
            setAnthropicKey(findValue('ai.anthropic.api_key'));
            setAnthropicModel(findValue('ai.anthropic.chat_model') || 'claude-3-5-sonnet-latest');
            setLlmApiKey(findValue('ai.llmapi.api_key'));
            setLlmApiModel(findValue('ai.llmapi.chat_model') || 'gpt-4o');
            setOllamaUrl(findValue('ai.ollama.url') || 'http://localhost:11434');
            setOllamaModel(findValue('ai.ollama.chat_model') || 'llama3');

            // Vertex Map
            setVertexProjectId(findValue('ai.vertex.project_id'));
            setVertexCredentials(findValue('ai.vertex.credentials_json'));
            setVertexModel(findValue('ai.vertex.chat_model') || 'gemini-1.5-pro-preview-0409');

            // Specialized
            setSpecializedCategorization(findValue('ai.specialized.categorization_provider') || 'global');
            setSpecializedSummarization(findValue('ai.specialized.summarization_provider') || 'global');
            setSpecializedReformatting(findValue('ai.specialized.reformatting_provider') || 'global');
            setSpecializedSentiment(findValue('ai.specialized.analyze_sentiment_provider') || 'global');
            setSpecializedTranslation(findValue('ai.specialized.translate_provider') || 'global');

        } catch (error: any) {
            toast.error(t('toasts.load_error', { message: error.message }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleTest = async (provider: string) => {
        setTesting(provider);
        try {
            const result = await api.post('/ai/test-connection', { provider: provider.toLowerCase() });
            if (result.success) {
                toast.success(t('toasts.test_success', { provider }));
                loadData(); // Refresh health status
            } else {
                toast.error(t('toasts.test_error', { provider, message: result.message }));
            }
        } catch (error: any) {
            toast.error(t('toasts.test_failed', { message: error.message }));
        } finally {
            setTesting(null);
        }
    };

    const handleSave = async (provider: string) => {
        setSaving(true);
        try {
            const updates = [];
            if (provider === 'OpenAI') {
                updates.push(api.settings.upsert({ key: 'ai.openai.api_key', value: openaiKey, isSecret: true }));
                updates.push(api.settings.upsert({ key: 'ai.openai.chat_model', value: openaiModel }));
            } else if (provider === 'Anthropic') {
                updates.push(api.settings.upsert({ key: 'ai.anthropic.api_key', value: anthropicKey, isSecret: true }));
                updates.push(api.settings.upsert({ key: 'ai.anthropic.chat_model', value: anthropicModel }));
            } else if (provider === 'LLMAPI') {
                updates.push(api.settings.upsert({ key: 'ai.llmapi.api_key', value: llmapiKey, isSecret: true }));
                updates.push(api.settings.upsert({ key: 'ai.llmapi.chat_model', value: llmapiModel }));
            } else if (provider === 'Ollama') {
                updates.push(api.settings.upsert({ key: 'ai.ollama.url', value: ollamaUrl }));
                updates.push(api.settings.upsert({ key: 'ai.ollama.chat_model', value: ollamaModel }));
            } else if (provider === 'Vertex') {
                updates.push(api.settings.upsert({ key: 'ai.vertex.project_id', value: vertexProjectId }));
                updates.push(api.settings.upsert({ key: 'ai.vertex.credentials_json', value: vertexCredentials, isSecret: true }));
                updates.push(api.settings.upsert({ key: 'ai.vertex.chat_model', value: vertexModel }));
            } else if (provider === 'Specialized') {
                updates.push(api.settings.upsert({ key: 'ai.specialized.categorization_provider', value: specializedCategorization }));
                updates.push(api.settings.upsert({ key: 'ai.specialized.summarization_provider', value: specializedSummarization }));
                updates.push(api.settings.upsert({ key: 'ai.specialized.reformatting_provider', value: specializedReformatting }));
                updates.push(api.settings.upsert({ key: 'ai.specialized.analyze_sentiment_provider', value: specializedSentiment }));
                updates.push(api.settings.upsert({ key: 'ai.specialized.translate_provider', value: specializedTranslation }));
            }

            await Promise.all(updates);
            toast.success(t('toasts.save_success', { provider }));
            loadData();
        } catch (error: any) {
            toast.error(t('toasts.save_error', { message: error.message }));
        } finally {
            setSaving(false);
        }
    };

    const ProviderCard = ({
        name,
        icon: Icon,
        color,
        keyLabel = 'API Key',
        keyValue,
        setKeyValue,
        modelValue,
        setModelValue,
        secret = true
    }: any) => {
        const providerStatus = status.find(s => s.name === name);
        const isActive = providerStatus?.active;
        const isAvailable = providerStatus?.available;

        return (
            <Card className="bg-card/40 backdrop-blur-2xl border-white/10 overflow-hidden group hover:border-brand-500/30 transition-all duration-500 shadow-2xl shadow-black/50">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`} aria-hidden="true">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">{name}</CardTitle>
                                <CardDescription className="text-xs">{t('motor_desc', { name })}</CardDescription>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {isAvailable ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 py-0.5">
                                    <CheckCircle2 className="h-3 w-3" /> {t('status_active')}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 gap-1.5 py-0.5">
                                    <AlertCircle className="h-3 w-3" /> {t('status_inactive')}
                                </Badge>
                            )}
                            {isActive && <span className="text-[10px] text-brand-400 font-medium uppercase tracking-tighter">{t('primary_engine')}</span>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            {keyLabel}
                            {secret && (
                                <button
                                    type="button"
                                    onClick={() => setShowKey(showKey === name ? null : name)}
                                    className="hover:text-white transition-colors p-1"
                                    aria-label={showKey === name ? t('hide_key', { name }) : t('show_key', { name })}
                                >
                                    {showKey === name ? <EyeOff className="h-3 w-3" aria-hidden="true" /> : <Eye className="h-3 w-3" aria-hidden="true" />}
                                </button>
                            )}
                        </Label>
                        <div className="relative">
                            <Input
                                type={secret && showKey !== name ? 'password' : 'text'}
                                value={keyValue}
                                onChange={(e) => setKeyValue(e.target.value)}
                                className="bg-slate-950/80 border-white/10 focus:border-brand-500/50 pr-10 h-11 transition-all text-white placeholder:text-white/50 select-none shadow-inner"
                                placeholder={secret ? '••••••••••••••••' : 'http://...'}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">
                                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('ollama.chat_model')}</Label>
                        <Input
                            value={modelValue}
                            onChange={(e) => setModelValue(e.target.value)}
                            className="bg-slate-950/80 border-white/10 focus:border-brand-500/50 h-11 transition-all text-white placeholder:text-white/50 shadow-inner"
                            placeholder={t('model_placeholder')}
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-white/5 p-3 flex gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 hover:bg-white/5 gap-2 text-xs"
                        onClick={() => handleTest(name)}
                        disabled={testing === name || (!keyValue && secret)}
                    >
                        {testing === name ? <RefreshCcw className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Terminal className="h-3 w-3" aria-hidden="true" />}
                        {t('test_btn')}
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 bg-brand-600 hover:bg-brand-500 gap-2 text-xs shadow-lg shadow-brand-900/20"
                        onClick={() => handleSave(name)}
                        disabled={saving}
                    >
                        {saving ? <RefreshCcw className="h-3 w-3 animate-spin" aria-hidden="true" /> : <Zap className="h-3 w-3 fill-current" aria-hidden="true" />}
                        {t('save_btn')}
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card/20 border-white/5 h-[300px] overflow-hidden">
                    <CardHeader className="space-y-4">
                        <div className="h-12 w-12 bg-white/5 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-white/10 rounded" />
                            <div className="h-3 w-48 bg-white/5 rounded" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="h-10 w-full bg-white/5 rounded" />
                        <div className="h-10 w-full bg-white/5 rounded" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-brand-500" aria-hidden="true" /> {t('center_title')}
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-xl">
                        {t('center_desc')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-900 border-white/10 py-1 px-3">
                        {t('total_latency')}: <span className="text-brand-400 font-mono ml-1.5">~1.2s</span>
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProviderCard
                    name="OpenAI"
                    icon={Bot}
                    color="green"
                    keyValue={openaiKey}
                    setKeyValue={setOpenaiKey}
                    modelValue={openaiModel}
                    setModelValue={setOpenaiModel}
                />
                <ProviderCard
                    name="Anthropic"
                    icon={Zap}
                    color="orange"
                    keyValue={anthropicKey}
                    setKeyValue={setAnthropicKey}
                    modelValue={anthropicModel}
                    setModelValue={setAnthropicModel}
                />
                <ProviderCard
                    name="LLMAPI"
                    icon={Brain}
                    color="blue"
                    keyValue={llmapiKey}
                    setKeyValue={setLlmApiKey}
                    modelValue={llmapiModel}
                    setModelValue={setLlmApiModel}
                />
                <ProviderCard
                    name="Ollama"
                    icon={Cpu}
                    color="purple"
                    keyLabel="Server URL"
                    keyValue={ollamaUrl}
                    setKeyValue={setOllamaUrl}
                    modelValue={ollamaModel}
                    setModelValue={setOllamaModel}
                    secret={false}
                />
                <ProviderCard
                    name="Vertex"
                    icon={Cloud}
                    color="blue"
                    keyLabel="GCP Project ID"
                    keyValue={vertexProjectId}
                    setKeyValue={setVertexProjectId}
                    modelValue={vertexModel}
                    setModelValue={setVertexModel}
                    secret={false}
                />
            </div>

            <Card className="bg-card/20 backdrop-blur-xl border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                            <Settings2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold">{t('specialized_title')}</CardTitle>
                            <CardDescription className="text-xs">{t('specialized_desc')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('task_categorization')}</Label>
                            <select
                                value={specializedCategorization}
                                onChange={(e) => setSpecializedCategorization(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="global">{t('global_default')}</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="gemini">Gemini</option>
                                <option value="ollama">{t('ollama_local')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('task_summarization')}</Label>
                            <select
                                value={specializedSummarization}
                                onChange={(e) => setSpecializedSummarization(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="global">{t('global_default')}</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="gemini">Gemini</option>
                                <option value="ollama">{t('ollama_local')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('task_reformatting')}</Label>
                            <select
                                value={specializedReformatting}
                                onChange={(e) => setSpecializedReformatting(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="global">{t('global_default')}</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="gemini">Gemini</option>
                                <option value="ollama">{t('ollama_local')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('task_sentiment')}</Label>
                            <select
                                value={specializedSentiment}
                                onChange={(e) => setSpecializedSentiment(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="global">{t('global_default')}</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="gemini">Gemini</option>
                                <option value="ollama">{t('ollama_local')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('task_translation')}</Label>
                            <select
                                value={specializedTranslation}
                                onChange={(e) => setSpecializedTranslation(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="global">{t('global_default')}</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="gemini">Gemini</option>
                                <option value="ollama">{t('ollama_local')}</option>
                            </select>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button
                                onClick={() => handleSave('Specialized')}
                                disabled={saving}
                                className="bg-brand-600 hover:bg-brand-500"
                            >
                                {saving ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />}
                                {t('save_mappings')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-brand-500/5 border-brand-500/10 overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col gap-1 items-center">
                            <div className="w-1 h-8 bg-brand-500/30 rounded-full" />
                            <div className="w-1 h-1 bg-brand-500 rounded-full" />
                            <div className="w-1 h-20 bg-brand-500/30 rounded-full" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold flex items-center gap-2">
                                <Search className="h-4 w-4 text-brand-400" /> {t('rag_title')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('rag_desc')}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2 backdrop-blur-md">
                        <Settings2 className="h-4 w-4" /> {t('advanced_params')}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
