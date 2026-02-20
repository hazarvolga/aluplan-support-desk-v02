'use client';

import { useState } from 'react';
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
import { Paperclip, X, Loader2 } from 'lucide-react';
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
    const [files, setFiles] = useState<File[]>([]);

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema) as any,
        defaultValues: {
            subject: '',
            description: '',
            priority: 'MEDIUM',
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles([...files, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const onSubmit = async (values: TicketFormValues) => {
        setLoading(true);
        try {
            // 1. Create Ticket
            const ticket = await api.tickets.create(values);

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

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Yeni Destek Talebi</h1>
                <p className="text-muted-foreground text-lg">Yaşadığınız sorunu detaylıca anlatın, ekibimiz en kısa sürede size dönecektir.</p>
            </div>

            <Card className="bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Talep Detayları</CardTitle>
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
                                            <Input placeholder="Sorununuzun kısa bir özeti" {...field} className="bg-slate-900" />
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
                                                <SelectTrigger className="bg-slate-900">
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

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Açıklama</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın..."
                                                className="min-h-[150px] bg-slate-900 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* File Upload Section */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Ekler (Opsiyonel)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs border border-white/5 animate-in fade-in zoom-in-95">
                                            <Paperclip className="h-3 w-3 opacity-50" />
                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-400">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="cursor-pointer">
                                        <Input type="file" multiple className="hidden" onChange={handleFileChange} />
                                        <div className="flex items-center gap-2 bg-brand-500/10 text-brand-400 px-3 py-1.5 rounded-full text-xs border border-brand-500/20 hover:bg-brand-500/20 transition-all">
                                            <Paperclip className="h-3 w-3" />
                                            Dosya Ekle
                                        </div>
                                    </label>
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">Maksimum 10MB boyunda görsel, PDF veya döküman ekleyebilirsiniz.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-white/5 pt-6 bg-slate-900/30 rounded-b-xl">
                            <Button variant="ghost" onClick={() => router.back()} type="button">İptal</Button>
                            <Button type="submit" disabled={loading} className="px-8 bg-brand-600 hover:bg-brand-700">
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
