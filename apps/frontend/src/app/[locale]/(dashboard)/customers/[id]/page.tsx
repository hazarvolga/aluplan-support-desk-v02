'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Building, Edit, Save, Key, Monitor, Download } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { HotinfoGrid } from '@/components/ui/hotinfo-grid';

export default function CustomerProfilePage() {
    const { toast } = useToast();
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
                        customerNo: data.customerProfile.customerNo || '',
                        isVip: data.customerProfile.isVip || false,
                    });
                }
            })
            .catch(err => {
                if (process.env.NODE_ENV === 'development') console.error(err);
                toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: t('accounts.not_found') });
                router.push('/customers');
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const displayCustomerNo = customer?.customerProfile?.account?.account_number || formData.customerNo || '';
    const hasCrmAccountNumber = Boolean(customer?.customerProfile?.account?.account_number);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.customers.update(id, formData);
            toast({ title: '✅ ' + tc('success_title'), description: t('toasts.update_success') });
            window.location.reload(); // Quick refresh to catch top layout items
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: error.message || t('toasts.update_error') });
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!confirm(t('labels.reset_password_confirm'))) return;
        try {
            const result = await api.customers.resetPassword(id);
            toast({ title: '🔑 ' + t('labels.reset_password'), description: `${tc('success_title')}: ${result.email}` });
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: error.message || t('toasts.password_reset_error') });
        }
    };

    const handleDownloadHotinfo = async () => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/customers/${id}/hotinfo/download`;

            toast({ title: '📥 İndiriliyor', description: 'Hotinfo dosyası hazırlanıyor...' });

            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('İndirme başarısız oldu');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'hotinfo.hxl';
            if (contentDisposition && contentDisposition.includes('filename=')) {
                filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            toast({ variant: 'destructive', title: '❌ ' + tc('error_title'), description: t('toasts.download_error') });
        }
    };

    const t = useTranslations('customers');
    const tc = useTranslations('common');
    const { locale } = params as { locale: string; id: string };

    if (loading) {
        return <div className="p-8 text-center animate-pulse">{tc('loading')}</div>;
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
                                {customer.status === 'ACTIVE' ? t('labels.active') : t('labels.passive')}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{customer.email}</p>
                    </div>
                </div>
                <div>
                    <Button variant="outline" onClick={handleResetPassword}>
                        <Key className="mr-2 h-4 w-4" />
                        {t('labels.reset_password')}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center space-x-2 text-primary">
                                <User className="h-5 w-5" />
                                <CardTitle>{t('labels.personal_info')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('labels.first_name')}</Label>
                                    <Input value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('labels.last_name')}</Label>
                                    <Input value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('labels.job_title')}</Label>
                                <Input value={formData.jobTitle} onChange={e => handleChange('jobTitle', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('labels.phone')}</Label>
                                <Input value={formData.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label className="text-muted-foreground text-xs">{t('labels.created_at')}</Label>
                                <p className="text-sm border p-2 rounded bg-muted/30">
                                    {new Date(customer.createdAt).toLocaleString(locale)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center space-x-2 text-sky-500">
                                <Building className="h-5 w-5" />
                                <CardTitle>{t('labels.corporate_info')}</CardTitle>
                            </div>
                            <CardDescription>{t('crm.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('labels.company_name')}</Label>
                                <Input value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('labels.customer_no')}</Label>
                                <div className="flex">
                                    <Input
                                        value={displayCustomerNo}
                                        onChange={e => handleChange('customerNo', e.target.value)}
                                        disabled={hasCrmAccountNumber}
                                        className="font-mono bg-muted/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('labels.contract_status')}</Label>
                                <Input value={formData.contractStatus} onChange={e => handleChange('contractStatus', e.target.value)} />
                            </div>

                            <div className="flex items-center justify-between pt-2 pb-1 px-1 rounded-lg border border-amber-500/20 bg-amber-500/5">
                                <div className="flex items-center gap-2 px-2">
                                    <span className="text-amber-500 text-xs font-black uppercase tracking-widest">VIP</span>
                                    <span className="text-muted-foreground text-xs">{t('labels.vip_customer') || 'VIP Müşteri'}</span>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={!!formData.isVip}
                                    onClick={() => handleChange('isVip', Boolean(!formData.isVip))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 mr-2 ${formData.isVip ? 'bg-amber-500' : 'bg-white/10'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.isVip ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={saving} className="w-full">
                                    {saving ? t('labels.saving') : t('labels.save_all')}
                                    <Save className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </form>

            {customer.customerProfile?.hotinfoData && (
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="w-5 h-5 text-brand-500" />
                                    {t('labels.system_info')}
                                </CardTitle>
                                <CardDescription>
                                    {t('labels.hotinfo_data')}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownloadHotinfo} className="border-slate-700 hover:bg-slate-800">
                                <Download className="w-4 h-4 mr-2" />
                                {t('labels.download_hxl')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <HotinfoGrid data={customer.customerProfile.hotinfoData} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
