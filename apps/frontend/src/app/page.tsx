'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Terminal, ShieldAlert, Lock, AlertTriangle, CircleDot, FileText, CheckCircle2 } from 'lucide-react';

export default function SplitScreenGateway() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { access_token } = await api.auth.login(email, password);
            localStorage.setItem('access_token', access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message ?? 'AUTH_FAILURE: Credentials rejected by security node');
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
                        <Image src="/logos/aluplan-logo-white.svg" alt="Aluplan Logo" width={180} height={40} className="mb-6 opacity-90" />
                        <h1 className="text-[12px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60 flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Operational Support Gateway
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                            SYS.STATUS: OPERATIONAL
                        </span>
                    </div>
                </div>

                {/* Broadcast Center */}
                <div className="relative z-10 mb-auto w-full max-w-2xl">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3 ml-1">SYS.BROADCAST // LATEST_NOTICES</h2>

                    <div className="space-y-4">
                        {/* Critical Notice */}
                        <div className="border border-amber-500/30 bg-amber-500/5 p-4 md:p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2 text-amber-500">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-[11px] font-bold tracking-widest uppercase">Maintenance Warning</span>
                                <span className="ml-auto text-[9px] text-amber-500/50">2 HOURS AGO</span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-amber-500/90 font-medium">
                                Scheduled calibration for CNC Array B will impact automated sync pipelines between 02:00-04:00 UTC. Expect delayed telemetry during this window.
                            </p>
                        </div>

                        {/* Standard Notice */}
                        <div className="border border-white/10 bg-black/40 p-4 md:p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <FileText className="h-4 w-4" />
                                <span className="text-[11px] font-bold tracking-widest uppercase">Documentation Update</span>
                                <span className="ml-auto text-[9px] text-muted-foreground/50">YESTERDAY</span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-slate-400">
                                T-Series extrusion guidelines have been updated (Rev. 4.1). Internal engineers please review the updated tolerance tables in the KB index.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Metrics & Partner Badge */}
                <div className="relative z-10 mt-12 flex justify-between items-end">
                    <div className="flex gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Active DB Nodes</p>
                            <p className="text-xl font-bold tracking-tighter">1,402</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Uptime SLA</p>
                            <p className="text-xl font-bold tracking-tighter text-emerald-500">99.99%</p>
                        </div>
                    </div>

                    <div className="opacity-40 hover:opacity-100 transition-opacity flex flex-col items-end gap-2">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Certified Infrastructure</span>
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
                    <h2 className="text-[18px] font-bold uppercase tracking-widest text-white mb-2">ACCESS_GATEWAY</h2>
                    <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest leading-relaxed max-w-xs">
                        Authentication required for telemetry read/write and support module access.
                    </p>
                </div>

                {/* Mechanism Wrapper */}
                <div className="w-full max-w-[340px] mx-auto">

                    {/* Fake Tabs (UI Only) */}
                    <div className="flex mb-6 border-b border-white/10">
                        <div className="px-4 py-2 border-b-2 border-primary text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
                            <CircleDot className="h-3 w-3" />
                            AUTHENICATE
                        </div>
                        <Link href="/register" className="px-4 py-2 border-b-2 border-transparent text-muted-foreground/50 hover:text-muted-foreground text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors">
                            REQ_CLEARANCE
                        </Link>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">IDENTITY_TOKEN [EMAIL]</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="operator@aluplan.com"
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 text-white text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex justify-between">
                                <span>VERIFICATION_KEY [PASS]</span>
                                <span className="opacity-50 hover:opacity-100 cursor-pointer">RECOVER_KEY?</span>
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 text-white text-[16px] tracking-[0.3em] font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 animate-in fade-in">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 py-3.5 px-4 border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/80 text-primary text-[11px] uppercase font-bold tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">NEGOTIATING_HANDSHAKE...</span>
                            ) : (
                                <>
                                    <span>INITIATE_SESSION</span>
                                    <CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] text-muted-foreground/40 uppercase tracking-widest">
                        <ShieldAlert className="h-3 w-3" />
                        Connections monitored via Aluplan Sec-Net
                    </div>
                </div>
            </div>

        </div>
    );
}
