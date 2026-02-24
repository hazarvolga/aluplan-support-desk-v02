import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, Send } from 'lucide-react';
import { toast } from 'sonner';

export function EmailTemplates() {
    const [templates, setTemplates] = useState<string[]>([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(true);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewSubject, setPreviewSubject] = useState<string | null>(null);
    const [rendering, setRendering] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.email.templates();
                setTemplates(data.templates);
                if (data.templates.length > 0) {
                    setSelected(data.templates[0]);
                }
            } catch (error) {
                console.error(error);
                toast.error('Şablonlar yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handlePreview = async () => {
        if (!selected) return;
        setRendering(true);
        try {
            const result = await api.email.previewTemplate(selected, {});
            if (result.success) {
                setPreviewHtml(result.html);
                setPreviewSubject(result.subject);
            } else {
                toast.error(result.error || 'Derleme hatası');
            }
        } catch (error: any) {
            toast.error('Önizleme yüklenemedi: ' + error.message);
            setPreviewHtml(null);
        } finally {
            setRendering(false);
        }
    };

    return (
        <Card className="bg-card/20 border-white/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">Şablon Önizleme Modülü</CardTitle>
                <CardDescription>Aktif MJML şablonlarını mock verilerle test edin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                ) : (
                    <div className="flex gap-4 items-center">
                        <Select value={selected} onValueChange={setSelected}>
                            <SelectTrigger className="w-[250px] bg-slate-900/50">
                                <SelectValue placeholder="Şablon seçin..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handlePreview} disabled={rendering || !selected} className="bg-brand-600">
                            {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                            Önizle
                        </Button>
                    </div>
                )}

                {previewHtml && (
                    <div className="mt-6 border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        <div className="bg-slate-900 p-3 border-b border-white/10 text-sm">
                            <span className="text-muted-foreground mr-2">Konu:</span>
                            <span className="font-medium text-white">{previewSubject}</span>
                        </div>
                        <div className="w-full bg-white h-[600px] overflow-auto">
                            <iframe
                                srcDoc={previewHtml}
                                className="w-full h-full border-0"
                                title="email-preview"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
