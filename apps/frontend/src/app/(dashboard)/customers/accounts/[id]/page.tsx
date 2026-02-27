'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Building2, Globe, MapPin, Users, ArrowLeft, ExternalLink, Calendar, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function AccountDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            api.crm.getAccount(params.id as string)
                .then(setAccount)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
        );
    }

    if (!account) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Şirket bulunamadı.</h2>
                <Button variant="link" onClick={() => router.back()}>Geri Dön</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {account.name}
                        {account.crmVerified && (
                            <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30">CRM</Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Şirket Detayları</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Cards */}
                <Card className="lg:col-span-1 border-slate-200/60 dark:border-slate-800/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Genel Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Web Sitesi</p>
                                {account.website ? (
                                    <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        {account.website} <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : <p className="text-sm">-</p>}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Sektör</p>
                                <p className="text-sm">{account.industry || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Adres</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {account.address || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Sisteme Giriş</p>
                                <p className="text-sm">{new Date(account.createdAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contacts Table */}
                <Card className="lg:col-span-2 border-slate-200/60 dark:border-slate-800/60">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Kayıtlı Kişiler</CardTitle>
                                <CardDescription>Bu şirkete bağlı tüm müşteri kayıtları</CardDescription>
                            </div>
                            <Badge variant="outline" className="gap-1 px-3 py-1">
                                <Users className="h-3 w-3" />
                                {account.customers?.length || 0} Kişi
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead>Ünvan</TableHead>
                                    <TableHead>E-posta</TableHead>
                                    <TableHead>Durum</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!account.customers || account.customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            Bu şirket için kayıtlı kişi bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    account.customers.map((c: any) => (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <Link href={`/customers/${c.userId}`} className="flex items-center gap-2 hover:underline font-medium text-primary">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {c.user?.fullName || `${c.firstName} ${c.lastName}`}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-sm">{c.jobTitle || '-'}</TableCell>
                                            <TableCell className="text-sm font-mono text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {c.user?.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {c.user?.status === 'ACTIVE' ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-2 py-0 h-5">Aktif</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="px-2 py-0 h-5">{c.user?.status}</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
