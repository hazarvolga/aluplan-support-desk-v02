'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { access_token } = await api.auth.login(email, password);
            localStorage.setItem('access_token', access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message ?? 'AUTH_FAILURE: Credentials not recognized');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 flex-col font-mono text-slate-300 selection:bg-primary/30 selection:text-primary">

            {/* Top Bar for context */}
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-white/10 flex items-center justify-between px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-black/50">
                <Link href="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
                    <Terminal className="h-3 w-3" /> RETURN_TO_ROOT
                </Link>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACCESS_NODE_SECURE
                    </span>
                </div>
            </div>

            <div className="w-full max-w-sm animate-fade-in">

                {/* System Warning Header */}
                <div className="border border-amber-500/30 bg-amber-500/5 p-3 mb-6 flex gap-3 text-amber-500">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest mb-1 leading-tight">RESTRICTED_ACCESS</h2>
                        <p className="text-[9px] text-amber-500/70 leading-relaxed uppercase tracking-tighter">
                            Authorized partners & internal engineers only. All access attempts are logged and monitored.
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="border border-white/10 bg-black/40 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="h-8 w-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-[14px] font-bold uppercase tracking-widest text-foreground leading-tight">ACCESS_PORTAL</h1>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Please authenticate to continue</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">IDENTITY_TOKEN [EMAIL]</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="operator@aluplan.com"
                                className="w-full px-3 py-2 border border-white/10 bg-slate-950 text-foreground text-xs font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">VERIFICATION_KEY [PASSWORD]</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-white/10 bg-slate-950 text-foreground text-[14px] tracking-[0.2em] font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="border border-rose-500/30 bg-rose-500/5 px-3 py-2 mt-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 mt-6 border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] uppercase font-bold tracking-widest transition-colors disabled:opacity-50 flex justify-center"
                        >
                            {loading ? 'AUTHENTICATING...' : 'INITIATE_SESSION'}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                        Aluplan Operational Command · v2.4
                    </p>
                </div>
            </div>
        </div>
    );
}
