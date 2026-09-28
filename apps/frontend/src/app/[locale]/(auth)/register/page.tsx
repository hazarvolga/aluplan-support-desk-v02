'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations('auth.register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [lookupResult, setLookupResult] = useState<{ action: string, companyName: string | null, errorMessage?: string } | null>(null);
    const [resetSent, setResetSent] = useState(false);

    // Products fetched from backend
    const [products, setProducts] = useState<any[]>([]);
    const [usedProducts, setUsedProducts] = useState<string[]>([]);

    useEffect(() => {
        // Fetch products on mount
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${api.getBaseUrl()}/products`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error('Failed to load products');
            }
        };
        fetchProducts();
    }, []);

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
        isAllplanUser: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
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

            // Always advance to step 2 — each action has its own UI block
            setStep(2);
            setResetSent(false);
        } catch (err: any) {
            setError(err.message || t('error_email_lookup'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError(t('error_password_mismatch'));
            return;
        }

        if (form.isAllplanUser) {
            if (form.customerNo.length < 5 || !form.customerNo.startsWith('C')) {
                setError(t('error_customer_no'));
                return;
            }
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
                    usedProducts: usedProducts,
                    isAllplanUser: form.isAllplanUser,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t('error_register_failed'));
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || t('error_default'));
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        setError('');
        try {
            await api.auth.resendVerification(form.email);
            setResetSent(true);
        } catch (err: any) {
            setError(err.message || t('error_reset_failed'));
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
            setError(err.message || t('error_reset_failed'));
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
                    <h2 className="text-2xl font-bold text-white mb-2">{t('success_title')}</h2>
                    <p className="text-slate-400">{t('success_desc')}</p>
                    <p className="text-sm mt-3 text-emerald-500 font-medium">{t('success_hint')}</p>
                    <div className="mt-8">
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Link href="/login">{t('back_to_login')}</Link>
                        </Button>
                    </div>
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
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
                    <p className="text-slate-400 mt-2 text-sm">{t('subtitle')}</p>
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
                                    {t('email_label')} <span className="text-sky-400">*</span>
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={step === 2}
                                    placeholder={t('email_placeholder')}
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
                                        <>{t('continue_btn')} <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            )}

                            {/* STEP 2: CLAIM ACCOUNT STATE */}
                            {step === 2 && lookupResult?.action === 'CLAIM' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5 pt-2">
                                    {resetSent ? (
                                        <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center shadow-inner">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <h3 className="text-lg font-medium text-white mb-2">{t('reset_sent_title')}</h3>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {t('reset_sent_desc')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center shadow-inner">
                                            <CheckCircle2 className="h-10 w-10 text-sky-400 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                                            <h3 className="text-lg font-medium text-white mb-2">{t('recognized_title')}</h3>
                                            <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('recognized_desc') }} />
                                        </div>
                                    )}

                                    {!resetSent ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button asChild className="w-full bg-white text-black hover:bg-slate-200 h-11 font-medium transition-colors">
                                                <Link href="/login">{t('login_btn')}</Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={loading}
                                                className="w-full bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 h-11 transition-all"
                                            >
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('reset_btn')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button asChild className="w-full bg-white text-black hover:bg-slate-200 h-11 font-medium transition-colors">
                                            <Link href="/login">{t('back_to_login')}</Link>
                                        </Button>
                                    )}

                                    <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-white h-11" onClick={() => { setStep(1); setLookupResult(null); setResetSent(false); }}>
                                        {t('different_email')}
                                    </Button>
                                </div>
                            )}

                            {/* STEP 2: DELETED ACCOUNT STATE */}
                            {step === 2 && lookupResult?.action === 'DELETED' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5 pt-2">
                                    <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center shadow-inner">
                                        <Loader2 className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-white mb-2">{t('deleted_title')}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {t('deleted_desc')}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        className="w-full bg-amber-600 hover:bg-amber-500 text-white h-11"
                                        onClick={() => { setLookupResult({ ...lookupResult, action: 'NEW' }); }}
                                    >
                                        {t('deleted_btn')}
                                    </Button>
                                    <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-white h-11" onClick={() => { setStep(1); setLookupResult(null); }}>
                                        {t('different_email')}
                                    </Button>
                                </div>
                            )}

                            {/* STEP 2: INACTIVE ACCOUNT STATE */}
                            {step === 2 && lookupResult?.action === 'INACTIVE' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5 pt-2">
                                    <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center shadow-inner">
                                        <CheckCircle2 className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-white mb-2">{t('inactive_title')}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {t('inactive_desc')}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11"
                                        onClick={handleResendVerification}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('inactive_btn')}
                                    </Button>
                                    <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-white h-11" onClick={() => { setStep(1); setLookupResult(null); }}>
                                        {t('different_email')}
                                    </Button>
                                </div>
                            )}

                            {/* STEP 2: CRM REJECTED STATE */}
                            {step === 2 && lookupResult?.action === 'CRM_REJECTED' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-5 pt-2">
                                    <div className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center shadow-inner space-y-3">
                                        <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{t('crm_rejected_title')}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {t('crm_rejected_desc')}
                                        </p>
                                        <div className="pt-1 border-t border-orange-500/20">
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {t('crm_rejected_cta')}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`mailto:${t('crm_rejected_sales_email')}`}
                                        className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {t('crm_rejected_sales_btn')}
                                    </a>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-slate-400 hover:text-white h-11"
                                        onClick={() => { setStep(1); setLookupResult(null); setError(''); }}
                                    >
                                        {t('crm_rejected_try_different')}
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
                                                {t('matched_company_prefix')} <b>{lookupResult.companyName}</b> {t('matched_company_suffix')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Kullanıcı Adı */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                            {t('username_label')} <span className="text-sky-400">*</span>
                                        </label>
                                        <Input
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder={t('username_placeholder')}
                                            required
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                        />
                                    </div>

                                    {/* Ad & Soyad */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                {t('firstname_label')} <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                placeholder={t('firstname_placeholder')}
                                                required
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                {t('lastname_label')} <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                placeholder={t('lastname_placeholder')}
                                                required
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Telefon Numarası */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                            {t('phone_label')} <span className="text-sky-400">*</span>
                                        </label>
                                        <Input
                                            name="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder={t('phone_placeholder')}
                                            required
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                        />
                                    </div>

                                    {/* Products Selection */}
                                    {products.length > 0 && (
                                        <div className="pt-2 pb-2">
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                {t('products_label')}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {products.map((p) => (
                                                    <label key={p.id} className="flex items-center gap-2 bg-black/20 border border-white/5 hover:border-sky-500/50 p-2 rounded-lg cursor-pointer transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-600 bg-black/50 text-sky-500 focus:ring-sky-500/50"
                                                            checked={usedProducts.includes(p.name)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setUsedProducts([...usedProducts, p.name]);
                                                                } else {
                                                                    setUsedProducts(usedProducts.filter(x => x !== p.name));
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm text-slate-300">{p.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Allplan Checkbox */}
                                    <div className="pt-2">
                                        <label className="flex items-start gap-4 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 cursor-pointer transition-all hover:bg-sky-500/10 active:scale-[0.98]">
                                            <div className="flex items-center h-5 pt-1">
                                                <input
                                                    type="checkbox"
                                                    name="isAllplanUser"
                                                    checked={form.isAllplanUser}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 rounded-md border-sky-500/30 bg-black/50 text-sky-500 focus:ring-sky-500/50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-sm font-medium text-sky-400">
                                                    {t('allplan_user_label')}
                                                </span>
                                                <span className="block text-xs text-slate-400 leading-normal">
                                                    {t('allplan_user_desc')}
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Firma & Müşteri No */}
                                    <div className={`grid ${form.isAllplanUser ? 'sm:grid-cols-2' : 'grid-cols-1'} gap-4 transition-all duration-300`}>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                {t('company_label')} <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="company"
                                                value={form.company}
                                                onChange={handleChange}
                                                placeholder={t('company_placeholder')}
                                                required
                                                className={`bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50 ${lookupResult.action === 'NEW_MATCHED_COMPANY' ? 'border-emerald-500/40 text-emerald-100' : ''}`}
                                            />
                                        </div>
                                        {form.isAllplanUser && (
                                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                    {t('customer_no_label')} <span className="text-sky-400">*</span>
                                                </label>
                                                <Input
                                                    name="customerNo"
                                                    value={form.customerNo}
                                                    onChange={handleChange}
                                                    placeholder={t('customer_no_placeholder')}
                                                    required
                                                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Şifre & Onay */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                {t('password_label')} <span className="text-sky-400">*</span>
                                            </label>
                                            <Input
                                                name="password"
                                                type="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                placeholder={t('password_placeholder')}
                                                required
                                                minLength={6}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                                {t('confirm_password_label')}
                                            </label>
                                            <Input
                                                name="confirmPassword"
                                                type="password"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                placeholder={t('password_placeholder')}
                                                required
                                                minLength={6}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 h-11 focus-visible:ring-sky-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => { setStep(1); setLookupResult(null); }}
                                            className="text-slate-400 hover:text-white hover:bg-white/5 h-11 px-4 transition-colors"
                                            disabled={loading}
                                        >
                                            {t('back_btn')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white h-11 transition-colors"
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('submit_btn')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        {t('already_have_account')}{' '}
                        <Link href="/login" className="text-sky-400 hover:text-sky-300 hover:underline font-medium transition-colors">
                            {t('login_link')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
