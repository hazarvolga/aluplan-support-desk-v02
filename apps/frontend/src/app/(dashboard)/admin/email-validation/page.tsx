'use client';

import { useState } from 'react';
import {
    Search, Mail, ShieldCheck, ShieldAlert,
    ShieldQuestion, Globe, Server, CheckCircle2,
    XCircle, AlertCircle, Loader2, Info
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function EmailValidationPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setResult(null);
        try {
            const data = await api.emailValidator.verify(email);
            setResult(data);
        } catch (err: any) {
            toast.error(err.message || 'Doğrulama hatası');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreBg = (score?: number) => {
        if (typeof score !== 'number') return 'bg-white/5 border-white/10';
        if (score >= 80) return 'bg-emerald-400/10 border-emerald-400/20';
        if (score >= 50) return 'bg-amber-400/10 border-amber-400/20';
        return 'bg-red-400/10 border-red-400/20';
    };

    const StatusBadge = ({ isValid, label }: { isValid: boolean; label: string }) => (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isValid ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-red-400/10 border-red-400/20 text-red-400'
            }`}>
            {isValid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {label}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">E-Posta Doğrulama</h1>
                <p className="text-muted-foreground">E-posta adreslerinin geçerliliğini, DNS kayıtlarını ve SMTP durumunu kontrol edin.</p>
            </div>

            {/* Search Section */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111111] shadow-2xl">
                <form onSubmit={handleVerify} className="flex gap-4">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="Doğrulanacak e-posta adresi (ör: user@example.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                    </button>
                </form>
            </div>

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Score Card */}
                    <div className={`col-span-1 p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreBg(result?.summary?.score)}`}>
                        <div className="relative h-32 w-32 mb-4">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                                <path
                                    className="stroke-white/5"
                                    strokeDasharray="100, 100"
                                    strokeWidth="3"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={getScoreColor(result?.summary?.score || 0).replace('text-', 'stroke-')}
                                    strokeDasharray={`${result?.summary?.score || 0}, 100`}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-black ${getScoreColor(result?.summary?.score || 0)}`}>{result?.summary?.score ?? 0}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Skor</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {result?.summary?.status === 'VALID' ? 'Güvenilir' : result?.summary?.status === 'RISKY' ? 'Riskli' : 'Geçersiz'}
                        </h3>
                        <p className="text-sm text-muted-foreground italic px-4">
                            {result?.intelligence?.isDisposable ? 'Geçici e-posta servisi tespit edildi.' :
                                result?.intelligence?.isRoleBased ? 'Kurumsal rol adresi (destek, bilgi vb.).' :
                                    'E-posta adresi kullanımı için uygun görünüyor.'}
                        </p>
                    </div>

                    {/* Data Points */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Syntax */}
                        <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-white">Sözdizimi</span>
                                </div>
                                <StatusBadge isValid={!!result?.syntax?.isValid} label={result?.syntax?.isValid ? 'OK' : 'HATA'} />
                            </div>
                            <p className="text-xs text-muted-foreground">E-posta formatı RFC standartlarına uygunluk kontrol edildi.</p>
                        </div>

                        {/* DNS */}
                        <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-white">DNS / MX Kaydı</span>
                                </div>
                                <StatusBadge isValid={!!result?.dns?.hasMx} label={result?.dns?.hasMx ? 'OK' : 'HATA'} />
                            </div>
                            <p className="text-xs text-muted-foreground">Alan adının e-posta sunucu kayıtları ({result?.dns?.mxRecords?.[0]?.exchange || 'Yok'}) doğrulandı.</p>
                        </div>

                        {/* SMTP */}
                        <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-white">SMTP Bağlantısı</span>
                                </div>
                                <StatusBadge isValid={!!result?.smtp?.canConnect} label={result?.smtp?.canConnect ? 'OK' : 'HATA'} />
                            </div>
                            <p className="text-xs text-muted-foreground">Sunucuya socket seviyesinde erişildi ve handshake denendi.</p>
                        </div>

                        {/* Intelligence */}
                        <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                        <Brain className="h-5 w-5" />
                                    </div>
                                    <span className="font-semibold text-white">Zeka (AI)</span>
                                </div>
                                <StatusBadge isValid={!result?.intelligence?.isDisposable} label={result?.intelligence?.isDisposable ? 'RİSKLİ' : 'TEMİZ'} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result?.intelligence?.isDisposable && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Disposable</span>}
                                {result?.intelligence?.isRoleBased && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Role-Based</span>}
                                {result?.dns?.isCatchAll && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Catch-All</span>}
                                {!result?.intelligence?.isDisposable && !result?.intelligence?.isRoleBased && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Personal/Work</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Card */}
            {!result && !loading && (
                <div className="p-12 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-50">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Info className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Sorgu Bekleniyor</h3>
                    <p className="text-muted-foreground max-w-sm">Yukarıdaki alana bir e-posta adresi girerek detaylı analiz başlatabilirsiniz.</p>
                </div>
            )}
        </div>
    );
}
