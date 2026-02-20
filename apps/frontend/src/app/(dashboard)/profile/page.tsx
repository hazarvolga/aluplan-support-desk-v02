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
            // we will need to augment this later if phone is needed, 
            // but for now let's load what we can
            const user = await api.auth.me();
            setFullName(user.fullName || '');
            setEmail(user.email || '');
            setRoles(user.roles || []);

            // To get phone, we might need a dedicated GET /users/profile 
            // but assuming the backend returns it if we fetch /users/:id 
            // In the interest of saving an extra call, we leave phone blank initially or fetch by id
            try {
                const fullDetails = await api.users.get(user.id);
                if (fullDetails?.customerProfile?.phoneNumber) {
                    setPhone(fullDetails.customerProfile.phoneNumber);
                } else if (fullDetails?.phone) {
                    // Just in case user table has phone
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
            const body: any = { fullName };

            if (phone) body.phone = phone;
            if (password) body.password = password;

            await api.users.updateProfile(body);

            alert('Profil başarıyla güncellendi.');
            setPassword('');
            setConfirmPassword('');
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

            <Card>
                <CardHeader>
                    <CardTitle>Kişisel Bilgiler</CardTitle>
                    <CardDescription>
                        Hesap bilgileriniz ({roles.join(', ')})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta (Değiştirilemez)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted cursor-not-allowed"
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

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon Numarası</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+90 555 444 33 22"
                            />
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
