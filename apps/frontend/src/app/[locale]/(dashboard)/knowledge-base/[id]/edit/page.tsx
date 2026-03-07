'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface EditArticleForm {
    title: string;
    content: string;
    isInternal: boolean;
}

export default function EditKnowledgeArticlePage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params?.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<EditArticleForm>();

    useEffect(() => {
        const fetchArticle = async () => {
            if (!articleId) return;
            try {
                setIsLoading(true);
                const data = await api.kb.get(articleId);

                // Get content from the latest version
                const content = data.versions && data.versions.length > 0
                    ? data.versions[0].content
                    : '';

                reset({
                    title: data.title,
                    content: content,
                    isInternal: data.isInternal || false,
                });
            } catch (err: any) {
                console.error('Failed to load article:', err);
                setError(err.message || 'Belge yüklenirken bir hata oluştu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [articleId, reset]);

    const onSubmit = async (data: EditArticleForm) => {
        try {
            setIsSaving(true);
            await api.kb.update(articleId, {
                title: data.title,
                content: data.content,
                isInternal: data.isInternal,
                changeSummary: 'Admin tarafından arayüz üzerinden güncellendi.',
            });
            toast.success('Belge başarıyla güncellendi.');
            router.push(`/knowledge-base/${articleId}`);
        } catch (err: any) {
            console.error('Update failed:', err);
            toast.error(err.message || 'Güncelleme başarısız oldu.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="text-red-400 font-medium">{error}</div>
                <Button variant="outline" onClick={() => router.back()}>Geri Dön</Button>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col space-y-6 pt-6 pb-12">
            {/* Header & Actions */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-gray-400 hover:text-white"
                        title="İptal Et ve Geri Dön"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-500" />
                            Dokümanı Düzenle
                        </h1>
                        <p className="text-sm text-gray-400">
                            Yaptığınız değişiklikler yeni bir versiyon olarak kaydedilecek ve yapay zeka tarafından yeniden parçalanacaktır.
                        </p>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-gray-300 hover:text-white"
                        disabled={isSaving}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isDirty || isSaving}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Değişiklikleri Kaydet
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6">

                {/* Title Input */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-300">
                        Makale Başlığı
                    </label>
                    <input
                        id="title"
                        type="text"
                        {...register('title', { required: 'Başlık boş bırakılamaz' })}
                        className="w-full rounded-md border border-white/10 bg-neutral-900/50 px-4 py-3 text-lg font-medium text-white placeholder-gray-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                        placeholder="Makale başlığını girin..."
                    />
                    {errors.title && (
                        <p className="text-sm text-red-400">{errors.title.message}</p>
                    )}
                </div>

                {/* Internal Toggle */}
                <div className="flex items-center space-x-3 rounded-lg border border-white/10 bg-neutral-900/30 p-4">
                    <input
                        id="isInternal"
                        type="checkbox"
                        {...register('isInternal')}
                        className="h-4 w-4 rounded border-white/20 bg-neutral-800 text-orange-500 focus:ring-orange-500/50"
                    />
                    <div className="flex flex-col">
                        <label htmlFor="isInternal" className="text-sm font-medium text-gray-200 cursor-pointer">
                            Yalnızca Dahili Kullanım (AI Eğitimi)
                        </label>
                        <p className="text-xs text-gray-500">
                            Bu işaretlendiğinde, makale müşteri portalında listelenmez.
                        </p>
                    </div>
                </div>

                {/* Markdown Content Input */}
                <div className="flex flex-col space-y-2 flex-grow">
                    <div className="flex items-center justify-between">
                        <label htmlFor="content" className="text-sm font-medium text-gray-300">
                            İçerik (Markdown Editor)
                        </label>
                        <span className="text-xs text-gray-500">
                            Markdown formatı desteklenir.
                        </span>
                    </div>

                    {/* High contrast, large textarea for ease of reading */}
                    <textarea
                        id="content"
                        {...register('content', { required: 'İçerik boş bırakılamaz' })}
                        className="min-h-[60vh] w-full resize-y rounded-md border border-white/10 bg-[#1F1F1F] p-6 font-mono text-[15px] leading-relaxed text-white placeholder-gray-600 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 shadow-inner"
                        placeholder="# Başlık\n\nMetin buraya..."
                        spellCheck="false"
                    />
                    {errors.content && (
                        <p className="text-sm text-red-400">{errors.content.message}</p>
                    )}
                </div>
            </form>
        </div>
    );
}
