'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, isBackendUnavailableError } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Paperclip, X, Loader2, ArrowLeft, CheckCircle2, AlertTriangle, Monitor, Sparkles, Box, ServerCrash, ShieldAlert } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { HotinfoGrid } from '@/components/ui/hotinfo-grid';

const getTicketSchema = (t: any) => z.object({
    subject: z.string().min(5, t('errors.subject_min')),
    description: z.string().min(10, t('errors.description_min')),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type TicketFormValues = z.infer<ReturnType<typeof getTicketSchema>>;

const normalizeQuestionText = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');

const buildDiagnosisQuery = (subject: string, description: string) => {
    const normalizedSubject = normalizeQuestionText(subject);
    const normalizedDescription = normalizeQuestionText(description);

    if (!normalizedDescription) return subject.trim();
    if (normalizedSubject === normalizedDescription) return subject.trim();

    return `${subject.trim()}\n\n${description.trim()}`;
};

export default function NewTicketPage() {
    const t = useTranslations('tickets.new');
    const ct = useTranslations('common');
    const tt = useTranslations('tickets');
    const router = useRouter();
    const locale = useLocale();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [files, setFiles] = useState<File[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [hotinfoData, setHotinfoData] = useState<any | null>(null);
    const [isHotinfoConfirmed, setIsHotinfoConfirmed] = useState(false);

    // AI RAG States
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [interactionId, setInteractionId] = useState<string | null>(null);
    const [diagnosisState, setDiagnosisState] = useState<'idle' | 'running' | 'ready' | 'fallback' | 'backend_unavailable' | 'failed'>('idle');

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(getTicketSchema(t)) as any,
        defaultValues: {
            subject: '',
            description: '',
            priority: undefined,
        },
    });

    useEffect(() => {
        api.products.list()
            .then(data => {
                setProducts(data);
                setLoadingProducts(false);
            })
            .catch(err => {
                console.error(err);
                toast.error(t('toasts.products_load_error'));
                setLoadingProducts(false);
            });
    }, []);

    const handleProductChange = async (value: string) => {
        setSelectedProductId(value);
        setHotinfoData(null);
        setIsHotinfoConfirmed(false);

        const product = products.find(p => p.id === value);
        const isAllplan = product?.name?.toUpperCase().includes('ALLPLAN');

        if (isAllplan) {
            try {
                const user = await api.auth.me();
                if (user?.customerProfile?.hotinfoData) {
                    setHotinfoData(user.customerProfile.hotinfoData);
                    setIsHotinfoConfirmed(true); // Auto-confirm if already in profile
                    toast.info(t('toasts.hotinfo_loaded'));
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles([...files, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleHotinfoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.hxl')) {
            toast.error(t('toasts.invalid_hxl'));
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', t('sections.hotinfo_upload_name') || 'Hotinfo Upload');

            const response = await api.post('/customers/me/hotinfo', formData);

            setHotinfoData(response.hotinfo);
            setIsHotinfoConfirmed(true);
            toast.success(t('toasts.hotinfo_success'));
        } catch (error: any) {
            toast.error(t('toasts.upload_error'));
            console.error(error);
        }
    };

    const runDiagnosis = async () => {
        const { subject, description } = form.getValues();
        if (!description) return;

        setIsDiagnosing(true);
        setCurrentStep(2);
        setAiAnswer(null);
        setDiagnosisState('running');

        try {
            // Include confirmed hotinfo context for deep diagnostics
            const context = isHotinfoConfirmed ? hotinfoData : null;

            // Handle current attachments for Multimodal vision analysis
            const attachments = await Promise.all(
                files.map(async (file) => {
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.readAsDataURL(file);
                    });
                    return { data: base64, mimeType: file.type, fileName: file.name };
                })
            );

            // Switch to specialized query endpoint for conversational RAG
            // Passing product context to focus search on relevant knowledge base
            const pId = selectedProductId === 'general' || selectedProductId === '' ? undefined : selectedProductId;
            const resolvedResponse = await api.ai.query(buildDiagnosisQuery(subject, description), context, pId, locale, [], attachments, true, true) as
                { answer?: string; interactionId?: string; answerMode?: 'LLM' | 'FALLBACK'; languageMismatch?: boolean } | null;

            if (!resolvedResponse || !resolvedResponse.answer) {
                setDiagnosisState('failed');
                toast.warning(t('toasts.ai_unavailable'));
                return;
            }

            setAiAnswer(resolvedResponse.answer);
            setInteractionId(resolvedResponse.interactionId ?? null);
            setDiagnosisState(resolvedResponse.languageMismatch ? 'failed' : resolvedResponse.answerMode === 'FALLBACK' ? 'fallback' : 'ready');

            if (resolvedResponse.languageMismatch) {
                toast.info(t('toasts.ai_language_mismatch'));
            } else if ((resolvedResponse as any).confidence === 'NO_MATCH') {
                toast.info(t('toasts.ai_no_match'));
            }
        } catch (err: any) {
            console.error('Diagnosis failed', err);
            if (isBackendUnavailableError(err)) {
                setDiagnosisState('backend_unavailable');
                toast.error(t('toasts.ai_backend_unavailable'));
            } else if (err.message === 'AI_TIMEOUT') {
                setDiagnosisState('failed');
                toast.error(t('toasts.ai_timeout'));
            } else {
                setDiagnosisState('failed');
                toast.error(t('toasts.ai_error'));
            }
        } finally {
            setIsDiagnosing(false);
        }
    };

    const onSubmit = async (values: TicketFormValues) => {
        setLoading(true);
        try {
            const ticket = await api.tickets.create({
                ...values,
                productId: selectedProductId === 'general' || selectedProductId === '' ? undefined : selectedProductId,
                hotinfoContext: isHotinfoConfirmed && hotinfoData ? hotinfoData : undefined,
                interactionId: interactionId ?? undefined,
            });

            let message = null;
            if (!ticket.alreadyCreated) {
                message = await api.tickets.addMessage(ticket.id, {
                    message: values.description,
                    isInternal: false
                });
            }

            toast.success(t('toasts.success'));

            // Try uploading attachments in parallel or sequence, but don't block basic success
            if (files.length > 0 && message) {
                try {
                    for (const file of files) {
                        await api.attachments.upload(message.id, file);
                    }
                } catch (uploadError) {
                    console.error('Attachment upload failed', uploadError);
                    toast.error(t('toasts.upload_error') || 'Some attachments could not be uploaded');
                }
            }

            router.push(`/${locale}/tickets/${ticket.id}`);
        } catch (error: any) {
            console.error('Ticket creation failed', error);
            if (isBackendUnavailableError(error)) {
                toast.error(t('toasts.ticket_backend_unavailable'));
            } else {
                toast.error(error.message || ct('error'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingProducts) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const selectedProductDetails = products.find(p => p.id === selectedProductId);
    const isAllplanSelected = selectedProductDetails?.name?.toUpperCase().includes('ALLPLAN');

    // ── STEP 1: Ticket Form (Subject, Product, Priority, Hotinfo) ──
    const renderStep1 = () => (
        <div className="max-w-3xl mx-auto space-y-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">{t('title')}</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            <Card className="bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl">
                <CardHeader>
                    <CardTitle>{t('sections.basic_info')}</CardTitle>
                    <CardDescription>{t('sections.basic_info_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <div className="space-y-6">
                            {/* Product Selection Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Box className="h-4 w-4 text-brand-400" />
                                    {t('fields.product')}
                                </Label>
                                <Select value={selectedProductId} onValueChange={handleProductChange}>
                                    <SelectTrigger className="bg-slate-950/50 border-white/10">
                                        <SelectValue placeholder={t('fields.product_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">{t('fields.product_general')}</SelectItem>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground/60">{t('fields.product_hint')}</p>
                            </div>

                            {/* Allplan Hotinfo Section */}
                            {isAllplanSelected && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Monitor className="h-5 w-5 text-brand-400" />
                                        <h3 className="font-semibold text-lg">{t('sections.system_info')}</h3>
                                    </div>
                                    {!hotinfoData ? (
                                        <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4 text-center">
                                            <AlertTriangle className="h-8 w-8 text-orange-400" />
                                            <p className="text-sm text-muted-foreground">{t('sections.hotinfo_needed')}</p>
                                            <div className="relative">
                                                <input type="file" accept=".hxl" onChange={handleHotinfoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <Button type="button" className="bg-orange-600">{t('buttons.hotinfo_upload')}</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {!isHotinfoConfirmed ? (
                                                <div className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                {t('sections.confirm_hotinfo')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* System Info Grid */}
                                                    <div className="p-3">
                                                        <HotinfoGrid data={hotinfoData} variant="grid" />
                                                    </div>

                                                    {/* Confirmation Actions */}
                                                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between gap-3 bg-slate-900/80">
                                                        <p className="text-[11px] text-amber-400/80">{t('sections.hotinfo_check')}</p>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="relative">
                                                                <input type="file" accept=".hxl" onChange={handleHotinfoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                                <Button type="button" variant="outline" size="sm" className="border-white/10 text-xs text-white bg-slate-800 hover:bg-slate-700">
                                                                    {t('buttons.upload_new')}
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
                                                                onClick={() => { setIsHotinfoConfirmed(true); toast.success(t('toasts.hotinfo_confirmed')); }}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 mr-1" /> {ct('confirm')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4 flex items-center justify-between animate-in zoom-in-95 duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-semibold text-emerald-400">{t('sections.hotinfo_added')}</p>
                                                            <p className="text-[11px] text-emerald-500/70">{t('sections.hotinfo_added_desc')}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-muted-foreground hover:text-white"
                                                        onClick={() => { setIsHotinfoConfirmed(false); }}
                                                    >
                                                        {t('buttons.view_change')}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {selectedProductId !== '' && (!isAllplanSelected || isHotinfoConfirmed) && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {/* Priority */}
                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.priority')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-slate-950/50 border-white/10">
                                                            <SelectValue placeholder={t('fields.priority_placeholder')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="LOW">{tt('priority.LOW')}</SelectItem>
                                                        <SelectItem value="MEDIUM">{tt('priority.MEDIUM')}</SelectItem>
                                                        <SelectItem value="HIGH">{tt('priority.HIGH')}</SelectItem>
                                                        <SelectItem value="URGENT">{tt('priority.URGENT')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {form.watch('priority') && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 pt-6">
                                    {/* Subject */}
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('fields.subject')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('fields.subject_placeholder')} {...field} className="bg-slate-950/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </Form>
                </CardContent>

                {form.watch('priority') && (
                    <CardFooter className="justify-end border-t border-white/5 pt-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Button
                            disabled={!form.getValues('subject') || form.getValues('subject').length < 5}
                            onClick={() => setCurrentStep(2)}
                            className="bg-brand-600 hover:bg-brand-500 text-industrial-dark font-bold"
                        >
                            {ct('next_step')} <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );

    // ── STEP 2: AI Diagnosis ──
    const renderStep2 = () => (
        <div className="max-w-3xl mx-auto space-y-6 py-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentStep(1)} className="rounded-full hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{t('ai.title')}</h1>
                    <p className="text-muted-foreground">{t('ai.optional_hint')}</p>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="border-white/5 bg-card/50 backdrop-blur-xl">
                    <CardContent className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-400">{t('ai.assist_label')}</p>
                            <p className="text-sm text-muted-foreground">{t('ai.assist_desc')}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                className="w-full bg-brand-600 text-industrial-dark hover:bg-brand-500"
                                onClick={() => setCurrentStep(3)}
                            >
                                {t('ai.create_directly')}
                            </Button>
                            <p className="text-[11px] text-muted-foreground">{t('ai.create_directly_hint')}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    <Label className="text-lg">{t('ai.detail_label')}</Label>
                    <Textarea
                        placeholder={t('ai.detail_placeholder')}
                        className="min-h-[120px] bg-slate-950/50 border-white/10 text-lg p-4"
                        value={form.watch('description')}
                        onChange={(e) => form.setValue('description', e.target.value)}
                    />
                    <Button
                        className="w-full gap-2 h-12 text-lg font-bold"
                        variant="outline"
                        disabled={isDiagnosing || !form.watch('description')}
                        onClick={runDiagnosis}
                    >
                        {isDiagnosing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                        {t('ai.search_btn')}
                    </Button>
                </div>

                {diagnosisState !== 'idle' && (
                    <div className={`rounded-2xl border px-4 py-4 ${
                        diagnosisState === 'backend_unavailable'
                            ? 'border-orange-500/20 bg-orange-500/5'
                            : diagnosisState === 'fallback'
                                ? 'border-amber-500/20 bg-amber-500/5'
                                : diagnosisState === 'failed'
                                    ? 'border-red-500/20 bg-red-500/5'
                                    : 'border-white/5 bg-slate-950/40'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                                diagnosisState === 'backend_unavailable'
                                    ? 'bg-orange-500/10 text-orange-400'
                                    : diagnosisState === 'fallback'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : diagnosisState === 'failed'
                                            ? 'bg-red-500/10 text-red-400'
                                            : 'bg-brand-500/10 text-brand-400'
                            }`}>
                                {diagnosisState === 'backend_unavailable' ? (
                                    <ServerCrash className="h-4 w-4" />
                                ) : diagnosisState === 'fallback' ? (
                                    <ShieldAlert className="h-4 w-4" />
                                ) : diagnosisState === 'failed' ? (
                                    <AlertTriangle className="h-4 w-4" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">{t(`ai.status.${diagnosisState}.title`)}</p>
                                <p className="text-sm text-muted-foreground">{t(`ai.status.${diagnosisState}.desc`)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {aiAnswer && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2 text-brand-400">
                            <Sparkles className="h-5 w-5" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">{t('ai.result_title')}</h3>
                        </div>
                        <Card className="bg-brand-500/5 border-brand-500/20 shadow-lg shadow-brand-500/10">
                            <CardContent className="p-6 prose prose-invert max-w-none">
                                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {aiAnswer && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 mt-8">
                        <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/5 text-center space-y-4 backdrop-blur-xl">
                            <p className="text-muted-foreground italic text-sm">
                                &quot;{t('ai.feedback_question')}&quot;
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 px-8"
                                    onClick={() => {
                                        toast.success(t('toasts.ai_happy'));
                                        router.push(`/${locale}/dashboard`);
                                    }}
                                >
                                    {t('ai.yes_resolved')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="bg-white/5 hover:bg-white/10 px-8"
                                    onClick={() => setCurrentStep(3)}
                                >
                                    {t('ai.no_create_ticket')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );

    // ── STEP 3: Attachments & Submit ──
    const renderStep3 = () => (
        <div className="max-w-3xl mx-auto space-y-6 py-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentStep(2)} className="rounded-full hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{t('summary.title')}</h1>
            </div>

            <Card className="bg-card/60 backdrop-blur-xl border-white/5">
                <CardContent className="space-y-8 pt-6">
                    <div className="space-y-4">
                        <Label>{t('summary.attachments')}</Label>
                        <div className="flex flex-wrap gap-2 min-h-12 p-4 rounded-lg bg-slate-950/50 border border-white/5 border-dashed items-center relative">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs animate-in zoom-in-95">
                                    <Paperclip className="h-3 w-3 text-brand-400" />
                                    <span>{file.name}</span>
                                    <button onClick={() => removeFile(i)} className="text-red-400"><X className="h-3 w-3" /></button>
                                </div>
                            ))}
                            {files.length === 0 && <p className="text-sm text-muted-foreground w-full text-center">{t('summary.drag_drop')}</p>}
                        </div>
                        <Input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                        <Button variant="outline" className="w-full border-white/10" asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Paperclip className="h-4 w-4 mr-2" /> {t('summary.select_file')}
                            </label>
                        </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-2">
                        <Label className="text-brand-400 text-[10px] uppercase font-bold">{t('summary.report')}</Label>
                        <p className="text-sm leading-relaxed text-white/80">
                            <strong>{t('summary.subject_label')}</strong> {form.getValues('subject')}<br />
                            <strong>{t('summary.product_label')}</strong> {selectedProductDetails?.name || t('fields.product_general')}<br />
                            <strong>{t('summary.desc_label')}</strong> {form.getValues('description').slice(0, 100)}...
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-white/5 pt-6 mt-6">
                    <Button variant="ghost" onClick={() => router.back()}>{ct('cancel')}</Button>
                    <Button
                        disabled={loading}
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-brand-600 min-w-40 shadow-lg shadow-brand-500/20 h-12 text-lg text-industrial-dark font-bold"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('buttons.create')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
        </div>
    );
}
