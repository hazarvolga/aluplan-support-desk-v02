'use client';

export const dynamic = "force-dynamic";

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft, FileText, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

interface ValidationResult {
    total: number;
    valid: number;
    missingClientNo: number;
    missingCompany: number;
    rows: any[];
}

export default function ImportCustomersPage() {
    const t = useTranslations('customers');
    const tc = useTranslations('common');
    const { toast } = useToast();
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<{ success: number; error: number; total: number } | null>(null);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setStats(null);
        setValidation(null);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target?.result as string;
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                delimiter: ';',
                complete: (results) => {
                    const mappedData = results.data
                        .map((row: any) => ({
                            externalContactId: row['(Do Not Modify) Contact']?.trim() || undefined,
                            companyName: row['Company Name']?.trim(),
                            customerNo: row['Client ID: ALLPLAN (Company Name) (Account)']?.trim(),
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
                        toast({ variant: 'destructive', title: '⚠️ ' + t('crm.log_empty'), description: t('import.analysis_complete') });
                        return;
                    }

                    const missingClientNo = mappedData.filter(r => !r.customerNo).length;
                    const missingCompany = mappedData.filter(r => !r.companyName).length;

                    setValidation({
                        total: mappedData.length,
                        valid: mappedData.length - Math.max(missingClientNo, missingCompany),
                        missingClientNo,
                        missingCompany,
                        rows: mappedData
                    });
                },
                error: (err: any) => {
                    console.error(err);
                    toast({ variant: 'destructive', title: '❌ ' + t('crm.error'), description: t('labels.unknown') });
                },
            });
        };

        reader.readAsText(file, 'iso-8859-9');
    };

    const startImport = async () => {
        if (!validation) return;

        setImporting(true);
        try {
            const dataToImport = validation.rows.map(r => ({
                ...r,
                companyName: r.companyName || t('labels.unknown')
            }));

            const CHUNK_SIZE = 200;
            let successCount = 0;
            let errorCount = 0;
            const totalBatches = Math.ceil(dataToImport.length / CHUNK_SIZE);

            for (let i = 0; i < totalBatches; i++) {
                const batch = dataToImport.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                const res = await api.customers.import(batch);
                successCount += res.successCount || 0;
                errorCount += res.errorCount || 0;
                setProgress(Math.round(((i + 1) / totalBatches) * 100));
            }

            setStats({
                success: successCount,
                error: errorCount,
                total: dataToImport.length
            });
            setValidation(null);

        } catch (error: any) {
            console.error('Import error:', error);
            toast({ variant: 'destructive', title: '❌ ' + t('import.title'), description: error.message });
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-12">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/customers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('import.title')}</h1>
                    <p className="text-muted-foreground">{t('import.subtitle')}</p>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                {!validation && !stats && (
                    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{t('import.select_file')}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm uppercase tracking-wider font-mono">
                                {t('import.file_hint')}
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
                        <Button onClick={() => fileInputRef.current?.click()} disabled={importing} size="lg" className="w-full sm:w-auto">
                            <Upload className="mr-2 h-4 w-4" />
                            {importing ? t('import.processing') : t('import.select_btn')}
                        </Button>
                    </div>
                )}

                {validation && !importing && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                <Info className="h-4 w-4 text-brand-500" />
                                {t('import.analysis_complete')}
                            </h3>
                            <span className="text-xs font-mono bg-muted p-1 px-2 rounded">{t('labels.record_count', { count: validation.total })}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-md border ${validation.missingClientNo > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className={`h-4 w-4 ${validation.missingClientNo > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
                                    <span className="text-xs font-bold uppercase">{t('import.missing_client_no')}</span>
                                </div>
                                <span className="text-2xl font-bold">{validation.missingClientNo}</span>
                            </div>
                            <div className={`p-4 rounded-md border ${validation.missingCompany > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className={`h-4 w-4 ${validation.missingCompany > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
                                    <span className="text-xs font-bold uppercase">{t('import.missing_company')}</span>
                                </div>
                                <span className="text-2xl font-bold">{validation.missingCompany}</span>
                            </div>
                        </div>

                        {(validation.missingClientNo > 0 || validation.missingCompany > 0) && (
                            <div className="bg-muted/50 p-4 rounded-md border border-dashed text-xs text-muted-foreground leading-relaxed">
                                <strong className="text-foreground block mb-1">{t('import.attention')}</strong>
                                {t('import.attention_desc')}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setValidation(null)}>{t('import.cancel')}</Button>
                            <Button className="flex-1" onClick={startImport}>{t('import.start_import')}</Button>
                        </div>
                    </div>
                )}

                {importing && (
                    <div className="p-8 space-y-6 text-center">
                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-xl animate-pulse">{progress}%</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">{t('import.writing_data')}</p>
                        </div>
                    </div>
                )}

                {stats && !importing && (
                    <div className="border-t bg-muted/50 p-6">
                        <h4 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            {t('import.summary_title')}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="flex flex-col p-4 bg-background rounded-lg border shadow-sm">
                                <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{t('labels.total')}</span>
                                <span className="text-2xl font-bold">{stats.total}</span>
                            </div>
                            <div className="flex flex-col p-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 rounded-lg border shadow-sm">
                                <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{t('labels.passed')}</span>
                                <span className="text-2xl font-bold">{stats.success}</span>
                            </div>
                            <div className="flex flex-col p-4 bg-red-500/10 border-red-500/20 text-red-600 rounded-lg border shadow-sm">
                                <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{t('labels.failed')}</span>
                                <span className="text-2xl font-bold">{stats.error}</span>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStats(null)}>{t('import.new_upload')}</Button>
                            <Button asChild className="flex-1">
                                <Link href="/customers">{t('import.go_to_customers')}</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
