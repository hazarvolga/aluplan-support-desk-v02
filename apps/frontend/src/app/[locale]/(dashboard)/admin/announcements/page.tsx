'use client';

export const dynamic = "force-dynamic";

import { useTranslations, useLocale } from 'next-intl';
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
import { Loader2, Send, Save, Eye, History, Megaphone, Users, User, Trash2, BookOpen, EyeOff, Building2, Target, Globe, Shield, Mail, Clock, Layout, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/email/RichTextEditor';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import DOMPurify from 'dompurify';

// Mirrors the backend canonical announcement email context
// (apps/backend/src/announcements/announcement-email-context.ts).
// Preview must send the exact same `customer.*` field names the real
// broadcast sends, or a template that looks correct here can render blank
// for real recipients. Locked by src/lib/announcement-preview-context.spec.ts.
const PREVIEW_CUSTOMER_CONTEXT = {
    firstName: 'Örnek',
    lastName: 'Müşteri',
    fullName: 'Örnek Müşteri',
    companyName: 'Örnek A.Ş.',
    customerNo: 'CUST-000',
    email: 'ornek@aluplan.com',
    userEmail: 'ornek@aluplan.com',
};

export default function AnnouncementsPage() {
    const t = useTranslations('admin.announcements');
    const locale = useLocale();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('create');

    // Form State for Announcement
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    // Render literal string bypassing intl rich text node parsing
    const [contentHtml, setContentHtml] = useState(t.raw('editor.default_content'));
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
    const [templateContentHtml, setTemplateContentHtml] = useState('');
    const [templateSaving, setTemplateSaving] = useState(false);

    const [targetCount, setTargetCount] = useState<number | null>(null);
    const [counting, setCounting] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [rendering, setRendering] = useState(false);
    const [templatePreviewHtml, setTemplatePreviewHtml] = useState<string | null>(null);
    const [templatePreviewId, setTemplatePreviewId] = useState<string | null>(null);
    const [templateRendering, setTemplateRendering] = useState(false);
    const [saving, setSaving] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);

    // Template Filtering
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const templateCategories = [
        { key: 'ALL', label: t('library.all') },
        { key: 'Product', label: t('categories.product') },
        { key: 'Security', label: t('categories.security') },
        { key: 'Compliance', label: t('categories.compliance') },
        { key: 'Operations', label: t('categories.operations') },
        { key: 'AI & Technology', label: t('categories.ai_tech') },
        { key: 'Infrastructure', label: t('categories.infrastructure') },
        { key: 'Change Management', label: t('categories.change_management') },
        { key: 'Education', label: t('categories.education') },
        { key: 'Performance Reports', label: t('categories.performance_reports') },
        { key: 'Strategic Updates', label: t('categories.strategic_updates') },
        { key: 'Community', label: t('categories.community') }
    ];

    const filteredTemplates = templates.filter(t_item => {
        const matchesCategory = selectedCategory === 'ALL' || t_item.topic === selectedCategory;
        const matchesSearch = t_item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t_item.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
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
                // Ensure plain arrays and objects for backend DTO validation
                const cleanCriteria = {
                    industries: Array.isArray(criteria.industries) ? criteria.industries : [],
                    statuses: Array.isArray(criteria.statuses) ? criteria.statuses : [],
                    companyNames: Array.isArray(criteria.companyNames) ? criteria.companyNames : [],
                    tags: Array.isArray(criteria.tags) ? criteria.tags : []
                };
                const res = await api.announcements.getTargetCount(cleanCriteria);
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

    const handlePreview = async (contentOverride?: string) => {
        setRendering(true);
        try {
            // For preview, we wrap the RichText content in the master layout
            // Or we just send the contentHtml to a new API endpoint that does this
            // For now let's send it as is, and we will update the backend to handle it
            const res = await api.email.previewTemplate('master-announcement', {
                contentHtml: contentOverride || contentHtml,
                customer: PREVIEW_CUSTOMER_CONTEXT,
            });
            if (res.success && res.html) {
                setPreviewHtml(res.html);
            }
        } catch (error: any) {
            toast.error(t('toasts.preview_error') + ' ' + (error.message || t('toasts.unknown_error')));
        } finally {
            setRendering(false);
        }
    };

    const handleTemplatePreview = async (template: any) => {
        // If same template is previewed, toggle off
        if (templatePreviewId === template.id && templatePreviewHtml) {
            setTemplatePreviewHtml(null);
            setTemplatePreviewId(null);
            return;
        }
        // Show new template (even if another is already shown)
        setTemplateRendering(true);
        setTemplatePreviewId(template.id);
        try {
            const htmlContent = template.contentHtml || template.contentMjml || template.mjml || '';
            if (!htmlContent) {
                toast.error(t('toasts.template_empty'));
                return;
            }
            const res = await api.email.previewTemplate('master-announcement', {
                contentHtml: htmlContent,
                customer: PREVIEW_CUSTOMER_CONTEXT,
            });
            if (res.success && res.html) {
                setTemplatePreviewHtml(res.html);
            } else {
                toast.error(res.error || t('toasts.template_compile_error'));
                setTemplatePreviewId(null);
            }
        } catch (error: any) {
            toast.error(t('toasts.preview_error') + ' ' + (error.message || t('toasts.unknown_error')));
            setTemplatePreviewId(null);
        } finally {
            setTemplateRendering(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName || !templateContentHtml) {
            toast.error(t('toasts.required_fields'));
            return;
        }
        setTemplateSaving(true);
        try {
            const payload = {
                name: templateName,
                topic: templateTopic,
                subject: templateSubject,
                contentMjml: templateContentHtml // Backend hala bu simi bekliyor olabilir, orayı da düzelteceğiz
            };

            if (editTemplate) {
                await api.announcementTemplates.update(editTemplate.id, payload);
                toast.success(t('toasts.template_updated'));
            } else {
                await api.announcementTemplates.create(payload);
                toast.success(t('toasts.template_added'));
            }
            loadData();
            setEditTemplate(null);
            clearTemplateForm();
        } catch (error: any) {
            toast.error(t('toasts.error') + ': ' + error.message);
        } finally {
            setTemplateSaving(false);
        }
    };

    const clearTemplateForm = () => {
        setTemplateName('');
        setTemplateTopic('');
        setTemplateSubject('');
        setTemplateContentHtml('');
        setEditTemplate(null);
    };

    const applyTemplate = (temp: any) => {
        setTitle(temp.name || '');
        setContentHtml(temp.contentMjml || temp.contentHtml || '');
        setSubject(temp.subject || '');
        setActiveTab('create');

        // Scroll to editor area with a slight delay to ensure tab switch is complete
        setTimeout(() => {
            const editorEl = document.getElementById('announcement-editor-area');
            if (editorEl) {
                editorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        toast.info(t('toasts.template_applied', { name: temp.name }));
    };

    const handleSave = async () => {
        if (!title || !subject) {
            toast.error(t('toasts.title_subject_required'));
            return;
        }
        setSaving(true);
        try {
            await api.announcements.create({
                title,
                subject,
                contentMjml: contentHtml, // Sending as contentMjml for legacy compatibility if needed
                targetCriteria: criteria,
                type: 'BROADCAST'
            });
            toast.success(t('toasts.draft_saved'));
            loadData();
            setTitle('');
            setSubject('');
            setCriteria({ industries: [], statuses: [], companyNames: [], tags: [] });
            setActiveTab('history');
        } catch (error: any) {
            toast.error((error.message || t('toasts.save_failed')));
        } finally {
            setSaving(false);
        }
    };

    const handleBroadcast = async (id: string) => {
        if (!confirm(t('toasts.confirm_broadcast'))) return;

        setBroadcasting(true);
        try {
            const res = await api.announcements.broadcast(id);
            toast.success(t('toasts.broadcast_success', { count: res.count }));
            loadData();
        } catch (error: any) {
            toast.error((error.message || t('toasts.broadcast_error')));
        } finally {
            setBroadcasting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('toasts.confirm_delete_announcement'))) return;
        try {
            await api.announcements.delete(id);
            toast.success(t('toasts.delete_success'));
            loadData();
        } catch (error: any) {
            toast.error((error.message || t('toasts.delete_failed')));
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm(t('toasts.confirm_delete_template'))) return;
        try {
            await api.announcementTemplates.delete(id);
            toast.success(t('toasts.delete_success'));
            loadData();
        } catch (error: any) {
            toast.error((error.message || t('toasts.delete_failed')));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6 p-8 pt-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Megaphone className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[16px] md:text-[18px] font-bold tracking-tight text-foreground uppercase truncate">{t('title')}</h1>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{t('subtitle')}</p>
                        </div>
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-emerald-500/5 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-widest text-[10px]">
                        {t('enterprise_control')}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4" /> {t('tabs.create')}
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> {t('tabs.templates')}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> {t('tabs.history')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <Card className="glass-card overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between bg-white/5 border-b border-white/5">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-emerald-500" /> {t('editor.title')}
                                        </CardTitle>
                                        <CardDescription className="text-xs">{t('editor.desc')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(v) => {
                                            const t = templates.find(t => t.id === v);
                                            if (t) applyTemplate(t);
                                        }}>
                                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 h-8 text-[10px] font-bold uppercase tracking-widest">
                                                <SelectValue placeholder={t('editor.template_select')} />
                                            </SelectTrigger>
                                            <SelectContent className="glass-card border-white/10">
                                                {templates.map(t_item => (
                                                    <SelectItem key={t_item.id} value={t_item.id} className="text-xs uppercase tracking-tighter">{t_item.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('editor.title_label')}</Label>
                                            <Input
                                                id="title"
                                                placeholder={t('editor.title_placeholder')}
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('editor.subject_label')}</Label>
                                            <Input
                                                id="subject"
                                                placeholder={t('editor.subject_placeholder')}
                                                value={subject}
                                                onChange={e => setSubject(e.target.value)}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-emerald-500/80">{t('editor.content_label')}</Label>
                                        <div id="announcement-editor-area" className="border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-white/[0.02]">
                                            <RichTextEditor
                                                content={contentHtml}
                                                onChange={setContentHtml}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between bg-white/[0.02] border-t border-white/5 py-4">
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => handlePreview()} disabled={rendering} className="h-9 px-4 border-white/10 hover:bg-white/5">
                                            {rendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4 text-emerald-500" />}
                                            {t('editor.preview')}
                                        </Button>
                                    </div>
                                    <Button onClick={handleSave} disabled={saving} className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {t('editor.save_draft')}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {previewHtml && (
                                <Card className="glass-card mt-6 border-emerald-500/20">
                                    <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-white/5 bg-white/5">
                                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-500">{t('preview_prepared')}</CardTitle>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => setPreviewHtml(null)}>{t('close')}</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="w-full bg-white h-[500px] overflow-hidden">
                                            <iframe
                                                srcDoc={previewHtml}
                                                className="w-full h-full border-0"
                                                title="announcement-preview"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card className="glass-card overflow-hidden">
                                <CardHeader className="bg-white/5 border-b border-white/5">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-widest">
                                        <Target className="h-4 w-4 text-emerald-500" /> {t('audience.title')}
                                    </CardTitle>
                                    <CardDescription className="text-xs">{t('audience.desc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('industries')}</Label>
                                            </div>
                                            <MultiSelect
                                                placeholder={t('audience.industry_placeholder')}
                                                options={filterOptions.industries.map(i => ({ label: i, value: i }))}
                                                selected={criteria.industries}
                                                onChange={v => setCriteria(prev => ({ ...prev, industries: v }))}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('customer_status')}</Label>
                                            </div>
                                            <MultiSelect
                                                placeholder={t('audience.status_placeholder')}
                                                options={filterOptions.statuses.map(s => ({ label: s, value: s }))}
                                                selected={criteria.statuses}
                                                onChange={v => setCriteria(prev => ({ ...prev, statuses: v }))}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('company_name')}</Label>
                                            </div>
                                            <MultiSelect
                                                placeholder={t('audience.company_placeholder')}
                                                options={filterOptions.companies.map(c => ({ label: c, value: c }))}
                                                selected={criteria.companyNames}
                                                onChange={v => setCriteria(prev => ({ ...prev, companyNames: v }))}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('special_tags')}</Label>
                                            </div>
                                            <Input
                                                placeholder={t('audience.tags_placeholder')}
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
                                                className="bg-white/5 border-white/10"
                                            />
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {criteria.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-bold uppercase tracking-tighter cursor-pointer hover:bg-emerald-500/20" onClick={() => setCriteria(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}>
                                                        {tag} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 border border-emerald-500/10 flex flex-col items-center justify-center space-y-2 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] relative z-10 opacity-60">{t('audience.target_audience')}</div>
                                            <div className="text-5xl font-bold text-emerald-500 tracking-tighter relative z-10 flex items-baseline gap-1">
                                                {counting ? (
                                                    <div className="h-10 w-24 bg-white/5 animate-pulse rounded-md" />
                                                ) : (
                                                    <>
                                                        <span>{targetCount ?? 0}</span>
                                                        <span className="text-xs font-medium text-emerald-500/50">{t('audience.persons')}</span>
                                                    </>
                                                )}
                                            </div>
                                            {targetCount === 0 && !counting && (
                                                <p className="text-[10px] text-amber-500/70 relative z-10 font-medium animate-pulse">{t('audience.select_filter')}</p>
                                            )}
                                            <div className="text-[10px] font-medium text-muted-foreground/40 italic relative z-10">{t('audience.realtime_telemetry')}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card className="glass-card">
                                <CardHeader className="bg-white/5 border-b border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold uppercase tracking-widest">{t('template_editor.title')}</CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground/60">
                                                {editTemplate ? t('template_editor.modify_desc', { name: editTemplate.name }) : t('template_editor.new_desc')}
                                            </CardDescription>
                                        </div>
                                        {editTemplate && (
                                            <Button variant="ghost" size="sm" onClick={clearTemplateForm} className="text-[10px] font-bold uppercase tracking-widest h-7">{t('template_editor.new_record')}</Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('template_editor.name_label')}</Label>
                                            <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder={t('template_editor.name_placeholder')} className="bg-white/5 border-white/10" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('template_editor.topic_label')}</Label>
                                            <Input value={templateTopic} onChange={e => setTemplateTopic(e.target.value)} placeholder={t('template_editor.topic_placeholder')} className="bg-white/5 border-white/10" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('template_editor.subject_label')}</Label>
                                        <Input value={templateSubject} onChange={e => setTemplateSubject(e.target.value)} placeholder={t('template_editor.subject_placeholder')} className="bg-white/5 border-white/10" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('template_editor.content_label')}</Label>
                                        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                                            <RichTextEditor
                                                content={templateContentHtml}
                                                onChange={setTemplateContentHtml}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between bg-white/[0.02] border-t border-white/5 py-4">
                                    <Button variant="outline" onClick={() => handlePreview(templateContentHtml)} disabled={rendering} className="h-9 border-white/10">
                                        {rendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4 text-emerald-500" />}
                                        {t('template_editor.render_test')}
                                    </Button>
                                    <Button onClick={handleSaveTemplate} disabled={templateSaving} className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 font-bold">
                                        {templateSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {editTemplate ? t('template_editor.update') : t('template_editor.archive')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="glass-card overflow-hidden">
                                <CardHeader className="bg-white/5 border-b border-white/5">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-bold uppercase tracking-widest">{t('library.title')}</CardTitle>
                                            <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase font-bold tracking-[0.2em] px-2">{t('library.validated')}</Badge>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Input
                                                placeholder={t('library.search_placeholder')}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="h-8 text-xs bg-white/5 border-white/10"
                                            />
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white/5 border-white/10">
                                                    <SelectValue placeholder={t('library.category_filter')} />
                                                </SelectTrigger>
                                                <SelectContent className="glass-card border-white/10">
                                                    {templateCategories.map((item: { key: string, label: string }) => (
                                                        <SelectItem key={item.key} value={item.key} className="text-xs uppercase tracking-tighter">
                                                            {item.label} {item.key !== 'ALL' ? `(${templates.filter(t_item => t_item.topic === item.key).length})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <ScrollArea className="h-[430px] pr-4">
                                        <div className="space-y-3">
                                            {filteredTemplates.length === 0 && (
                                                <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3 opacity-30">
                                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('library.no_records')}</span>
                                                </div>
                                            )}
                                            {filteredTemplates.map(templateRecord => (
                                                <div key={templateRecord.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
                                                    onClick={() => {
                                                        setEditTemplate(templateRecord);
                                                        setTemplateName(templateRecord.name);
                                                        setTemplateTopic(templateRecord.topic || '');
                                                        setTemplateSubject(templateRecord.subject || '');
                                                        setTemplateContentHtml(templateRecord.contentMjml || templateRecord.contentHtml || '');
                                                        setTemplatePreviewHtml(null);
                                                    }}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{templateRecord.name}</span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-amber-500 hover:bg-amber-500/10" title={t('library.apply')} onClick={(e) => {
                                                                e.stopPropagation();
                                                                applyTemplate(templateRecord);
                                                            }}>
                                                                <Check className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 hover:bg-emerald-500/10 ${templatePreviewId === templateRecord.id ? 'text-amber-400' : 'text-emerald-500'}`} title={t('library.preview')} onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTemplatePreview(templateRecord);
                                                            }} disabled={templateRendering && templatePreviewId !== templateRecord.id}>
                                                                {(templateRendering && templatePreviewId === templateRecord.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10" onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTemplate(templateRecord.id);
                                                            }}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[8px] uppercase font-bold tracking-widest px-2 py-0 bg-white/5 border-white/10 group-hover:border-emerald-500/20">{templateRecord.topic || t('library.all')}</Badge>
                                                        <span className="text-[10px] text-muted-foreground/40 font-medium">{new Date(templateRecord.updatedAt).toLocaleDateString(locale)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {templatePreviewHtml && (
                                <Card className="glass-card animate-in slide-in-from-right-4 duration-500">
                                    <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-white/5 bg-white/5">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">{t('library.preview')}</CardTitle>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => { setTemplatePreviewHtml(null); setTemplatePreviewId(null); }}>
                                            <EyeOff className="h-3.5 w-3.5 mr-1.5" /> {t('close')}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="w-full bg-white h-[500px] overflow-hidden">
                                            <iframe
                                                srcDoc={templatePreviewHtml ? DOMPurify.sanitize(templatePreviewHtml) : ''}
                                                className="w-full h-full border-0"
                                                title="template-archive-preview"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="glass-card">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                                <History className="w-5 h-5 text-emerald-500" /> {t('history.title')}
                            </CardTitle>
                            <CardDescription className="text-xs">{t('history.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-4">
                                    {announcements.length === 0 && !loading && (
                                        <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl opacity-30">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{t('history.empty')}</span>
                                        </div>
                                    )}
                                    {announcements.map((ann) => (
                                        <div key={ann.id} className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-base text-white tracking-tight uppercase">{ann.title}</span>
                                                    <Badge variant={ann.status === 'SENT' ? 'default' : 'secondary'} className={`text-[9px] font-bold uppercase tracking-widest px-2 ${ann.status === 'SENT' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white border-none'}`}>
                                                        {ann.status === 'SENT' ? t('history.sent') : t('history.draft')}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-muted-foreground/40" />
                                                        <span className="text-[11px] text-muted-foreground font-medium">{ann.subject}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3 h-3 text-muted-foreground/40" />
                                                        <span className="text-[11px] text-muted-foreground font-medium">{ann.author?.fullName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-muted-foreground/40" />
                                                        <span className="text-[11px] text-muted-foreground font-medium">{new Date(ann.createdAt).toLocaleDateString(locale)}</span>
                                                    </div>
                                                </div>
                                                {ann._count?.logs > 0 && (
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                                                            {t('history.terminal_delivered', { count: ann._count.logs })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {ann.status === 'DRAFT' && (
                                                    <Button variant="default" size="sm" onClick={() => handleBroadcast(ann.id)} disabled={broadcasting} className="px-4 bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                                                        <Send className="h-3.5 w-3.5 mr-2" /> {t('history.broadcast')}
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg border border-transparent hover:border-rose-500/20" onClick={() => handleDelete(ann.id)}>
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
        </motion.div>
    );
}
