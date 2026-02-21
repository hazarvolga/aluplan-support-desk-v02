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
import { Paperclip, X, Loader2, ArrowLeft, Box, CheckCircle2, AlertTriangle, Monitor } from 'lucide-react';
import { toast } from 'sonner';

const ticketSchema = z.object({
    subject: z.string().min(5, 'Konu en az 5 karakter olmalıdır'),
    description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [files, setFiles] = useState<File[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [hotinfoData, setHotinfoData] = useState<any | null>(null);
    const [isHotinfoConfirmed, setIsHotinfoConfirmed] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(false);

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema) as any,
        defaultValues: {
            subject: '',
            description: '',
            priority: 'MEDIUM',
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

    const checkUserProfile = async () => {
        setCheckingProfile(true);
        try {
            const user = await api.auth.me();
            if (user?.customerProfile?.hotinfoData) {
                setHotinfoData(user.customerProfile.hotinfoData);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setCheckingProfile(false);
        }
    };

    const handleProductSelect = (id: string, isAllplan: boolean) => {
        setSelectedProductId(id);
        if (isAllplan) {
            checkUserProfile();
        }
    };

    const onSubmit = async (values: TicketFormValues) => {
        setLoading(true);
        try {
            // 1. Create Ticket
            const ticket = await api.tickets.create({
                ...values,
                productId: selectedProductId,
                hotinfoContext: isHotinfoConfirmed ? hotinfoData : null
            });

            // 2. Add initial message (description)
            // Wait, the backend currently creates a ticket with description but no message record?
            // Actually usually the description is stored on the ticket model.
            // But we need a message to attach files to.
            const message = await api.tickets.addMessage(ticket.id, {
                message: values.description,
                isInternal: false
            });

            // 3. Upload Files
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

    if (!selectedProductId && products.length > 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-3 text-center">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Size Nasıl Yardımcı Olabiliriz?</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Sorun yaşadığınız ürünü seçerek başlayın. Yapay zeka asistanımız, talebinizi en doğru uzman ekibe otomatik olarak yönlendirecektir.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {products.map(product => {
                        const isAllplan = product.name.toUpperCase().includes('ALLPLAN');
                        return (
                            <Card
                                key={product.id}
                                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-500/50 bg-card/40 backdrop-blur-sm border-white/5 overflow-hidden relative"
                                onClick={() => handleProductSelect(product.id, isAllplan)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Box className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{product.name}</CardTitle>
                                    {product.description && (
                                        <CardDescription className="line-clamp-2 mt-2">
                                            {product.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                            </Card>
                        );
                    })}
                    <Card
                        className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-500/50 bg-card/40 backdrop-blur-sm border-white/5 border-dashed"
                        onClick={() => handleProductSelect('general', false)}
                    >
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-slate-500/20 text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Box className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-xl">Diğer / Genel Soru</CardTitle>
                            <CardDescription className="mt-2">
                                Belirli bir ürünle ilgili olmayan genel sorunlar ve sorular için.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    const selectedProductDetails = products.find(p => p.id === selectedProductId);
    const isAllplanSelected = selectedProductDetails?.name.toUpperCase().includes('ALLPLAN');

    if (checkingProfile && isAllplanSelected) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <p className="text-muted-foreground">Profil bilgileriniz kontrol ediliyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedProductId(null)} className="rounded-full hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Destek Talebi Oluştur</h1>
                    {selectedProductDetails ? (
                        <p className="text-brand-400 font-medium">{selectedProductDetails.name}</p>
                    ) : (
                        <p className="text-muted-foreground">Genel Kategori</p>
                    )}
                </div>
            </div>

            <Card className="bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Box className="w-64 h-64 -translate-y-1/4 translate-x-1/4" />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10">
                        <CardHeader>
                            <CardTitle>Sorun Detayları</CardTitle>
                            <CardDescription>Lütfen tüm alanları eksiksiz doldurun.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Konu</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sorununuzun kısa bir özeti (Örn: Giriş yapamıyorum..." {...field} className="bg-slate-950/50 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Öncelik Seviyesi</FormLabel>
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

                            {isAllplanSelected && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Monitor className="h-5 w-5 text-brand-400" />
                                        <h3 className="font-semibold text-lg">Sistem Profiliniz (Hotinfo)</h3>
                                    </div>

                                    {hotinfoData ? (
                                        <div className={`p-4 rounded-xl border transition-all duration-300 ${isHotinfoConfirmed ? 'bg-brand-500/5 border-brand-500/20' : 'bg-slate-900/50 border-white/10'}`}>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Allplan Versiyon</p>
                                                    <p className="font-medium text-white">{hotinfoData.allplanVersion}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">İşletim Sistemi</p>
                                                    <p className="font-medium text-white">{hotinfoData.osVersion}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Ekran Kartı</p>
                                                    <p className="font-medium text-white italic truncate" title={hotinfoData.gpu}>{hotinfoData.gpu}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">İşlemci</p>
                                                    <p className="font-medium text-white truncate" title={hotinfoData.cpu}>{hotinfoData.cpu}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">RAM</p>
                                                    <p className="font-medium text-white">{hotinfoData.ram}</p>
                                                </div>
                                            </div>

                                            {!isHotinfoConfirmed ? (
                                                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/5 mt-4">
                                                    <Button
                                                        type="button"
                                                        className="flex-1 bg-brand-600 hover:bg-brand-500 gap-2"
                                                        onClick={() => setIsHotinfoConfirmed(true)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Bilgiler Güncel, Onaylıyorum
                                                    </Button>
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="file"
                                                            accept=".hxl"
                                                            onChange={handleHotinfoUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                        />
                                                        <Button variant="outline" type="button" className="w-full border-white/10 hover:bg-white/5 gap-2">
                                                            <ArrowLeft className="h-4 w-4 rotate-90" />
                                                            Bilgiler Yanlış, Yeni Dosya Yükle
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between pt-2 border-t border-brand-500/20 mt-4">
                                                    <div className="flex items-center gap-2 text-brand-400 text-sm">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Sistem bilgileriniz talebe eklendi.</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        type="button"
                                                        className="text-xs text-muted-foreground hover:text-white"
                                                        onClick={() => setIsHotinfoConfirmed(false)}
                                                    >
                                                        Güncelle
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4 text-center">
                                            <div className="h-10 w-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                                <AlertTriangle className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-orange-400">Hotinfo Dosyası Eksik</p>
                                                <p className="text-xs text-muted-foreground max-w-xs">
                                                    Size daha iyi yardımcı olabilmemiz için lütfen Allmenü'den Hotinfo dosyanızı (.hxl) oluşturup yükleyin.
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".hxl"
                                                    onChange={handleHotinfoUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <Button type="button" className="bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-500/20">
                                                    Hotinfo Yükle (.hxl)
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {isAllplanSelected && !isHotinfoConfirmed && (
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            En güncel sistem bilgileriyle destek ekibimizin size %80 daha hızlı yanıt vermesini sağlayabilirsiniz.
                                        </p>
                                    )}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Açıklama</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın. Gerekli bağlantı veya adımları buraya yazabilirsiniz..."
                                                className="min-h-[150px] bg-slate-950/50 border-white/10 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 pt-2">
                                <label className="text-sm font-medium leading-none">
                                    Ek Dosyalar (Opsiyonel)
                                </label>
                                <div className="flex flex-wrap gap-2 min-h-12 p-4 rounded-lg bg-slate-950/50 border border-white/5 border-dashed items-center relative">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs border border-white/10 animate-in fade-in zoom-in-95 group">
                                            <Paperclip className="h-3 w-3 text-brand-400" />
                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-400 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {files.length === 0 && (
                                        <p className="text-sm text-muted-foreground absolute inset-0 flex items-center justify-center pointer-events-none">
                                            Dosya seçmek için aşağıdaki butonu kullanın
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <Input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <Button type="button" variant="outline" size="sm" className="border-white/10 hover:bg-white/5" asChild>
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Dosya Seç
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-white/5 pt-6 mt-6">
                            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading} className="text-muted-foreground hover:text-white">
                                İptal
                            </Button>
                            <Button type="submit" disabled={loading || (isAllplanSelected && !isHotinfoConfirmed)} className="bg-brand-600 hover:bg-brand-500 min-w-32 shadow-lg shadow-brand-500/20">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Talebi Gönder
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
