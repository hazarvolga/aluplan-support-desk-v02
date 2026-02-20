'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Building, Edit, Save, Key } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function CustomerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable state mapping
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.customers.getById(id)
            .then(data => {
                setCustomer(data);
                if (data.customerProfile) {
                    setFormData({
                        firstName: data.customerProfile.firstName || '',
                        lastName: data.customerProfile.lastName || '',
                        companyName: data.customerProfile.companyName || '',
                        jobTitle: data.customerProfile.jobTitle || '',
                        phoneNumber: data.customerProfile.phoneNumber || '',
                        contractStatus: data.customerProfile.contractStatus || '',
                        customerNo: data.customerProfile.customerNo || ''
                    });
                }
            })
            .catch(err => {
                console.error(err);
                alert("Müşteri bulunamadı.");
                router.push('/customers');
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.customers.update(id, formData);
            alert('Müşteri başarıyla güncellendi.');
            window.location.reload(); // Quick refresh to catch top layout items
        } catch (error: any) {
            console.error(error);
            alert('Hata: ' + (error.message || 'Güncelleme başarısız.'));
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!confirm('Devam edilsin mi? Müşteriye yeni, rastgele bir şifre atanacaktır.')) return;
        try {
            const result = await api.customers.resetPassword(id);
            alert(`Şifre sıfırlandı!\n\nYeni Şifre: ${result.newPassword}\nE-posta: ${result.email}\n\nLütfen bu bilgiyi güvenli bir şekilde kullanıcıyla paylaşın.`);
        } catch (error: any) {
            console.error(error);
            alert('Hata: ' + (error.message || 'Şifre sıfırlama başarısız.'));
        }
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse">Yükleniyor...</div>;
    }

    if (!customer) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/customers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold tracking-tight">{customer.fullName}</h1>
                            <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {customer.status === 'ACTIVE' ? 'Aktif' : 'İnaktif'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{customer.email}</p>
                    </div>
                </div>
                <div>
                    <Button variant="outline" onClick={handleResetPassword}>
                        <Key className="mr-2 h-4 w-4" />
                        Şifreyi Sıfırla
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center space-x-2 text-primary">
                                <User className="h-5 w-5" />
                                <CardTitle>Kişisel Bilgiler</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ad</Label>
                                    <Input value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Soyad</Label>
                                    <Input value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Görev / Unvan</Label>
                                <Input value={formData.jobTitle} onChange={e => handleChange('jobTitle', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Telefon</Label>
                                <Input value={formData.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label className="text-muted-foreground text-xs">Hesap Oluşturulma</Label>
                                <p className="text-sm border p-2 rounded bg-muted/30">
                                    {new Date(customer.createdAt).toLocaleString('tr-TR')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center space-x-2 text-sky-500">
                                <Building className="h-5 w-5" />
                                <CardTitle>Kurumsal Bilgiler</CardTitle>
                            </div>
                            <CardDescription>CRM detayları ve proje kilitleri</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Firma Adı</Label>
                                <Input value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label>Müşteri Numarası</Label>
                                <div className="flex">
                                    <Input value={formData.customerNo} onChange={e => handleChange('customerNo', e.target.value)} className="font-mono bg-muted/10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Sözleşme / Profil Durumu</Label>
                                <Input value={formData.contractStatus} onChange={e => handleChange('contractStatus', e.target.value)} placeholder="Örn: Aktif, Askıda..." />
                            </div>

                            <div className="pt-8">
                                <Button type="submit" disabled={saving} className="w-full">
                                    {saving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                                    <Save className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
