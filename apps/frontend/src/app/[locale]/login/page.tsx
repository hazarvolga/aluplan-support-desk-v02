'use client';

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';
import Image from 'next/image';
import { Terminal, ShieldAlert, Lock, CircleDot, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAuth } from '@/components/auth/role-guard';
import RequirementAccordion from '@/components/auth/requirement-accordion';

export default function LoginPage() {
    const t = useTranslations('auth');
    const tc = useTranslations('common');
    const { locale } = useParams() as { locale: string };
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return; // Prevent double-submit
        setError('');
        setLoading(true);
        try {
            await api.auth.login(email, password);

            // After login sets cookies, fetch user profile
            // Small delay to ensure cookies are persisted by browser
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const userData = await api.auth.me();
                login(userData as unknown as Parameters<typeof login>[0]);

                const hotinfoData = userData?.customerProfile?.hotinfoData as Record<string, unknown> | undefined;

                if (hotinfoData?.isAllplanUser && !userData?.customerProfile?.hotinfoUpdatedAt) {
                    router.push('/profile');
                } else {
                    router.push('/dashboard');
                }
            } catch (err) {
                // Fallback route - cookies are set, just navigate
                router.push('/dashboard');
            }

        } catch (err: any) {
            const errorMsg = err.message === 'common.session_expired'
                ? tc('session_expired')
                : (err.message ?? t('error_default'));
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-300 font-mono selection:bg-primary/30 selection:text-primary overflow-hidden">

            {/* LEFT COLUMN: STATUS BOARD (60%) */}
            <div className="md:w-[60%] flex flex-col relative border-r border-white/10 dark overflow-hidden p-6 md:p-12">
                {/* Subtle Brand Glow */}
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>

                {/* Header & Logo */}
                <div className="relative z-10 flex items-start justify-between mb-16">
                    <div>
                        <Image src="/logos/aluplan-logo-white.svg" alt="Aluplan Logo" width={180} height={40} className="mb-6 opacity-90" priority />
                        <h1 className="text-[12px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60 flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            {t('gateway_title')}
                        </h1>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <LanguageSwitcher />

                        <div className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                {t('system_status')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Broadcast Center */}
                <div className="relative z-10 mb-auto w-full max-w-2xl">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-5 ml-1">
                        {t('broadcast_title')}
                    </h2>

                    <RequirementAccordion locale={locale || 'tr'} />
                </div>

                {/* Footer Metrics & Partner Badge */}
                <div className="relative z-10 mt-12 flex justify-between items-end">
                    <div className="flex gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{t('db_nodes_label')}</p>
                            <p className="text-xl font-bold tracking-tighter">1,402</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{t('uptime_label')}</p>
                            <p className="text-xl font-bold tracking-tighter text-emerald-500">99.99%</p>
                        </div>
                    </div>

                    <div className="opacity-40 hover:opacity-100 transition-opacity flex flex-col items-end gap-2">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t('certified_label')}</span>
                        <Image src="/logos/Allplan-Authorized-Partner-svg-01.svg" alt="Allplan Partner" width={110} height={30} className="invert" />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: ACCESS GATE (40%) */}
            <div className="md:w-[40%] bg-black flex flex-col justify-center p-6 md:p-12 relative shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20 border-l border-white/5">

                {/* Security Context Header */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="h-12 w-12 border border-primary/20 bg-primary/5 flex items-center justify-center mb-4 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.1)]">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-[18px] font-bold uppercase tracking-widest text-white mb-2">{t('login_title')}</h2>
                    <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest leading-relaxed max-w-xs">
                        {t('access_gate_desc')}
                    </p>
                </div>

                {/* Mechanism Wrapper */}
                <div className="w-full max-w-[340px] mx-auto">

                    {/* Access mode tabs */}
                    <div className="flex mb-6 border-b border-white/10">
                        <div className="px-4 py-2 border-b-2 border-primary text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
                            <CircleDot className="h-3 w-3" />
                            {t('login_tab')}
                        </div>
                        <Link
                            href="/register"
                            className="px-4 py-2 text-muted-foreground hover:text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                            {t('request_tab')}
                        </Link>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('email_label')}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                data-testid="login-email"
                                placeholder={t('email_placeholder')}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 text-white text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex justify-between">
                                <span>{t('password_label')}</span>
                                <Link href="/register" className="opacity-60 hover:opacity-100 hover:text-primary transition-colors">
                                    {t('recovery_link')}
                                </Link>
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                data-testid="login-password"
                                placeholder={t('password_placeholder')}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 text-white text-[16px] tracking-[0.3em] font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                            />
                        </div>

                        {error && (
                            <div data-testid="error-message" className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 animate-in fade-in">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="login-submit"
                            className="w-full mt-8 py-3.5 px-4 border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/80 text-primary text-[11px] uppercase font-bold tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">{t('submitting')}</span>
                            ) : (
                                <>
                                    <span>{t('submit_button')}</span>
                                    <CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </button>

                    </form>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Link
                            href="/register"
                            className="border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            {t('forgot_password_link')}
                        </Link>
                        <Link
                            href="/register"
                            className="border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            {t('register_link')}
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] text-muted-foreground/40 uppercase tracking-widest">
                        <ShieldAlert className="h-3 w-3" />
                        {t('security_tagline')}
                    </div>
                </div>
            </div>

        </div>
    );
}
