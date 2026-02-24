'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Mail, Shield, Settings as SettingsIcon,
    Zap, Save, Loader2, Key, Server,
    Globe, Clock, Terminal, Plus, Trash2, Edit, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

import { EmailTemplates } from './components/EmailTemplates';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any[]>([]);
    const [macros, setMacros] = useState<any[]>([]);

    // SMTP Form State
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');

    // IMAP Form State
    const [imapHost, setImapHost] = useState('');
    const [imapUser, setImapUser] = useState('');
    const [imapPass, setImapPass] = useState('');

    // Macro State
    const [macroName, setMacroName] = useState('');
    const [macroContent, setMacroContent] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [settingsData, macrosData] = await Promise.all([
                    api.settings.list(true),
                    api.macros.list()
                ]);
                setSettings(settingsData);
                setMacros(macrosData);

                // Populate form states
                setSmtpHost(settingsData.find(s => s.key === 'email.smtp.host')?.value || '');
                setSmtpPort(settingsData.find(s => s.key === 'email.smtp.port')?.value || '');
                setSmtpUser(settingsData.find(s => s.key === 'email.smtp.user')?.value || '');
                setImapHost(settingsData.find(s => s.key === 'email.imap.host')?.value || '');
                setImapUser(settingsData.find(s => s.key === 'email.imap.user')?.value || '');
            } catch (error: any) {
                toast.error('Veriler yüklenemedi: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveSetting = async (key: string, value: string, isSecret = false) => {
        setSaving(true);
        try {
            await api.settings.upsert({ key, value, isSecret });
            toast.success(`${key} başarıyla güncellendi`);
        } catch (error: any) {
            toast.error('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateMacro = async () => {
        if (!macroName || !macroContent) return;
        setSaving(true);
        try {
            const newMacro = await api.macros.create({ name: macroName, content: macroContent });
            setMacros([...macros, newMacro]);
            setMacroName('');
            setMacroContent('');
            toast.success('Macro oluşturuldu');
        } catch (error: any) {
            toast.error('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMacro = async (id: string) => {
        try {
            await api.macros.delete(id);
            setMacros(macros.filter(m => m.id !== id));
            toast.success('Macro silindi');
        } catch (error: any) {
            toast.error('Silme hatası: ' + error.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
                    <p className="text-muted-foreground mt-1">Platform genelindeki teknik ve operasyonel yapılandırmalar.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-full">
                    <Terminal className="h-3.5 w-3.5 text-brand-500" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-brand-500/80">KONTROL PANELİ v1.0</span>
                </div>
            </div>

            <Tabs defaultValue="email" className="space-y-6">
                <TabsList className="bg-slate-900/50 border border-white/5 p-1 gap-1">
                    <TabsTrigger value="email" className="data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-400 gap-2"><Mail className="h-4 w-4" /> E-Posta</TabsTrigger>
                    <TabsTrigger value="macros" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 gap-2"><Zap className="h-4 w-4" /> Macrolar</TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 gap-2"><Shield className="h-4 w-4" /> Güvenlik & API</TabsTrigger>
                </TabsList>

                {/* EMAIL SETTINGS */}
                <TabsContent value="email" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SMTP */}
                        <Card className="bg-card/20 backdrop-blur-xl border-white/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-4 w-4 text-brand-500" /> Giden Sunucu (SMTP)</CardTitle>
                                <CardDescription>Sistem bildirimleri için SMTP yapılandırması.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Host</Label>
                                    <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="bg-slate-900/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Port</Label>
                                        <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="bg-slate-900/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>User</Label>
                                        <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="bg-slate-900/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="bg-slate-900/50" placeholder="••••••••" />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-white/5 py-3">
                                <Button size="sm" onClick={() => {
                                    saveSetting('email.smtp.host', smtpHost);
                                    saveSetting('email.smtp.port', smtpPort);
                                    saveSetting('email.smtp.user', smtpUser);
                                    if (smtpPass) saveSetting('email.smtp.pass', smtpPass, true);
                                }} disabled={saving} className="bg-brand-600 ml-auto">Kaydet</Button>
                            </CardFooter>
                        </Card>

                        {/* IMAP */}
                        <Card className="bg-card/20 backdrop-blur-xl border-white/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Server className="h-4 w-4 text-amber-500" /> Gelen Sunucu (IMAP)</CardTitle>
                                <CardDescription>Mail-to-Ticket entegrasyonu için IMAP ayarları.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Host</Label>
                                    <Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} className="bg-slate-900/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>E-posta</Label>
                                    <Input value={imapUser} onChange={(e) => setImapUser(e.target.value)} className="bg-slate-900/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" value={imapPass} onChange={(e) => setImapPass(e.target.value)} className="bg-slate-900/50" placeholder="••••••••" />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-white/5 py-3">
                                <Button size="sm" onClick={() => {
                                    saveSetting('email.imap.host', imapHost);
                                    saveSetting('email.imap.user', imapUser);
                                    if (imapPass) saveSetting('email.imap.pass', imapPass, true);
                                }} disabled={saving} className="bg-brand-600 ml-auto">Kaydet</Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <Separator className="bg-white/5 my-8" />

                    <div className="space-y-6">
                        <EmailTemplates />
                    </div>
                </TabsContent>

                {/* MACROS */}
                <TabsContent value="macros" className="space-y-6">
                    <Card className="bg-card/20 border-white/5">
                        <CardHeader>
                            <CardTitle>Canned Responses (Macrolar)</CardTitle>
                            <CardDescription>Sık kullanılan yanıtları yönetin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Create New Macro */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl">
                                <div className="space-y-2">
                                    <Label>Macro Başlığı</Label>
                                    <Input value={macroName} onChange={(e) => setMacroName(e.target.value)} className="bg-slate-900/50" placeholder="örn: Hoşgeldiniz" />
                                </div>
                                <div className="md:col-span-2 space-y-2 flex flex-col">
                                    <Label>Yanıt İçeriği</Label>
                                    <div className="flex gap-4 items-end">
                                        <Textarea value={macroContent} onChange={(e) => setMacroContent(e.target.value)} className="bg-slate-900/50 min-h-[40px] flex-1" placeholder="Müşteriye gönderilecek metin..." />
                                        <Button onClick={handleCreateMacro} disabled={saving || !macroName || !macroContent} className="bg-amber-600"><Plus className="h-4 w-4 mr-2" /> Ekle</Button>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Macro List */}
                            <div className="grid grid-cols-1 gap-4">
                                {macros.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-900/30 border border-white/5 rounded-xl group hover:border-white/20 transition-all">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm">{m.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{m.content}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDeleteMacro(m.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY & API (Future placeholder for now, shows encryption status) */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="bg-card/20 border-white/5">
                        <CardHeader>
                            <CardTitle>Güvenlik & Şifreleme</CardTitle>
                            <CardDescription>Sistem güvenlik sertifikaları ve API anahtarları.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-green-500/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg"><Shield className="h-4 w-4 text-green-500" /></div>
                                    <div>
                                        <h4 className="font-bold text-sm">AES-256-GCM Aktif</h4>
                                        <p className="text-xs text-muted-foreground">Tüm hassas veriler at-rest şifrelenmektedir.</p>
                                    </div>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
