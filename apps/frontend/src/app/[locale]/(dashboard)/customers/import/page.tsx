'use client';

export const dynamic = "force-dynamic";

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ImportCustomersPage() {
    const { toast } = useToast();
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<{ success: number; error: number; total: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setStats(null);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target?.result as string;
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                delimiter: ';', // CSV uses semicolon as delimiter
                complete: async (results) => {
                    try {
                        const mappedData = results.data
                            .map((row: any) => ({
                                externalContactId: row['(Do Not Modify) Contact']?.trim() || undefined,
                                companyName: row['Company Name']?.trim() || 'Bilinmeyen Firma',
                                customerNo: row['Client ID: ALLPLAN (Company Name) (Account)']?.trim() || undefined,
                                contractStatus: row['Müşteri Durumu']?.trim() || undefined,
                                subscriptionModel: row['Abonelik Modeli']?.trim() || undefined,
                                fullName: row[' Full Name']?.trim() || row['Full Name']?.trim() || '',
                                firstName: row['First Name']?.trim() || '',
                                middleName: row['Middle Name']?.trim() || undefined,
                                lastName: row['Last Name']?.trim() || '',
                                jobTitle: row['Job Title']?.trim() || undefined,
                                email: row['Email']?.trim() || '',
                                phone: row['Mobile Phone']?.trim() || undefined,
                                status: row['Status']?.trim() || 'Active',
                            }))
                            .filter((r: any) => r.email && r.firstName && r.lastName);

                        if (mappedData.length === 0) {
                            toast({ variant: 'destructive', title: '⚠️ Veri Bulunamadı', description: 'Geçerli bir veri bulunamadı. Lütfen CSV dosyasını kontrol edin.' });
                            setImporting(false);
                            return;
                        }

                        // For huge datasets we chunk. By default, let's chunk in bits of 500
                        const CHUNK_SIZE = 500;
                        let successCount = 0;
                        let errorCount = 0;
                        const totalBatches = Math.ceil(mappedData.length / CHUNK_SIZE);

                        for (let i = 0; i < totalBatches; i++) {
                            const batch = mappedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                            const res = await api.customers.import(batch);
                            successCount += res.successCount || 0;
                            errorCount += res.errorCount || 0;
                            setProgress(Math.round(((i + 1) / totalBatches) * 100));
                        }

                        setStats({
                            success: successCount,
                            error: errorCount,
                            total: mappedData.length
                        });

                    } catch (error: any) {
                        console.error('Import error:', error);
                        toast({ variant: 'destructive', title: '❌ İçe Aktarma Hatası', description: error.message });
                    } finally {
                        setImporting(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    toast({ variant: 'destructive', title: '❌ CSV Hatası', description: 'CSV dosyası çözümlenirken bir hata oluştu.' });
                    setImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        };

        reader.onerror = () => {
            toast({ variant: 'destructive', title: '❌ Dosya Hatası', description: 'Dosya okunurken bir hata oluştu. Muhtemelen izin veya format problemi var.' });
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        // Read file using Windows Turkish encoding to fix any corrupted characters automatically
        reader.readAsText(file, 'iso-8859-9');
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/customers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Müşterileri İçe Aktar</h1>
                    <p className="text-muted-foreground">CSV dosyası yükleyerek toplu müşteri kaydedin</p>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">CSV Dosyanızı Seçin</h3>
                        <p className="text-sm text-muted-foreground">
                            Dynamics veya onaylı formatta indirdiğiniz Contacts (Müşteriler) CSV dosyasını ekleyin.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={importing}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={importing} size="lg">
                        <Upload className="mr-2 h-4 w-4" />
                        {importing ? 'İşleniyor...' : 'Dosya Seç'}
                    </Button>
                </div>

                {importing && (
                    <div className="border-t p-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Yükleniyor...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {stats && !importing && (
                    <div className="border-t bg-muted/50 p-6">
                        <h4 className="font-medium mb-4">İçe Aktarma Özeti</h4>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="flex flex-col p-4 bg-background rounded-lg border">
                                <span className="text-sm text-muted-foreground">Toplam İşlenen</span>
                                <span className="text-2xl font-bold">{stats.total}</span>
                            </div>
                            <div className="flex flex-col p-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 rounded-lg border">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">Başarılı</span>
                                </div>
                                <span className="text-2xl font-bold mt-1">{stats.success}</span>
                            </div>
                            <div className="flex flex-col p-4 bg-red-500/10 border-red-500/20 text-red-600 rounded-lg border">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Hatalı</span>
                                </div>
                                <span className="text-2xl font-bold mt-1">{stats.error}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button asChild>
                                <Link href="/customers">Müşteri Listesine Dön</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
