'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('auth.verify_email');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState(t('default_loading'));
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage(t('default_error_invalid'));
            return;
        }

        api.auth.verifyEmail(token)
            .then((res) => {
                setStatus('success');
                setMessage(res.message || t('default_success'));
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || t('default_error_failed'));
            });
    }, [token, t]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Card className="glass-card border-white/5 p-8 text-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {status === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="h-20 w-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{t('loading_title')}</h2>
                                <p className="text-muted-foreground font-medium">{message}</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="h-20 w-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{t('success_header')}</h2>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    {message}
                                </p>
                                <div className="pt-4">
                                    <Button asChild className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-500/20 group">
                                        <Link href="/login">
                                            {t('login_btn')} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="h-20 w-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                                    <XCircle className="h-10 w-10 text-rose-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{t('error_header')}</h2>
                                <p className="text-rose-400/80 font-medium leading-relaxed">
                                    {message}
                                </p>
                                <div className="pt-4 space-y-3">
                                    <Button asChild variant="outline" className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl">
                                        <Link href="/support">{t('support_btn')}</Link>
                                    </Button>
                                    <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-widest">
                                        <Link href="/">{t('home_btn')}</Link>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Branding footer */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">{t('brand')}</span>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
