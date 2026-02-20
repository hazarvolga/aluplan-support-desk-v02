'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CustomerItem {
    id: string;
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    customerProfile?: {
        customerNo: string;
        companyName: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        crmVerified: boolean;
    };
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.customers
            .list()
            .then((data) => setCustomers(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Müşteriler</h1>
                <p className="text-muted-foreground">Kayıtlı müşterilerin listesi</p>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Müşteri No</TableHead>
                            <TableHead>Firma</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>CRM Doğrulama</TableHead>
                            <TableHead>Kayıt Tarihi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    Henüz kayıtlı müşteri yok.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.fullName}</TableCell>
                                    <TableCell>
                                        <code className="px-2 py-1 bg-muted rounded text-sm">
                                            {c.customerProfile?.customerNo ?? '-'}
                                        </code>
                                    </TableCell>
                                    <TableCell>{c.customerProfile?.companyName ?? '-'}</TableCell>
                                    <TableCell>{c.email}</TableCell>
                                    <TableCell>{c.customerProfile?.phoneNumber ?? '-'}</TableCell>
                                    <TableCell>
                                        {c.customerProfile?.crmVerified ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                Doğrulandı
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                                                Bekliyor
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
