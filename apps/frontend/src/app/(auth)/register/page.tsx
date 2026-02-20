'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [lookupResult, setLookupResult] = useState<{ action: string, companyName: string | null } | null>(null);
    const [resetSent, setResetSent] = useState(false);

    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        customerNo: '',
        company: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.email) return;

        setLoading(true);
        try {
            const res = await api.auth.lookup(form.email);
            setLookupResult(res);

            if (res.action === 'NEW_MATCHED_COMPANY' && res.companyName) {
                setForm(prev => ({ ...prev, company: res.companyName! }));
            }

            setStep(2);
            setResetSent(false);
        } catch (err: any) {
            setError(err.message || 'E-posta kontrolü sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        if (form.customerNo.length < 5 || !form.customerNo.startsWith('C')) {
            setError('Müşteri No formatı geçersiz. Örnek: C300 XX XX XX');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${api.getBaseUrl()}/customers/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    customerNo: form.customerNo,
                    company: form.company,
                    phone: form.phone,
                    email: form.email,
                    password: form.password,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Kayıt sırasında bir hata oluştu.');
            }

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        setError('');
        try {
            await api.auth.forgotPassword(form.email);
            setResetSent(true);
        } catch (err: any) {
            setError(err.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
                <div className="max-w-md w-full mx-4 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
                    <p className="text-slate-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-[#0B0F19] to-[#0B0F19] py-12 px-4 sm:px-6">
            <div className="w-full max-w-md md:max-w-lg transition-all duration-500 ease-in-out">
                <div className="text-center mb-8">
                    <div className="h-12 w-12 mx-auto mb-4 bg-sky-500/10 rounded-xl border border-sky-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                        <div className="h-5 w-5 bg-sky-500 rounded-md" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Kayıt Ol</h1>
                    <p className="text-slate-400 mt-2 text-sm">Aluplan Destek Ekosistemine Katılın</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl relative">

                    {/* Top Glow Highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

                    <div className="p-6 sm:p-8 overflow-hidden">
                        {error && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={step === 1 ? handleLookup : handleSubmit} className="space-y-5">

                            {/* EMAIL STEP (Always visible, locked in step 2) */}
                            <div className={`transition-all duration-300 ${step === 2 ? 'opacity-50 pointer-events-none' : ''}`}>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    İş E-postanız <span className="text-sky-400">*</span>
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={step === 2}
                                    placeholder="ornek@firma.com"
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-sky-500/50 h-11"
                                />
                            </div>

                            {/* STEP 1 BUTTON */}
                            {step === 1 && (
                                <Button
                                    type="submit"
                                    disabled={loading || !form.email}
                                    className="w-full bg-sky-600 hover:bg-sky-500 text-white h-11 transition-all"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>Devam Et <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            )}

                            {/* STEP 2: CLAIM ACCOUNT STATE */}
                            {step === 2 && lookupResult?.action === 'CLAIM' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5 pt-2">
                                    {resetSent ? (
                                        <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center shadow-inner">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <h3 className="text-lg font-medium text-white mb-2">Şifreniz Gönderildi</h3>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                Yeni giriş şifreniz güvenlik amacıyla e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center shadow-inner">
                                            <CheckCircle2 className="h-10 w-10 text-sky-400 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                                            <h3 className="text-lg font-medium text-white mb-2">Sizi Tanıyoruz!</h3>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                Aluplan sisteminde firmanız ve size ait bir profil zaten bulunuyor. <br /><br />
                                                Giriş yapabilir veya doğrudan yeni bir şifre talep edip e-posta ile alabilirsiniz.
                                            </p>
                                        </div>
                                    )}

                                    {!resetSent ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button asChild className="w-full bg-white text-black hover:bg-slate-200 h-11 font-medium transition-colors">
                                                <Link href="/login">Giriş Yap</Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={loading}
                                                className="w-full bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 h-11 transition-all"
                                            >
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Şifremi Sıfırla'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button asChild className="w-full bg-white text-black hover:bg-slate-200 h-11 font-medium transition-colors">
                                            <Link href="/login">Giriş Ekranına Git</Link>
                                        </Button>
                                    )}

                                    <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-white h-11" onClick={() => { setStep(1); setLookupResult(null); setResetSent(false); }}>
                                        Farklı bir e-posta dene
                                    </Button>
                                </div>
                            )}

                            {/* STEP 2: NEW OR MATCHED COMPANY STATE */}
                            {step === 2 && (lookupResult?.action === 'NEW' || lookupResult?.action === 'NEW_MATCHED_COMPANY') && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5 pt-2">

                                    {lookupResult.action === 'NEW_MATCHED_COMPANY' && (
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                Sizi tanıdık! <b>{lookupResult.companyName}</b> ekibinin bir parçası olarak kaydınızı tamamlayın.
                                            </span>
                                        </div>
                                    )}

                                    {/* Kullanıcı Adı */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                            Kullanıcı Adı <span className="text-sky-400">*</span>
                                        </label>
                                        <Input
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder="sisteme_giris_adi"
                                            required
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                        />
                                    </div>

                                    {/* Ad & Soyad */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                Ad <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                placeholder="Adınız"
                                                required
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                Soyad <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                placeholder="Soyadınız"
                                                required
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Firma & Müşteri No */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                Firma <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="company"
                                                value={form.company}
                                                onChange={handleChange}
                                                placeholder="Firma adınız"
                                                required
                                                className={`bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50 ${lookupResult.action === 'NEW_MATCHED_COMPANY' ? 'border-emerald-500/40 text-emerald-100' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                Müşteri No <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="customerNo"
                                                value={form.customerNo}
                                                onChange={handleChange}
                                                placeholder="Örn: C300 00 00 00"
                                                required
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Şifre & Onay */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                Şifre <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="password"
                                                type="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                placeholder="••••••"
                                                required
                                                minLength={6}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                Şifreyi Doğrula
                                            </label>
                                            <Input
                                                name="confirmPassword"
                                                type="password"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••"
                                                required
                                                minLength={6}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => { setStep(1); setLookupResult(null); }}
                                            className="text-slate-400 hover:text-white hover:bg-white/5 h-11 px-4 transition-colors"
                                            disabled={loading}
                                        >
                                            Geri
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white h-11 transition-colors"
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Kaydı Tamamla'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Zaten hesabınız var mı?{' '}
                        <Link href="/login" className="text-sky-400 hover:text-sky-300 hover:underline font-medium transition-colors">
                            Giriş Yapın
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
