'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const t = useTranslations('auth.reset_password');

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error(t('error_invalid_link'));
            router.push('/login');
        }
    }, [token, router, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error(t('error_missing_token'));
            return;
        }

        if (password.length < 8) {
            toast.error(t('error_length'));
            return;
        }

        if (password !== confirm) {
            toast.error(t('error_mismatch'));
            return;
        }

        setLoading(true);
        try {
            const result = await api.auth.resetPassword(token, password);
            toast.success(result.message || t('success_message'));
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message || t('error_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return null; // Will redirect via useEffect
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Password */}
            <div className="space-y-2 group">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors">
                        {t('new_password_label')}
                    </label>
                </div>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full h-11 px-4 bg-black border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-bold placeholder:text-white/20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors">
                    {t('confirm_password_label')}
                </label>
                <div className="relative">
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full h-11 px-4 bg-black border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-bold placeholder:text-white/20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        tabIndex={-1}
                    >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest text-[11px] rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center uppercase"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                    t('submit_btn')
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    const t = useTranslations('auth.reset_password');
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                            {t('title')}
                        </h1>
                        <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-medium">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                <div className="p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden shadow-2xl">
                    <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
