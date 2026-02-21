'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            setRoles(user.roles || []);
            setAccountStatus(user.status || 'ACTIVE');

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
            alert('Şifreler eşleşmiyor!');
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

            alert('Profil başarıyla güncellendi.');
            setPassword('');
            setConfirmPassword('');
            loadProfile(); // Refresh to see any auto-generated customerNo
        } catch (error: any) {
            console.error(error);
            alert('Güncelleme başarısız: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setSaving(false);
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
                        Hesap bilgileriniz ({roles.join(', ')})
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
                                            {contractStatus}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Durum</Label>
                                        <div className="text-xs font-semibold bg-amber-500/10 text-amber-600 py-1 px-2 rounded border border-amber-500/20 text-center">
                                            {accountStatus}
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
        </div>
    );
}
