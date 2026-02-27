'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, Save, Eye, History, Megaphone, Users, Trash2, BookOpen, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import DOMPurify from 'dompurify';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('create');

    // Form State for Announcement
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [mjmlSource, setMjmlSource] = useState('<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text font-size="20px" color="#333">Merhaba {{customer.name}}!</mj-text>\n        <mj-text>Duyuru içeriği buraya gelecek...</mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>');
    const [criteria, setCriteria] = useState({
        industries: [] as string[],
        statuses: [] as string[],
        companyNames: [] as string[],
        tags: [] as string[]
    });

    const [filterOptions, setFilterOptions] = useState({
        industries: [] as string[],
        statuses: [] as string[],
        companies: [] as string[]
    });

    // Form State for Template Management
    const [editTemplate, setEditTemplate] = useState<any>(null);
    const [templateName, setTemplateName] = useState('');
    const [templateTopic, setTemplateTopic] = useState('');
    const [templateSubject, setTemplateSubject] = useState('');
    const [templateMjml, setTemplateMjml] = useState('');
    const [templateSaving, setTemplateSaving] = useState(false);

    const [targetCount, setTargetCount] = useState<number | null>(null);
    const [counting, setCounting] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [rendering, setRendering] = useState(false);
    const [templatePreviewHtml, setTemplatePreviewHtml] = useState<string | null>(null);
    const [templateRendering, setTemplateRendering] = useState(false);
    const [saving, setSaving] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);

    // Template Filtering
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [searchTerm, setSearchTerm] = useState('');
    const categories = ['Tümü', 'Product', 'Security', 'Compliance', 'Operations', 'AI & Technology', 'Infrastructure', 'Change Management', 'Education', 'Performance Reports', 'Strategic Updates', 'Community'];

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = selectedCategory === 'Tümü' || t.topic === selectedCategory;
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Load Data
    const loadData = async () => {
        setLoading(true);
        try {
            const [annData, tempData, filters] = await Promise.all([
                api.announcements.list(),
                api.announcementTemplates.list(),
                api.announcements.getFilters()
            ]);
            setAnnouncements(annData);
            setTemplates(tempData);
            setFilterOptions(filters);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Target Counter Logic
    useEffect(() => {
        const fetchCount = async () => {
            if (activeTab !== 'create') return;
            setCounting(true);
            try {
                const res = await api.announcements.getTargetCount(criteria);
                setTargetCount(res.count);
            } catch (error) {
                console.error(error);
            } finally {
                setCounting(false);
            }
        };

        const timer = setTimeout(fetchCount, 500);
        return () => clearTimeout(timer);
    }, [criteria, activeTab]);

    const handlePreview = async (mjmlOverride?: string) => {
        setRendering(true);
        try {
            const res = await api.email.previewTemplate('raw', {
                mjml: mjmlOverride || mjmlSource,
                customer: { name: 'Örnek Müşteri' }
            });
            if (res.success) {
                setPreviewHtml(res.html);
            }
        } catch (error: any) {
            toast.error('Önizleme hatası: ' + error.message);
        } finally {
            setRendering(false);
        }
    };

    const handleTemplatePreview = async (template: any) => {
        if (templatePreviewHtml) {
            setTemplatePreviewHtml(null);
            return;
        }
        setTemplateRendering(true);
        try {
            const res = await api.email.previewTemplate('raw', {
                mjml: template.contentMjml,
                customer: { name: 'Örnek Müşteri' }
            });
            if (res.success) {
                setTemplatePreviewHtml(res.html);
            }
        } catch (error: any) {
            toast.error('Önizleme hatası: ' + error.message);
        } finally {
            setTemplateRendering(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName || !templateMjml) {
            toast.error('Şablon adı ve içeriği gereklidir');
            return;
        }
        setTemplateSaving(true);
        try {
            const payload = {
                name: templateName,
                topic: templateTopic,
                subject: templateSubject,
                contentMjml: templateMjml
            };

            if (editTemplate) {
                await api.announcementTemplates.update(editTemplate.id, payload);
                toast.success('Şablon güncellendi');
            } else {
                await api.announcementTemplates.create(payload);
                toast.success('Şablon kütüphaneye eklendi');
            }
            loadData();
            setEditTemplate(null);
            clearTemplateForm();
        } catch (error: any) {
            toast.error('Hata: ' + error.message);
        } finally {
            setTemplateSaving(false);
        }
    };

    const clearTemplateForm = () => {
        setTemplateName('');
        setTemplateTopic('');
        setTemplateSubject('');
        setTemplateMjml('');
        setEditTemplate(null);
    };

    const applyTemplate = (temp: any) => {
        setMjmlSource(temp.contentMjml);
        setSubject(temp.subject || '');
        toast.info(`${temp.name} şablonu uygulandı`);
    };

    const handleSave = async () => {
        if (!title || !subject) {
            toast.error('Başlık ve Konu gerekli');
            return;
        }
        setSaving(true);
        try {
            await api.announcements.create({
                title,
                subject,
                contentMjml: mjmlSource,
                targetCriteria: criteria,
                type: 'BROADCAST'
            });
            toast.success('Duyuru taslağı kaydedildi');
            loadData();
            setActiveTab('history');
        } catch (error: any) {
            toast.error('Kaydedilemedi: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBroadcast = async (id: string) => {
        if (!confirm('Bu duyuruyu seçilen tüm müşterilere göndermek istediğinizden emin misiniz?')) return;

        setBroadcasting(true);
        try {
            const res = await api.announcements.broadcast(id);
            toast.success(`${res.count} müşteriye gönderim başlatıldı.`);
            loadData();
        } catch (error: any) {
            toast.error('Gönderim sırasında hata: ' + error.message);
        } finally {
            setBroadcasting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Duyuruyu silmek istediğinizden emin misiniz?')) return;
        try {
            await api.announcements.delete(id);
            toast.success('Duyuru silindi');
            loadData();
        } catch (error: any) {
            toast.error('Silinemedi: ' + error.message);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Şablonu kütüphaneden silmek istediğinizden emin misiniz?')) return;
        try {
            await api.announcementTemplates.delete(id);
            toast.success('Şablon silindi');
            loadData();
        } catch (error: any) {
            toast.error('Silinemedi: ' + error.message);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Duyuru Yönetimi</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4" /> Duyuru Oluştur
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Şablon Kütüphanesi
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> Gönderim Geçmişi
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>İçerik Editörü (MJML)</CardTitle>
                                        <CardDescription>Müşterilere gidecek olan mailin içeriğini hazırlayın.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(v) => {
                                            const t = templates.find(t => t.id === v);
                                            if (t) applyTemplate(t);
                                        }}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Şablon Seç" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Duyuru Adı (Dahili kullanım için)</Label>
                                        <Input
                                            id="title"
                                            placeholder="Örn: 2024 Yaz Hotfix Duyurusu"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="subject">E-Posta Konusu</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Müşteriye görünecek konu başlığı"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>MJML Kaynağı</Label>
                                        <div className="border rounded-md font-mono text-sm leading-relaxed overflow-hidden">
                                            <textarea
                                                className="w-full h-[400px] p-4 bg-slate-950 text-slate-100 outline-none resize-none"
                                                value={mjmlSource}
                                                onChange={e => setMjmlSource(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" onClick={() => handlePreview()} disabled={rendering}>
                                        {rendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                                        Önizleme
                                    </Button>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Taslağı Kaydet
                                    </Button>
                                </CardFooter>
                            </Card>

                            {previewHtml && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Canlı Önizleme</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setPreviewHtml(null)}>Kapat</Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-md bg-white p-4 overflow-auto max-h-[600px]">
                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" /> Hedef Kitle
                                    </CardTitle>
                                    <CardDescription>Duyurunun kimlere ulaşacağını belirleyin.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Sektörler</Label>
                                            <MultiSelect
                                                placeholder="Sektör Seç"
                                                options={filterOptions.industries.map(i => ({ label: i, value: i }))}
                                                selected={criteria.industries}
                                                onChange={v => setCriteria(prev => ({ ...prev, industries: v }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Müşteri Durumu</Label>
                                            <MultiSelect
                                                placeholder="Durum Seç"
                                                options={filterOptions.statuses.map(s => ({ label: s, value: s }))}
                                                selected={criteria.statuses}
                                                onChange={v => setCriteria(prev => ({ ...prev, statuses: v }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Şirket Adı</Label>
                                            <MultiSelect
                                                placeholder="Şirket Seç"
                                                options={filterOptions.companies.map(c => ({ label: c, value: c }))}
                                                selected={criteria.companyNames}
                                                onChange={v => setCriteria(prev => ({ ...prev, companyNames: v }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Özel Etiketler (Tags)</Label>
                                            <Input
                                                placeholder="Etiket ekleyin (Enter)"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        const target = e.target as HTMLInputElement;
                                                        const val = target.value.trim();
                                                        if (val) {
                                                            setCriteria(prev => ({ ...prev, tags: [...new Set([...prev.tags, val])] }));
                                                            target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {criteria.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => setCriteria(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}>
                                                        {tag} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border flex flex-col items-center justify-center space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Hedeflenen Müşteri Sayısı</div>
                                        <div className="text-4xl font-bold text-primary">
                                            {counting ? <Loader2 className="h-8 w-8 animate-spin" /> : (targetCount ?? 0)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Şu anki kriterlere göre</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Şablon Düzenleyici</CardTitle>
                                            <CardDescription>
                                                {editTemplate ? `${editTemplate.name} şablonunu düzenliyorsunuz.` : 'Yeni bir şablon oluşturun.'}
                                            </CardDescription>
                                        </div>
                                        {editTemplate && (
                                            <Button variant="ghost" size="sm" onClick={clearTemplateForm}>Yeni Oluştur</Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Şablon Adı</Label>
                                            <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Örn: Hoşgeldin Maili" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Konu (Topic)</Label>
                                            <Input value={templateTopic} onChange={e => setTemplateTopic(e.target.value)} placeholder="Örn: Onboarding" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Varsayılan E-Posta Konusu</Label>
                                        <Input value={templateSubject} onChange={e => setTemplateSubject(e.target.value)} placeholder="Müşteriye görünecek konu" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>MJML İçeriği</Label>
                                        <div className="border rounded-md font-mono text-sm leading-relaxed overflow-hidden">
                                            <textarea
                                                className="w-full h-[350px] p-4 bg-slate-950 text-slate-100 outline-none resize-none"
                                                value={templateMjml}
                                                onChange={e => setTemplateMjml(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" onClick={() => handlePreview(templateMjml)} disabled={rendering}>
                                        {rendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                                        Önizle
                                    </Button>
                                    <Button onClick={handleSaveTemplate} disabled={templateSaving}>
                                        {templateSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {editTemplate ? 'Güncelle' : 'Kütüphaneye Kaydet'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Şablon Kütüphanesi</CardTitle>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter opacity-50">Enterprise Ready</Badge>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                placeholder="Şablon ara..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="h-8 text-sm bg-slate-50/50 dark:bg-slate-900/50"
                                            />
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Kategori Seç" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat} value={cat} className="text-xs">
                                                            {cat} {cat !== 'Tümü' ? `(${templates.filter(t => t.topic === cat).length})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <ScrollArea className="h-[430px] pr-4">
                                        <div className="space-y-3">
                                            {filteredTemplates.length === 0 && (
                                                <div className="text-center py-20 border border-dashed rounded-lg flex flex-col items-center gap-2 opacity-50">
                                                    <BookOpen className="h-8 w-8" />
                                                    <span className="text-sm">Aradığınız kriterde şablon bulunamadı.</span>
                                                </div>
                                            )}
                                            {filteredTemplates.map(t => (
                                                <div key={t.id} className="p-3 border rounded-md group hover:border-primary transition-colors" >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-sm cursor-pointer" onClick={() => {
                                                            setEditTemplate(t);
                                                            setTemplateName(t.name);
                                                            setTemplateTopic(t.topic || '');
                                                            setTemplateSubject(t.subject || '');
                                                            setTemplateMjml(t.contentMjml);
                                                            setTemplatePreviewHtml(null);
                                                        }}>{t.name}</span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-500" title="Önizle" onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTemplatePreview(t);
                                                            }} disabled={templateRendering}>
                                                                {templateRendering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTemplate(t.id);
                                                            }}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                                                        <span>{t.topic || 'Genel'}</span>
                                                        <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {templatePreviewHtml && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between py-3">
                                        <CardTitle className="text-sm">Şablon Önizlemesi</CardTitle>
                                        <Button variant="ghost" size="sm" className="h-7" onClick={() => setTemplatePreviewHtml(null)}>
                                            <EyeOff className="h-4 w-4 mr-1" /> Kapat
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="border rounded-md bg-white p-4 overflow-auto max-h-[500px]">
                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(templatePreviewHtml) }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gönderim Geçmişi</CardTitle>
                            <CardDescription>Daha önce gönderilen veya taslak halindeki duyurular.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-4">
                                    {announcements.length === 0 && !loading && (
                                        <div className="text-center py-10 text-muted-foreground">Henüz duyuru bulunmuyor.</div>
                                    )}
                                    {announcements.map((ann) => (
                                        <div key={ann.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-lg">{ann.title}</span>
                                                    <Badge variant={ann.status === 'SENT' ? 'default' : 'secondary'}>
                                                        {ann.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                                    <span>Konu: {ann.subject}</span>
                                                    <span>Oluşturan: {ann.author?.fullName}</span>
                                                    <span>Tarih: {new Date(ann.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex gap-2 pt-1">
                                                    {ann._count?.logs > 0 && <span className="text-green-600 font-medium">✓ {ann._count.logs} Alıcıya ulaşıldı</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {ann.status === 'DRAFT' && (
                                                    <Button variant="default" size="sm" onClick={() => handleBroadcast(ann.id)} disabled={broadcasting}>
                                                        <Send className="h-4 w-4 mr-2" /> Yayınla
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(ann.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
