import Link from 'next/link';
import { Terminal, Activity, FileText, AlertTriangle, GitCommit, Search, ShieldAlert } from 'lucide-react';

export default function RootPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-mono flex flex-col selection:bg-primary/30 selection:text-primary">
            {/* Top Minimal Strip */}
            <header className="h-8 border-b border-white/10 flex items-center justify-between px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-black/50">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-foreground">
                        <Terminal className="h-3 w-3" /> SYS.TERM
                    </span>
                    <span className="opacity-50">v2.4.1_STABLE</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>UPTIME: 99.99%</span>
                    <span className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        NETWORK_SECURE
                    </span>
                </div>
            </header>

            {/* Main 3-Column Grid */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">

                {/* 1. Left Nav (col-span-2) */}
                <aside className="md:col-span-2 border-r border-white/10 flex flex-col bg-slate-950/50 p-4">
                    <div className="mb-8">
                        <h2 className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground/50 mb-3 border-b border-white/5 pb-2">Navigation</h2>
                        <nav className="space-y-1">
                            {['Documentation Index', 'Known Issues', 'Open Cases', 'Change Logs', 'System Architecture'].map((item) => (
                                <div key={item} className="text-[11px] uppercase tracking-wider hover:text-foreground hover:bg-white/5 px-2 py-1.5 cursor-pointer transition-colors border-l-2 border-transparent hover:border-primary">
                                    {item}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <h2 className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground/50 mb-3">Authentication</h2>
                        <Link href="/login" className="group block border border-white/10 bg-black/40 p-3 hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-foreground">Access Portal</span>
                                <ShieldAlert className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-[9px] text-muted-foreground tracking-tighter uppercase leading-tight">
                                Authorized partners & internal engineers only.
                            </p>
                        </Link>
                    </div>
                </aside>

                {/* 2. Center Info Stream (col-span-7) */}
                <section className="md:col-span-7 flex flex-col border-r border-white/10 relative bg-black/20">
                    {/* Command Prompt */}
                    <div className="p-6 border-b border-white/10 bg-slate-950">
                        <div className="relative flex items-center bg-black/50 border border-white/10 focus-within:border-primary/50 transition-colors">
                            <span className="text-primary pl-4 mr-2">{'>'}</span>
                            <span className="text-muted-foreground uppercase text-[10px] tracking-widest absolute left-8">search:</span>
                            <input
                                type="text"
                                placeholder='"X123 thermal expansion"...'
                                className="w-full bg-transparent border-none text-[12px] pl-24 pr-4 py-3 text-foreground outline-none placeholder:text-muted-foreground/30 font-mono flex-1"
                            />
                            <div className="absolute right-3 h-4 flex items-center gap-1 opacity-40">
                                <Search className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-[9px] uppercase tracking-widest text-muted-foreground/60">
                            <span>Filters:</span>
                            <span className="hover:text-foreground cursor-pointer underline decoration-white/20 underline-offset-2">Doc</span>
                            <span className="hover:text-foreground cursor-pointer underline decoration-white/20 underline-offset-2">Case</span>
                            <span className="hover:text-foreground cursor-pointer underline decoration-white/20 underline-offset-2">Revision</span>
                            <span className="hover:text-foreground cursor-pointer underline decoration-white/20 underline-offset-2">Engineer Note</span>
                        </div>
                    </div>

                    {/* Stream Log */}
                    <div className="flex-1 overflow-y-auto p-0">
                        <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-white/10 px-4 py-2 z-10">
                            <span className="text-[9px] tracking-widest uppercase font-bold text-muted-foreground">Live Telemetry Stream</span>
                        </div>

                        <div className="divide-y divide-white/5">
                            {[
                                { icon: FileText, color: "text-emerald-500", meta: "DOC_UPDATE", title: "Yeni Eklenen Tolerans Notu: Alüminyum Profil X-200", time: "2 min ago", ref: "DOC-2941" },
                                { icon: Activity, color: "text-rose-500", meta: "CRITICAL_CASE", title: "Kapanan Kritik Vaka: Termal Genleşme Hatası Bildirimi", time: "14 min ago", ref: "CASE-8820" },
                                { icon: GitCommit, color: "text-blue-500", meta: "REVISION", title: "Revize Edilen Montaj Şeması: T-Serisi Bağlantı Ekipmanı", time: "1 hour ago", ref: "REV-104A" },
                                { icon: AlertTriangle, color: "text-amber-500", meta: "KNOWN_ISSUE", title: "Sistem Kayıt: CNC Makine #4 Kalibrasyon Sapması", time: "3 hours ago", ref: "LOG-9921" },
                                { icon: FileText, color: "text-emerald-500", meta: "DOC_UPDATE", title: "Malzeme Spesifikasyon Güncellemesi: Alaşım 6063-T6", time: "5 hours ago", ref: "DOC-2940" },
                                { icon: Activity, color: "text-slate-400", meta: "CASE_CLOSED", title: "Standart Vaka Çözümü: Yüzey Anodizasyon Leke Kontrolü", time: "12 hours ago", ref: "CASE-8815" }
                            ].map((item, i) => (
                                <div key={i} className="px-6 py-4 hover:bg-white-[0.02] transition-colors group cursor-pointer flex gap-4">
                                    <div className="mt-1">
                                        <item.icon className={`h-4 w-4 ${item.color} opacity-80 group-hover:opacity-100`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{item.meta}</span>
                                            <span className="text-[9px] text-muted-foreground/50">{item.time}</span>
                                        </div>
                                        <h3 className="text-[13px] text-slate-200 group-hover:text-white mb-1.5">{item.title}</h3>
                                        <span className="inline-block px-1.5 py-0.5 bg-white/5 border border-white/10 text-[9px] text-muted-foreground">REF: {item.ref}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Right Status (col-span-3) */}
                <aside className="md:col-span-3 bg-slate-950 p-6 flex flex-col gap-8">
                    <div>
                        <h1 className="text-[14px] font-bold tracking-[0.2em] text-foreground mb-1">ALUPLAN SUPPORT SYSTEM</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Status:</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 -ml-0.5">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last update:</span>
                            <span className="text-[10px] font-mono text-slate-400">14 min ago</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-white/10 bg-black/30 p-4">
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Active Documents</p>
                            <p className="text-2xl font-bold tracking-tighter">248</p>
                        </div>
                        <div className="border border-white/10 bg-black/30 p-4">
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Open Tech Cases</p>
                            <p className="text-2xl font-bold tracking-tighter text-amber-500">17</p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
                        <h3 className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground/50">System Metrics</h3>

                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Resolution</span>
                            <span className="text-[11px] font-mono">4h 12m</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Engineers</span>
                            <span className="text-[11px] font-mono">12</span>
                        </div>
                        <div className="flex justify-between items-end pb-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ops (24h)</span>
                            <span className="text-[11px] font-mono">1,402</span>
                        </div>
                    </div>
                </aside>

            </main>
        </div>
    );
}
