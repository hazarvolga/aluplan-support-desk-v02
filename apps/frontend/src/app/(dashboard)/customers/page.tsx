'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Upload, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
        middleName?: string;
        jobTitle?: string;
        contractStatus?: string;
        phoneNumber: string | null;
        crmVerified: boolean;
    };
}

type SortField = 'companyName' | 'fullName' | 'jobTitle' | 'email' | 'status' | 'createdAt' | 'contractStatus' | 'industry' | 'customerNo' | 'phoneNumber';
type SortOrder = 'asc' | 'desc';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleting, setDeleting] = useState(false);

    const loadCustomers = () => {
        setLoading(true);
        api.customers
            .list()
            .then((data) => {
                setCustomers(data);
                setSelectedIds([]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredAndSortedCustomers.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`${selectedIds.length} müşteriyi silmek istediğinize emin misiniz?`)) return;

        setDeleting(true);
        try {
            await api.customers.bulkDelete(selectedIds);
            alert('Seçilen müşteriler silindi.');
            loadCustomers();
        } catch (error: any) {
            console.error(error);
            alert('Silme işlemi başarısız: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setDeleting(false);
        }
    };

    const filteredAndSortedCustomers = useMemo(() => {
        let result = [...customers];

        // Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.fullName.toLowerCase().includes(lowerTerm) ||
                c.email.toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.companyName || '').toLowerCase().includes(lowerTerm) ||
                (c.customerProfile?.customerNo || '').toLowerCase().includes(lowerTerm)
            );
        }

        // Sort
        result.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortField) {
                case 'companyName':
                    aValue = a.customerProfile?.companyName || '';
                    bValue = b.customerProfile?.companyName || '';
                    break;
                case 'fullName':
                    aValue = a.fullName || '';
                    bValue = b.fullName || '';
                    break;
                case 'jobTitle':
                    aValue = a.customerProfile?.jobTitle || '';
                    bValue = b.customerProfile?.jobTitle || '';
                    break;
                case 'email':
                    aValue = a.email || '';
                    bValue = b.email || '';
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                case 'contractStatus':
                    aValue = a.customerProfile?.contractStatus || '';
                    bValue = b.customerProfile?.contractStatus || '';
                    break;
                case 'industry':
                    aValue = a.customerProfile?.industry || '';
                    bValue = b.customerProfile?.industry || '';
                    break;
                case 'customerNo':
                    aValue = a.customerProfile?.customerNo || '';
                    bValue = b.customerProfile?.customerNo || '';
                    break;
                case 'phoneNumber':
                    aValue = a.customerProfile?.phoneNumber || '';
                    bValue = b.customerProfile?.phoneNumber || '';
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [customers, searchTerm, sortField, sortOrder]);

    const isAllSelected = filteredAndSortedCustomers.length > 0 && selectedIds.length === filteredAndSortedCustomers.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
        );
    }

    const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
        <TableHead
            className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            </div>
        </TableHead>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Müşteriler</h1>
                    <p className="text-muted-foreground">Kayıtlı müşterilerin listesi</p>
                </div>
                <div className="flex items-center space-x-3">
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" disabled={deleting} onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting ? 'Siliniyor...' : `${selectedIds.length} Seçiliyi Sil`}
                        </Button>
                    )}
                    <Button asChild disabled={loading}>
                        <Link href="/customers/import">
                            <Upload className="mr-2 h-4 w-4" />
                            İçe Aktar
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="İsim, firma veya e-posta ara..."
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </TableHead>
                            <SortableHeader field="fullName">Ad Soyad</SortableHeader>
                            <SortableHeader field="jobTitle">Ünvan</SortableHeader>
                            <SortableHeader field="email">E-posta</SortableHeader>
                            <SortableHeader field="industry">Sektör</SortableHeader>
                            <SortableHeader field="companyName">Şirket Adı</SortableHeader>
                            <SortableHeader field="customerNo">Müşteri No</SortableHeader>
                            <SortableHeader field="contractStatus">Abonelik Modeli</SortableHeader>
                            <SortableHeader field="status">Müşteri Durumu</SortableHeader>
                            <SortableHeader field="phoneNumber">Cep Telefonu</SortableHeader>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                    Henüz kayıtlı müşteri yok veya arama sonucu bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedCustomers.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(c.id)}
                                            onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/customers/${c.id}`} className="hover:underline text-primary font-medium">
                                            {c.fullName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{c.customerProfile?.jobTitle || '-'}</TableCell>
                                    <TableCell>{c.email}</TableCell>
                                    <TableCell>{c.customerProfile?.industry || '-'}</TableCell>
                                    <TableCell className="font-medium">
                                        {c.customerProfile?.companyName || '-'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {c.customerProfile?.customerNo || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {c.customerProfile?.contractStatus ? (
                                            <Badge variant="outline">{c.customerProfile.contractStatus}</Badge>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {c.status === 'ACTIVE' ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                Aktif
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-500/30">
                                                {c.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{c.customerProfile?.phoneNumber || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
