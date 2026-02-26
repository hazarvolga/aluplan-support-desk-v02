'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User Data
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [customerNo, setCustomerNo] = useState('');
    const [contractStatus, setContractStatus] = useState('');
    const [accountStatus, setAccountStatus] = useState('');
    const [crmVerified, setCrmVerified] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [hotinfoData, setHotinfoData] = useState<any>(null);
    const [hotinfoUpdatedAt, setHotinfoUpdatedAt] = useState<string | null>(null);
    const [uploadingHotinfo, setUploadingHotinfo] = useState(false);

    // Auth password fields
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            // we use the auth me endpoint which returns core details
            const user = await api.auth.me();
            setFullName(user.fullName || '');
            setEmail(user.email || '');
            setRoles(user.role ? [user.role] : []);
            setAccountStatus(user.status || 'ACTIVE');

            if (user.customerProfile) {
                setHotinfoData(user.customerProfile.hotinfoData);
                setHotinfoUpdatedAt(user.customerProfile.hotinfoUpdatedAt || null);
            }

            // Get full details including customerProfile
            try {
                const fullDetails = await api.users.get(user.id);
                if (fullDetails?.customerProfile) {
                    const cp = fullDetails.customerProfile;
                    setPhone(cp.phoneNumber || '');
                    setCompanyName(cp.companyName || '');
                    setJobTitle(cp.jobTitle || '');
                    setIndustry(cp.industry || '');
                    setCustomerNo(cp.customerNo || '');
                    setContractStatus(cp.contractStatus || '-');
                    setCrmVerified(cp.crmVerified || false);
                } else if (fullDetails?.phone) {
                    setPhone(fullDetails.phone);
                }
            } catch (e) { /* ignore secondary load failure */ }

        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor!');
            return;
        }

        setSaving(true);
        try {
            const body: any = {
                fullName,
                phone,
                companyName,
                jobTitle,
                industry
            };

            if (password) body.password = password;

            await api.users.updateProfile(body);

            toast.success('Profil başarıyla güncellendi.');
            setPassword('');
            setConfirmPassword('');
            loadProfile(); // Refresh to see any auto-generated customerNo
        } catch (error: any) {
            console.error(error);
            toast.error('Güncelleme başarısız: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setSaving(false);
        }
    };

    const handleHotinfoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.hxl')) {
            toast.error('Lütfen geçerli bir .hxl dosyası yükleyin');
            return;
        }

        setUploadingHotinfo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/customers/me/hotinfo', formData);

            setHotinfoData(response.hotinfo);
            setHotinfoUpdatedAt(new Date().toISOString());
            toast.success('Sistem bilgileriniz başarıyla güncellendi');
        } catch (error: any) {
            toast.error('Dosya yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setUploadingHotinfo(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Profilim</h1>
                <p className="text-muted-foreground">
                    Kişisel bilgilerinizi ve güvenlik ayarlarınızı yönetin
                </p>
            </div>

            <Card className="relative overflow-hidden">
                {crmVerified && (
                    <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        CRM DOĞRULANDI
                    </div>
                )}
                <CardHeader>
                    <CardTitle>Kişisel Bilgiler</CardTitle>
                    <CardDescription>
                        Hesap bilgileriniz ({roles.map(r => r === 'admin' ? 'Yönetici' : r === 'agent' ? 'Temsilci' : r === 'customer' ? 'Müşteri' : r).join(', ')})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta (Değiştirilemez)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    disabled
                                    className="bg-muted cursor-not-allowed opacity-70"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Ad Soyad</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon Numarası</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+90 555 444 33 22"
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerNo">Müşteri No (Değiştirilemez)</Label>
                                <Input
                                    id="customerNo"
                                    value={customerNo || 'CRM kaydı yok'}
                                    disabled
                                    className="bg-muted cursor-not-allowed font-mono text-xs opacity-70"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Şirket Adı</Label>
                                <Input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Şirketinizin adı"
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Sektör</Label>
                                <Input
                                    id="industry"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="Faaliyet gösterdiğiniz sektör"
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Ünvan</Label>
                                <Input
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="Ünvanınız (örn: Satın Alma Müdürü)"
                                    disabled={crmVerified}
                                    className={crmVerified ? 'bg-muted/50 cursor-not-allowed' : ''}
                                />
                            </div>
                            <div className="space-y-2 flex flex-col justify-end">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Abonelik</Label>
                                        <div className="text-xs font-semibold bg-sky-500/10 text-sky-600 py-1 px-2 rounded border border-sky-500/20 text-center">
                                            {contractStatus === 'ACTIVE' ? 'Aktif' : contractStatus === 'EXPIRED' ? 'Süresi Dolmuş' : contractStatus}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Durum</Label>
                                        <div className="text-xs font-semibold bg-amber-500/10 text-amber-600 py-1 px-2 rounded border border-amber-500/20 text-center">
                                            {accountStatus === 'ACTIVE' ? 'Aktif' : accountStatus === 'INACTIVE' ? 'Pasif' : accountStatus === 'SUSPENDED' ? 'Askıya Alındı' : accountStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t mt-6">
                            <h3 className="text-lg font-medium mb-4">Şifre Değiştir</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Şifrenizi değiştirmek istemiyorsanız boş bırakın.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Yeni Şifre</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Yeni şifrenizi girin"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Şifreyi Doğrula</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Yeni şifrenizi tekrar girin"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-brand-500" />
                                Sistem Bilgileri (Hotinfo)
                            </CardTitle>
                            <CardDescription>
                                Allplan destek talepleriniz için gerekli sistem konfigürasyonu
                            </CardDescription>
                        </div>
                        {hotinfoData && (
                            <div className="flex flex-col items-end">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Son Güncelleme</div>
                                <div className="text-xs text-slate-400">{hotinfoUpdatedAt ? new Date(hotinfoUpdatedAt).toLocaleDateString('tr-TR') : '-'}</div>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {hotinfoData ? (
                        <div className="space-y-4">
                            {(() => {
                                const sr = (val: any) => {
                                    if (!val) return null;
                                    if (typeof val === 'object') {
                                        return val['@_version'] || val['@_name'] || val['#text'] || JSON.stringify(val);
                                    }
                                    return String(val);
                                };
                                return (
                                    <><div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Allplan Versiyon</div>
                                            <div className="text-sm font-semibold text-slate-200">
                                                {hotinfoData.allplanVersion}
                                                {hotinfoData.allplanEdition && <span className="text-xs text-slate-400 ml-1">({hotinfoData.allplanEdition})</span>}
                                            </div>
                                            {hotinfoData.allplanHotfix && <div className="text-[10px] text-brand-400 mt-0.5">Hotfix: {hotinfoData.allplanHotfix}</div>}
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">İşletim Sistemi</div>
                                            <div className="text-sm font-semibold text-slate-200">{hotinfoData.osVersion}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">İşlemci (CPU)</div>
                                            <div className="text-sm font-semibold text-slate-200 truncate">{hotinfoData.cpu || '-'}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">RAM</div>
                                            <div className="text-sm font-semibold text-slate-200">{hotinfoData.ram}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 md:col-span-2">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ekran Kartı / GPU</div>
                                            <div className="text-sm font-semibold text-slate-200">{sr(hotinfoData.gpu)}</div>
                                            <div className="flex gap-3 mt-1 flex-wrap">
                                                {hotinfoData.gpuDriverVersion && <span className="text-[10px] text-slate-400">Driver: {sr(hotinfoData.gpuDriverVersion)}</span>}
                                                {hotinfoData.openglVersion && <span className="text-[10px] text-slate-400">OpenGL: {sr(hotinfoData.openglVersion)}</span>}
                                                {hotinfoData.vram && <span className="text-[10px] text-slate-400">VRAM: {sr(hotinfoData.vram)}</span>}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ekran Çözünürlüğü</div>
                                            <div className="text-sm font-semibold text-slate-200">{sr(hotinfoData.screenResolution) || '-'}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Disk</div>
                                            <div className="text-sm font-semibold text-slate-200 truncate">{sr(hotinfoData.diskInfo) || '-'}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Lisans Tipi</div>
                                            <div className="text-sm font-semibold text-slate-200">{sr(hotinfoData.licenseType) || '-'}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">.NET Framework</div>
                                            <div className="text-sm font-semibold text-slate-200">{sr(hotinfoData.dotnetVersion) || '-'}</div>
                                        </div>
                                    </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ağ Bilgisi</div>
                                            <div className="text-sm font-semibold text-slate-200 truncate">{sr(hotinfoData.networkInfo) || '-'}</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Yüklü Modüller (max 10)</div>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {hotinfoData.installedModules?.length > 0 ? hotinfoData.installedModules.slice(0, 10).map((mod: string, i: number) => (
                                                    <span key={i} className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300">{sr(mod)}</span>
                                                )) : <span className="text-sm font-semibold text-slate-200">-</span>}
                                                {hotinfoData.installedModules?.length > 10 && <span className="text-[10px] text-slate-500">... +{hotinfoData.installedModules.length - 10} daha</span>}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                Sistem bilgileriniz güncel. Destek taleplerinizde bu bilgiler otomatik kullanılacaktır.
                            </div>

                            <div className="pt-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".hxl"
                                        onChange={handleHotinfoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        disabled={uploadingHotinfo}
                                    />
                                    <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800" disabled={uploadingHotinfo}>
                                        {uploadingHotinfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                                        Bilgileri Güncelle (.hxl Yükle)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-slate-200">Sistem Bilgisi Eksik</h3>
                                <p className="text-xs text-slate-400 max-w-[280px]">
                                    Destek ekibimizin size daha hızlı yardımcı olabilmesi için Allplan Hotinfo dosyanızı yüklemeniz önerilir.
                                </p>
                            </div>
                            <div className="relative w-full max-w-[200px]">
                                <input
                                    type="file"
                                    accept=".hxl"
                                    onChange={handleHotinfoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={uploadingHotinfo}
                                />
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={uploadingHotinfo}>
                                    {uploadingHotinfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                                    HXL Dosyası Yükle
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
