'use client';

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Upload, FileText, CheckCircle2,
    XCircle, Clock, RefreshCw, Database,
    Info, ShieldCheck, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function KnowledgePoolUploadPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'FAILED'>('IDLE');
    const [telemetry, setTelemetry] = useState<string[]>([]);

    const addTelemetry = (msg: string) => {
        setTelemetry(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file && !fileName) {
            setFileName(file.name.split('.')[0]);
        }
    };

    const handleUpload = async () => {
        if (!fileName || !selectedFile) {
            toast({ title: 'Hata', description: 'Lütfen dosya adını ve dosyayı seçin.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        setUploadStatus('UPLOADING');
        addTelemetry('UPLOAD_SEQUENCE_INITIATED');
        addTelemetry(`SOURCE_DETECTED: ${selectedFile.name.toUpperCase()}`);

        try {
            addTelemetry('UPLOADING_TO_QUANTUM_GATEWAY...');
            await api.pool.upload(fileName, selectedFile);

            setUploadStatus('SUCCESS');
            addTelemetry('DATA_TRANSFER_COMPLETE');
            addTelemetry('INDEXING_NEURAL_NODES...');

            toast({ title: 'Başarılı', description: 'Dosya yüklendi ve indeksleme başlatıldı.' });

            setTimeout(() => {
                router.push('/knowledge-pool');
            }, 2000);
        } catch (err: any) {
            setUploadStatus('FAILED');
            addTelemetry(`CRITICAL_ERROR: ${err.message.toUpperCase()}`);
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">BACK_TO_POOL</span>
                </Button>
                <div className="text-right">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-400/5 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5">
                        SECURE_GATEWAY_ACTIVE
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Upload Area */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter text-foreground">
                            INGEST_DATASET
                        </h1>
                        <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-wide">
                            Integrate external intelligence into the neural grid.
                        </p>
                    </div>

                    <Card className="bg-black/40 border-white/5 backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> STREAM_CONFIGURATION
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">IDENTIFIER_NAME</Label>
                                    <Input
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        placeholder="Enter dataset name..."
                                        className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">DATA_STREAM_SOURCE</Label>
                                    <label
                                        htmlFor="file-upload"
                                        className={`
                                            relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer
                                            ${selectedFile ? 'border-primary/40 bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
                                        `}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.csv,.md,.txt"
                                        />
                                        <div className={`p-4 rounded-full ${selectedFile ? 'bg-primary/20' : 'bg-white/5'}`}>
                                            {selectedFile ? (
                                                <FileText className="h-8 w-8 text-primary animate-pulse" />
                                            ) : (
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-foreground px-4">
                                                {selectedFile ? selectedFile.name : 'Click or drag to drop data'}
                                            </p>
                                            <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">
                                                {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'PDF, CSV, MD, TXT (MAX 50MB)'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={loading || !selectedFile}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-xl font-bold tracking-[0.1em] text-xs uppercase group overflow-hidden relative"
                            >
                                {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                <span className="relative z-10">{loading ? 'STREAMS_SYNCING...' : 'INITIATE_INDEXING_SEQUENCE'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <ShieldCheck className="h-4 w-4 text-emerald-500/80" />
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Encryption</p>
                            <p className="text-xs font-mono">AES-256_ACTIVE</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <Info className="h-4 w-4 text-blue-500/80" />
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Compliance</p>
                            <p className="text-xs font-mono">GDPR_COMPLIANT</p>
                        </div>
                    </div>
                </div>

                {/* Status & Telemetry Sidebar */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-black/30 border-white/5 backdrop-blur-xl h-full flex flex-col">
                        <CardHeader className="border-b border-white/5 py-4">
                            <CardTitle className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground flex items-center justify-between">
                                LIVE_SYSTEM_TELEMETRY
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                            {/* Upload Status Visualization */}
                            <div className="p-6 border-b border-white/5 space-y-6 bg-white/[0.01]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase text-muted-foreground/60">SEQUENCE_STATUS:</span>
                                    <Badge className={`
                                        rounded-none px-2 py-0.5 text-[10px] font-mono tracking-tighter
                                        ${uploadStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            uploadStatus === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                uploadStatus === 'UPLOADING' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-white/5 text-muted-foreground border-white/10'}
                                    `}>
                                        {uploadStatus}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-1 bg-white/5 overflow-hidden">
                                        <div
                                            className={`h-full bg-primary transition-all duration-1000 ${loading ? 'w-2/3 animate-pulse' : uploadStatus === 'SUCCESS' ? 'w-full' : 'w-0'}`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-right font-mono text-muted-foreground/40">SYSTEM_BUS_LOAD: 12.4%</p>
                                </div>
                            </div>

                            {/* Logs Terminal */}
                            <div className="p-6 flex-1 font-mono text-[10px] space-y-3 overflow-y-auto bg-black/40">
                                {telemetry.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-3">
                                        <div className="h-px w-12 bg-muted-foreground" />
                                        <p className="uppercase tracking-[0.2em] italic">WAITING_FOR_SEQUENCE</p>
                                        <div className="h-px w-12 bg-muted-foreground" />
                                    </div>
                                ) : (
                                    telemetry.map((log, i) => (
                                        <div key={i} className={`
                                            flex gap-2 transition-all duration-300
                                            ${i === 0 ? 'text-primary' : 'text-muted-foreground/60'}
                                        `}>
                                            <span className="shrink-0">{'>'}</span>
                                            <span className="break-all">{log}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 border border-primary/10 bg-primary/5 rounded-xl">
                        <div className="flex gap-4 items-start">
                            <div className="h-8 w-8 bg-primary/10 rounded border border-primary/20 flex items-center justify-center shrink-0">
                                <Database className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">Neural Indexing Aware</h4>
                                <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">
                                    Our indexing engine uses a hybrid architecture (RAG + Graph) to ensure zero-loss information retrieval for your support agents.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
