'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Paperclip, X, Loader2, ArrowLeft, CheckCircle2, AlertTriangle, Monitor, Sparkles, Box } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ticketSchema = z.object({
    subject: z.string().min(5, 'Konu en az 5 karakter olmalıdır'),
    description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function NewTicketPage() {
    const router = useRouter();
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
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [interactionId, setInteractionId] = useState<string | null>(null);

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema) as any,
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
                toast.error('Ürünler yüklenirken hata oluştu');
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
                    setIsHotinfoConfirmed(false); // User must explicitly confirm
                    toast.info('Profilinizdeki sistem bilgileri yüklendi. Lütfen güncel olduğunu onaylayın.');
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
            toast.error('Lütfen geçerli bir .hxl dosyası yükleyin');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/customers/me/hotinfo', formData);

            setHotinfoData(response.hotinfo);
            setIsHotinfoConfirmed(true);
            toast.success('Sistem bilgileriniz başarıyla güncellendi');
        } catch (error: any) {
            toast.error('Dosya yüklenirken hata oluştu');
            console.error(error);
        }
    };

    const runDiagnosis = async () => {
        const { subject, description } = form.getValues();
        if (!description) return;

        setIsDiagnosing(true);
        setCurrentStep(2);
        try {
            const response = await api.post('/ai/search', {
                query: `${subject} ${description}`,
                productId: selectedProductId === 'general' ? null : selectedProductId,
                limit: 3
            });
            setSuggestions(response.results || []);
            setInteractionId(response.interactionId);
        } catch (err) {
            console.error('Diagnosis failed', err);
        } finally {
            setIsDiagnosing(false);
        }
    };

    const onSubmit = async (values: TicketFormValues) => {
        setLoading(true);
        try {
            const ticket = await api.tickets.create({
                ...values,
                productId: selectedProductId === 'general' || selectedProductId === '' ? null : selectedProductId,
                hotinfoContext: isHotinfoConfirmed ? hotinfoData : null,
                interactionId: interactionId
            });

            const message = await api.tickets.addMessage(ticket.id, {
                message: values.description,
                isInternal: false
            });

            if (files.length > 0) {
                for (const file of files) {
                    await api.attachments.upload(message.id, file);
                }
            }

            toast.success('Talebiniz başarıyla oluşturuldu');
            router.push(`/tickets/${ticket.id}`);
        } catch (error: any) {
            toast.error(error.message || 'Hata oluştu');
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
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Yeni Destek Talebi</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Sorununuzu tanımlayın, akıllı asistanımız size adım adım rehberlik edecek.
                </p>
            </div>

            <Card className="bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl">
                <CardHeader>
                    <CardTitle>Temel Bilgiler</CardTitle>
                    <CardDescription>Talebiniz hakkında bilgi verin. Ürün seçerek daha hedefli destek alabilirsiniz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <div className="space-y-6">
                            {/* Product Selection Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Box className="h-4 w-4 text-brand-400" />
                                    İlgili Ürün
                                </Label>
                                <Select value={selectedProductId} onValueChange={handleProductChange}>
                                    <SelectTrigger className="bg-slate-950/50 border-white/10">
                                        <SelectValue placeholder="Ürün seçin (opsiyonel)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">Genel Soru / Diğer</SelectItem>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground/60">Belirli bir ürünle ilgili değilse &quot;Genel Soru / Diğer&quot; seçili kalabilir.</p>
                            </div>

                            {/* Allplan Hotinfo Section */}
                            {isAllplanSelected && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Monitor className="h-5 w-5 text-brand-400" />
                                        <h3 className="font-semibold text-lg">Sistem Bilgileri (Zorunlu)</h3>
                                    </div>
                                    {!hotinfoData ? (
                                        <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4 text-center">
                                            <AlertTriangle className="h-8 w-8 text-orange-400" />
                                            <p className="text-sm text-muted-foreground">Allplan hataları için Hotinfo dosyası gereklidir.</p>
                                            <div className="relative">
                                                <input type="file" accept=".hxl" onChange={handleHotinfoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <Button type="button" className="bg-orange-600">Hotinfo Yükle (.hxl)</Button>
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
                                                                Sistem Bilgilerini Onaylayın
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* System Info Grid */}
                                                    {(() => {
                                                        const sr = (val: any) => {
                                                            if (!val) return null;
                                                            if (typeof val === 'object') {
                                                                return val['@_version'] || val['@_name'] || val['#text'] || JSON.stringify(val);
                                                            }
                                                            return String(val);
                                                        };
                                                        return (
                                                            <div className="grid grid-cols-2 gap-px bg-white/5 m-px">
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Allplan Edition & Hotfix</div>
                                                                    <div className="text-sm font-semibold text-white">
                                                                        {hotinfoData.allplanVersion || '-'}
                                                                        {hotinfoData.allplanEdition && <span className="text-xs text-muted-foreground ml-1">({hotinfoData.allplanEdition})</span>}
                                                                    </div>
                                                                    {hotinfoData.allplanHotfix && <div className="text-[10px] text-brand-400 mt-0.5">Hotfix: {hotinfoData.allplanHotfix}</div>}
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">İşletim Sistemi</div>
                                                                    <div className="text-sm font-semibold text-white">{hotinfoData.osVersion || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">GPU Driver Sürümü</div>
                                                                    <div className="text-sm font-semibold text-white">{sr(hotinfoData.gpuDriverVersion) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">İşlemci (CPU)</div>
                                                                    <div className="text-sm font-semibold text-white truncate">{hotinfoData.cpu || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">OpenGL Sürümü</div>
                                                                    <div className="text-sm font-semibold text-white">{sr(hotinfoData.openglVersion) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Ekran Kartı (GPU)</div>
                                                                    <div className="text-sm font-semibold text-white truncate">{sr(hotinfoData.gpu) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">VRAM</div>
                                                                    <div className="text-sm font-semibold text-white">{sr(hotinfoData.vram) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">RAM</div>
                                                                    <div className="text-sm font-semibold text-white">{hotinfoData.ram || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Ekran Çözünürlüğü</div>
                                                                    <div className="text-sm font-semibold text-white">{sr(hotinfoData.screenResolution) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Disk Bilgisi</div>
                                                                    <div className="text-sm font-semibold text-white truncate">{sr(hotinfoData.diskInfo) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Lisans Tipi</div>
                                                                    <div className="text-sm font-semibold text-white">{sr(hotinfoData.licenseType) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">.NET Framework</div>
                                                                    <div className="text-sm font-semibold text-white">{sr(hotinfoData.dotnetVersion) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80 col-span-2">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Ağ Bilgisi</div>
                                                                    <div className="text-sm font-semibold text-white truncate">{sr(hotinfoData.networkInfo) || '-'}</div>
                                                                </div>
                                                                <div className="p-3 bg-slate-900/80 col-span-2">
                                                                    <div className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-bold mb-1">Yüklü Modüller (max 10)</div>
                                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                                        {hotinfoData.installedModules?.length > 0 ? hotinfoData.installedModules.slice(0, 10).map((mod: string, i: number) => (
                                                                            <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300">{sr(mod)}</span>
                                                                        )) : <span className="text-sm font-semibold text-white">-</span>}
                                                                        {hotinfoData.installedModules?.length > 10 && <span className="text-[10px] text-muted-foreground">... +{hotinfoData.installedModules.length - 10} daha</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Confirmation Actions */}
                                                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between gap-3 bg-slate-900/80">
                                                        <p className="text-[11px] text-amber-400/80">Bu bilgiler güncel mi? Onaylayın veya yeni dosya yükleyin.</p>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="relative">
                                                                <input type="file" accept=".hxl" onChange={handleHotinfoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                                <Button type="button" variant="outline" size="sm" className="border-white/10 text-xs text-white bg-slate-800 hover:bg-slate-700">
                                                                    Yenisini Yükle
                                                                </Button>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
                                                                onClick={() => { setIsHotinfoConfirmed(true); toast.success('Sistem bilgileri onaylandı'); }}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Onayla
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
                                                            <p className="text-sm font-semibold text-emerald-400">Sistem Bilgileri (Hotinfo) Eklendi</p>
                                                            <p className="text-[11px] text-emerald-500/70">Bu bilgiler teknik ekibe otomatik olarak iletilecek.</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-muted-foreground hover:text-white"
                                                        onClick={() => { setIsHotinfoConfirmed(false); }}
                                                    >
                                                        Görüntüle / Değiştir
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
                                                <FormLabel>Öncelik</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-slate-950/50 border-white/10">
                                                            <SelectValue placeholder="Öncelik seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="LOW">Düşük</SelectItem>
                                                        <SelectItem value="MEDIUM">Orta</SelectItem>
                                                        <SelectItem value="HIGH">Yüksek</SelectItem>
                                                        <SelectItem value="URGENT">Acil</SelectItem>
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
                                                <FormLabel>Konu / Özet</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Örn: Kurulum sırasında lisans hatası alıyorum" {...field} className="bg-slate-950/50 border-white/10" />
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
                            Sonraki Adım <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
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
                    <h1 className="text-3xl font-bold tracking-tight">Akıllı Teşhis</h1>
                    <p className="text-brand-400 font-medium">Size özel çözümleri hazırlıyoruz...</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-lg">Sorununuzu detaylandırın</Label>
                    <Textarea
                        placeholder="Hata mesajı, gerçekleşen işlem sırası vb..."
                        className="min-h-[120px] bg-slate-950/50 border-white/10 text-lg p-4"
                        value={form.watch('description')}
                        onChange={(e) => form.setValue('description', e.target.value)}
                    />
                    <Button
                        className="w-full bg-brand-600 gap-2 h-12 text-lg text-industrial-dark font-bold"
                        disabled={isDiagnosing || !form.watch('description')}
                        onClick={runDiagnosis}
                    >
                        {isDiagnosing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                        Çözüm Ara (AI)
                    </Button>
                </div>

                {suggestions.length > 0 && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2 text-brand-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Knowledge Pool Önerileri</h3>
                        </div>
                        <div className="grid gap-3">
                            {suggestions.map((s, i) => (
                                <Card key={i} className="bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 transition-colors cursor-pointer">
                                    <CardHeader className="p-4 flex flex-row items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold">{i + 1}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-base text-white">{s.title}</CardTitle>
                                            <CardDescription className="line-clamp-2 text-xs">{s.content}</CardDescription>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-center space-y-3">
                            <p className="text-sm text-muted-foreground italic">&quot;Bu çözümlerden biri sorununuzu giderdi mi?&quot;</p>
                            <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20" onClick={() => {
                                    toast.success('Çözüm bulmanıza sevindik! 🎉');
                                    router.push('/dashboard');
                                }}>Evet, Çözüldü</Button>
                                <Button size="sm" variant="outline" onClick={() => setCurrentStep(3)}>Hayır, Devam Et</Button>
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
                <h1 className="text-3xl font-bold tracking-tight">Son Kontrol & Ekler</h1>
            </div>

            <Card className="bg-card/60 backdrop-blur-xl border-white/5">
                <CardContent className="space-y-8 pt-6">
                    <div className="space-y-4">
                        <Label>Ek Dosyalar / Ekran Görüntüleri</Label>
                        <div className="flex flex-wrap gap-2 min-h-12 p-4 rounded-lg bg-slate-950/50 border border-white/5 border-dashed items-center relative">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs animate-in zoom-in-95">
                                    <Paperclip className="h-3 w-3 text-brand-400" />
                                    <span>{file.name}</span>
                                    <button onClick={() => removeFile(i)} className="text-red-400"><X className="h-3 w-3" /></button>
                                </div>
                            ))}
                            {files.length === 0 && <p className="text-sm text-muted-foreground w-full text-center">Dosyaları buraya sürükleyin veya seçin</p>}
                        </div>
                        <Input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                        <Button variant="outline" className="w-full border-white/10" asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Paperclip className="h-4 w-4 mr-2" /> Dosya Seç
                            </label>
                        </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-2">
                        <Label className="text-brand-400 text-[10px] uppercase font-bold">Özet Rapor</Label>
                        <p className="text-sm leading-relaxed text-white/80">
                            <strong>Konu:</strong> {form.getValues('subject')}<br />
                            <strong>Ürün:</strong> {selectedProductDetails?.name || 'Genel'}<br />
                            <strong>Açıklama:</strong> {form.getValues('description').slice(0, 100)}...
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-white/5 pt-6 mt-6">
                    <Button variant="ghost" onClick={() => router.back()}>İptal</Button>
                    <Button
                        disabled={loading}
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-brand-600 min-w-40 shadow-lg shadow-brand-500/20 h-12 text-lg text-industrial-dark font-bold"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Talebi Oluştur'}
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
