'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function NewKnowledgeBaseArticlePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Başlık ve içerik alanları zorunludur');
            return;
        }

        setLoading(true);
        try {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);

            await api.kb.create({
                title,
                content,
                tags: tagsArray,
                status: 'PUBLISHED' // Or DRAFT depending on your workflow
            });

            toast.success('Makale başarıyla Bilgi Bankasına eklendi.');
            router.push('/knowledge-base');
        } catch (error) {
            toast.error('Makale oluşturulurken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-brand-500" />
                        Yeni Makale Ekle
                    </h1>
                    <p className="text-sm text-slate-500">Bilgi bankasına manuel olarak yeni bir rehber veya makale ekleyin.</p>
                </div>
            </div>

            <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-sm">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5 pb-4">
                    <CardTitle className="text-lg">Makale İçeriği</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Makale Başlığı</label>
                        <Input
                            placeholder="Örn: Parola Nasıl Sıfırlanır?"
                            className="text-lg font-medium px-4 py-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Makale Gövdesi</label>
                        <Textarea
                            placeholder="Makalenin içeriğini buraya yazın... (Markdown desteklenir)"
                            className="min-h-[300px] resize-y bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono text-sm leading-relaxed"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Etiketler (Virgülle Ayırın)</label>
                        <Input
                            placeholder="örn: güvenlik, parola, hesap"
                            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                        <Button variant="outline" onClick={() => router.back()} disabled={loading}>İptal</Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white min-w-[120px]">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Kaydet ve Yayınla
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
