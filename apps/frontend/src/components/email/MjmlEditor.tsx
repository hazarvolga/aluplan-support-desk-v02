'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Save, Eye, Layout, Type, MousePointer2, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { LivePreview } from './LivePreview';
import { api } from '@/lib/api';

export interface EditableBlock {
    id: string;
    type: 'text' | 'button' | 'image';
    content?: string;
    href?: string;
    src?: string;
    alt?: string;
}

interface MjmlEditorProps {
    type: 'transactional' | 'announcement';
    id: string; // name for transactional, uuid for announcement
    onClose: () => void;
}

export function MjmlEditor({ type, id, onClose }: MjmlEditorProps) {
    const [blocks, setBlocks] = useState<EditableBlock[]>([]);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let blocksRes;
                let previewRes;

                if (type === 'transactional') {
                    blocksRes = await fetch(`/api/email/admin/templates/${id}/content`).then(r => r.json());
                    previewRes = await fetch(`/api/email/admin/templates/${id}/preview`, { method: 'POST' }).then(r => r.json());
                } else {
                    blocksRes = await fetch(`/api/email/admin/announcements/${id}/content`).then(r => r.json());
                    // Announcements might need a different preview endpoint or specific mock data
                    previewRes = await fetch(`/api/email/admin/announcements/${id}/preview`, { method: 'POST' }).then(r => r.json());
                }

                setBlocks(blocksRes.blocks || []);
                setPreviewHtml(previewRes.html || '');
            } catch (error) {
                console.error('Failed to load editor data:', error);
                toast.error('Şablon verileri yüklenemedi.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id]);

    // Handle live preview update (debounced)
    const updatePreview = useCallback(async (currentBlocks: EditableBlock[]) => {
        try {
            setPreviewLoading(true);
            // We might need a temporary endpoint that takes MJML or just the blocks to return HTML
            // For now, let's assume the preview endpoint can handle current blocks if we provide them 
            // or we just rely on "Save to Preview" functionality
        } catch (error) {
            console.error('Preview update failed:', error);
        } finally {
            setPreviewLoading(false);
        }
    }, [type, id]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const url = type === 'transactional'
                ? `/api/email/admin/templates/${id}/content`
                : `/api/email/admin/announcements/${id}/content`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks }),
            }).then(r => r.json());

            if (res.success) {
                toast.success('Şablon başarıyla kaydedildi.');
                // Refresh preview after save
                const previewUrl = type === 'transactional'
                    ? `/api/email/admin/templates/${id}/preview`
                    : `/api/email/admin/announcements/${id}/preview`;

                const preRes = await fetch(previewUrl, { method: 'POST' }).then(r => r.json());
                setPreviewHtml(preRes.html || '');
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.error('Kayıt işlemi başarısız oldu.');
        } finally {
            setSaving(false);
        }
    };

    const updateBlock = (blockId: string, updates: Partial<EditableBlock>) => {
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Şablon yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold">{id}</h2>
                        <p className="text-xs text-muted-foreground">E-posta İçerik Düzenleyici (Güvenli Mod)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Kaydet
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Sidebar */}
                <div className="w-[450px] border-right border-white/5 overflow-y-auto p-4 space-y-6 bg-white/[0.01]">
                    <div className="flex items-center gap-2 mb-2">
                        <Layout className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">İçerik Blokları</h3>
                    </div>

                    {blocks.length === 0 && (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Bu şablonda düzenlenebilir blok bulunamadı.</p>
                        </div>
                    )}

                    {blocks.map((block, index) => (
                        <Card key={block.id} className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                                    {index + 1}
                                </span>
                                {block.type === 'text' && <Type className="h-3.5 w-3.5 text-blue-400" />}
                                {block.type === 'button' && <MousePointer2 className="h-3.5 w-3.5 text-green-400" />}
                                {block.type === 'image' && <ImageIcon className="h-3.5 w-3.5 text-orange-400" />}
                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">
                                    {block.type === 'text' ? 'Metin Bloğu' : block.type === 'button' ? 'Buton / Link' : 'Görsel'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {block.type === 'text' && (
                                    <RichTextEditor
                                        content={block.content || ''}
                                        onChange={(content) => updateBlock(block.id, { content })}
                                    />
                                )}

                                {block.type === 'button' && (
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Buton Metni</Label>
                                            <Input
                                                value={block.content}
                                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                                className="h-9 bg-black/40"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Hedef URL (HREF)</Label>
                                            <Input
                                                value={block.href}
                                                onChange={(e) => updateBlock(block.id, { href: e.target.value })}
                                                className="h-9 bg-black/40"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'image' && (
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Görsel URL (SRC)</Label>
                                            <Input
                                                value={block.src}
                                                onChange={(e) => updateBlock(block.id, { src: e.target.value })}
                                                className="h-9 bg-black/40"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alt Metin</Label>
                                            <Input
                                                value={block.alt}
                                                onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                                                className="h-9 bg-black/40"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Live Preview Area */}
                <div className="flex-1 flex flex-col p-4 bg-muted/30">
                    <LivePreview html={previewHtml} isLoading={previewLoading} />
                </div>
            </div>
        </div>
    );
}
