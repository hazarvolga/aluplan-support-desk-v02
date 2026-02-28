'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Lock, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SplitScreenGateway() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mfaPending, setMfaPending] = useState<{ userId: string; email: string } | null>(null);
    const [mfaToken, setMfaToken] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.auth.login(email, password);
            // @ts-ignore
            if (res.mfa_required) {
                // @ts-ignore
                setMfaPending({ userId: res.userId, email: res.email });
                return;
            }
            // @ts-ignore
            const { access_token } = res;
            localStorage.setItem('access_token', access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message ?? 'HATA: Giriş bilgileri reddedildi');
        } finally {
            setLoading(false);
        }
    }

    async function handleMfaVerify(e: React.FormEvent) {
        e.preventDefault();
        if (!mfaPending) return;
        setError('');
        setLoading(true);
        try {
            const { access_token } = await api.auth.mfa.verify(mfaPending.userId, mfaToken);
            localStorage.setItem('access_token', access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message ?? 'HATA: Geçersiz güvenlik kodu');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-400 overflow-hidden">

            {/* LEFT COLUMN: STATUS BOARD (60%) */}
            <div className="md:w-[60%] flex flex-col relative border-r border-white/10 overflow-hidden p-6 md:p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-20">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                                <Layers className="text-white h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                                ALUPLAN<span className="text-indigo-500 not-italic">.OS</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                SİSTEM_DURUMU: AKTİF
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[0.9] mb-6">
                            ALUPLAN<br />
                            <span className="text-slate-500 uppercase">Güvenli</span><br />
                            Erişim
                        </h2>
                        <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed mb-8">
                            Kurumsal destek ekosistemi ve akıllı bilgi bankası yönetim merkezi.
                        </p>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Veri Güvenliği</p>
                            <p className="text-xl font-bold tracking-tighter text-white">AES-256</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Aktif Node</p>
                            <p className="text-xl font-bold tracking-tighter text-white">IST-04</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Çalışma Süresi</p>
                            <p className="text-xl font-bold tracking-tighter text-emerald-500">99.99%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: ACCESS GATE (40%) */}
            <div className="md:w-[40%] bg-black flex flex-col justify-center p-6 md:p-12 relative z-20">
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center mb-4">
                        <Lock className="h-5 w-5 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">Yetki Doğrulama</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">Kimlik bilgilerinizi giriniz</p>
                </div>

                <div className="w-full max-w-sm mx-auto">
                    {!mfaPending ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">E-Posta Adresi</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="operator@aluplan.com"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Güvenlik Anahtarı</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-[16px] tracking-widest focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Bağlanıyor...' : 'Oturumu Başlat'}
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleMfaVerify} className="space-y-6">
                            <div className="space-y-4 text-center">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">MFA Doğrulama</h4>
                                <p className="text-xs text-slate-500">{mfaPending.email} adresine gönderilen kodu giriniz.</p>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={mfaToken}
                                    onChange={(e) => setMfaToken(e.target.value)}
                                    placeholder="000000"
                                    className="w-full px-4 py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white text-3xl text-center font-mono tracking-[0.5em] focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || mfaToken.length !== 6}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] disabled:opacity-50"
                            >
                                {loading ? 'Doğrulanıyor...' : 'Kodu Onayla'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] text-slate-600 uppercase tracking-widest">
                        <ShieldAlert className="h-3 w-3" />
                        Bağlantılar Aluplan Sec-Net üzerinden izlenmektedir
                    </div>
                </div>
            </div>
        </div>
    );
}
