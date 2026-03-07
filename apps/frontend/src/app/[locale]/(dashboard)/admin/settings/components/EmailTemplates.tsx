'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, Save, FilePlus, Code, Mail, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { MjmlEditor } from '@/components/email/MjmlEditor';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

export function EmailTemplates() {
    const [templates, setTemplates] = useState<string[]>([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(true);
    const [mjmlSource, setMjmlSource] = useState('');
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewSubject, setPreviewSubject] = useState<string | null>(null);
    const [rendering, setRendering] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [safeModeOpen, setSafeModeOpen] = useState(false);

    // Load template list
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

    // Load source when selection changes
    useEffect(() => {
        if (!selected) return;
        const loadSource = async () => {
            try {
                const res = await api.email.getTemplateSource(selected);
                setMjmlSource(res.content);
                setDirty(false);
                setPreviewHtml(null);
            } catch (error: any) {
                toast.error('Şablon kaynağı yüklenemedi: ' + error.message);
                setMjmlSource('');
            }
        };
        loadSource();
    }, [selected]);

    const handlePreview = useCallback(async () => {
        if (!selected) return;
        setRendering(true);
        try {
            const result = await api.email.previewTemplate(selected, {});
            if (result.success) {
                setPreviewHtml(result.html);
                setPreviewSubject(result.subject);
                setActiveTab('preview');
            } else {
                toast.error(result.error || 'Derleme hatası');
            }
        } catch (error: any) {
            toast.error('Önizleme yüklenemedi: ' + error.message);
            setPreviewHtml(null);
        } finally {
            setRendering(false);
        }
    }, [selected]);

    const handleSave = useCallback(async () => {
        if (!selected || !mjmlSource) return;
        setSaving(true);
        try {
            await api.email.saveTemplate(selected, mjmlSource);
            setDirty(false);
            toast.success(`"${selected}" şablonu kaydedildi.`);
            // Auto-preview after save
            handlePreview();
        } catch (error: any) {
            toast.error('Kayıt başarısız: ' + error.message);
        } finally {
            setSaving(false);
        }
    }, [selected, mjmlSource, handlePreview]);

    const handleCreateNew = useCallback(async () => {
        const name = newTemplateName.trim().toLowerCase().replace(/\s+/g, '-').replace(/\.mjml$/, '');
        if (!name) {
            toast.error('Şablon adı gerekli');
            return;
        }

        const defaultMjml = `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Inter, system-ui, sans-serif" />
      <mj-text line-height="1.5" color="#52525b" />
    </mj-attributes>
    <mj-style>
      .brand-box { border-radius: 12px; overflow: hidden; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <mj-section padding="40px 20px">
      <mj-column width="100%" background-color="#ffffff" border-radius="16px" padding="20px">
        <mj-text font-size="24px" color="#0f172a" font-weight="bold" padding-bottom="0">
          {{brand.name}}
        </mj-text>
        <mj-divider border-width="1px" border-color="#f1f5f9" padding="20px 0" />
        <mj-text font-size="16px">
          Yeni e-posta şablonunuz başarıyla oluşturuldu.
        </mj-text>
        <mj-text padding-top="20px">
          Düzenlemek için sol taraftaki MJML editörünü kullanabilirsiniz. Sağ taraftaki önizleme panelinden canlı sonucu görebilirsiniz.
        </mj-text>
        <mj-button background-color="#0ea5e9" color="white" border-radius="8px" padding-top="30px" href="{{brand.help_center_url}}">
          Yardım Merkezi
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

        try {
            await api.email.saveTemplate(name, defaultMjml);
            setTemplates(prev => [...prev, name]);
            setSelected(name);
            setNewTemplateName('');
            setShowNewDialog(false);
            toast.success(`"${name}" şablonu oluşturuldu.`);
        } catch (error: any) {
            toast.error('Oluşturma başarısız: ' + error.message);
        }
    }, [newTemplateName]);

    if (loading) {
        return (
            <Card className="bg-card/20 border-white/5">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="bg-card/20 border-white/5">
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex gap-3 items-center flex-wrap">
                            <Select value={selected} onValueChange={setSelected}>
                                <SelectTrigger className="w-[220px] bg-slate-900/50">
                                    <SelectValue placeholder="Şablon seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNewDialog(!showNewDialog)}
                                className="border-white/10 hover:bg-white/5"
                            >
                                <FilePlus className="h-4 w-4 mr-2" />
                                Yeni Şablon
                            </Button>
                        </div>

                        <div className="flex gap-2 items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreview}
                                disabled={rendering || !selected}
                                className="border-white/10 hover:bg-white/5"
                            >
                                {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                                Önizle
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving || !dirty || !selected}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Kaydet
                                {dirty && <span className="ml-1 h-2 w-2 rounded-full bg-amber-400 inline-block" />}
                            </Button>
                        </div>
                    </div>

                    {/* New Template Dialog (Inline) */}
                    {showNewDialog && (
                        <div className="mt-4 flex gap-3 items-center p-3 bg-slate-900/50 border border-white/10">
                            <input
                                type="text"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                placeholder="ornek-sablon-adi"
                                className="flex-1 px-3 py-2 bg-background border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                            />
                            <Button size="sm" onClick={handleCreateNew} className="bg-primary text-primary-foreground">
                                Oluştur
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setShowNewDialog(false); setNewTemplateName(''); }}>
                                İptal
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Editor & Preview Split */}
            {selected && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* MJML Editor */}
                    <Card className="bg-card/20 border-white/5">
                        <CardHeader className="py-3 px-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-medium">MJML Editör</CardTitle>
                                <span className="text-xs text-muted-foreground ml-auto">{selected}.mjml</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <textarea
                                value={mjmlSource}
                                onChange={(e) => {
                                    setMjmlSource(e.target.value);
                                    setDirty(true);
                                }}
                                spellCheck={false}
                                className="w-full h-[600px] p-4 bg-[#1F1F1F] text-[#F5F5F5] font-mono text-xs leading-relaxed resize-none border-0 focus:outline-none focus:ring-0 scrollbar-thin"
                                placeholder="MJML içeriğini buraya yazın..."
                            />
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="bg-card/20 border-white/5">
                        <CardHeader className="py-3 px-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-medium">E-Posta Önizleme</CardTitle>
                                {previewSubject && (
                                    <span className="text-xs text-muted-foreground ml-auto truncate max-w-[200px]">
                                        Konu: {previewSubject}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {previewHtml ? (
                                <div className="w-full bg-white h-[600px] overflow-auto">
                                    <iframe
                                        srcDoc={previewHtml}
                                        className="w-full h-full border-0"
                                        title="email-preview"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                                    <Eye className="h-10 w-10 mb-3 opacity-30" />
                                    <p className="text-sm">Önizleme için &quot;Önizle&quot; butonuna tıklayın.</p>
                                    <p className="text-xs mt-1 opacity-60">Kaydet &rarr; Önizle akışı önerilir.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Safe Editor Dialog */}
            <Dialog open={safeModeOpen} onOpenChange={setSafeModeOpen}>
                <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 overflow-hidden bg-background border-white/5">
                    <VisuallyHidden.Root>
                        <DialogTitle>Güvenli İçerik Editörü</DialogTitle>
                        <DialogDescription>MJML iskeletini bozmadan içeriklerinizi düzenleyin.</DialogDescription>
                    </VisuallyHidden.Root>
                    <MjmlEditor
                        type="transactional"
                        id={selected}
                        onClose={() => {
                            setSafeModeOpen(false);
                            // Refresh source after closing safe editor
                            api.email.getTemplateSource(selected).then(res => setMjmlSource(res.content));
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
