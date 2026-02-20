'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Ticket, BookOpen, Bot,
    MessageSquareQuote, Settings, LogOut, ChevronRight, Users, User
} from 'lucide-react';

import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

const ADMIN_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tickets', icon: Ticket, label: 'Kuyruk' },
    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası' },
    { href: '/knowledge-pool', icon: BookOpen, label: 'Bilgi Havuzu' },
    { href: '/ai', icon: Bot, label: 'AI Asistan' },
    { href: '/kb-approvals', icon: MessageSquareQuote, label: 'AI Onayları' },
    { href: '/customers', icon: Users, label: 'Müşteriler' },
    { href: '/users', icon: Settings, label: 'Ekip' },
    { href: '/profile', icon: User, label: 'Profil' },
];

const CUSTOMER_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Ana Sayfa' },
    { href: '/my-tickets', icon: Ticket, label: 'Taleplerim' },
    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası' },
    { href: '/ai', icon: Bot, label: 'AI Asistan' },
    { href: '/profile', icon: User, label: 'Profil' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        api.auth.me().then(setUser).catch(() => { });
    }, []);

    useEffect(() => {
        if (user && !user.roles.includes('customer')) {
            api.faq.list('PENDING_REVIEW').then(res => {
                setPendingCount(Array.isArray(res) ? res.length : (res.data?.length || 0));
            }).catch(() => { });
        }
    }, [user]);

    const userRoles = (user?.roles || []).map((r: string) => r.toLowerCase());
    const isCustomer = userRoles.includes('customer');
    const nav = isCustomer ? CUSTOMER_NAV : ADMIN_NAV;

    return (
        <aside className="flex h-screen w-[var(--sidebar-width)] flex-col border-r border-border bg-card">
            {/* System Identifier */}
            <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
                <div className="h-6 w-6 bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-mono text-xs font-bold italic">A</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-foreground leading-none tracking-tight">ALUPLAN_SYSTEM</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mt-0.5">OPS_CONTROL_v2</span>
                </div>
            </div>

            {/* Terminal Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin">
                <div className="px-2 pb-2">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Navigation</span>
                </div>
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2.5 px-2 py-1.5 transition-colors group relative
                ${active
                                    ? 'bg-accent text-white'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="flex-1 text-[12px] font-medium tracking-tight truncate">{label.toUpperCase()}</span>

                            {label === 'AI Onayları' && pendingCount > 0 && (
                                <span className={`px-1 text-[9px] font-mono font-bold border ${active ? 'border-white text-white' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                                    {pendingCount.toString().padStart(2, '0')}
                                </span>
                            )}

                            {active && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Auth Zone */}
            <div className="mt-auto border-t border-border p-2 bg-muted/30">
                {user && (
                    <div className="flex flex-col gap-2 p-2 mb-2 bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 border border-border bg-card flex items-center justify-center text-[10px] font-mono text-muted-foreground overflow-hidden">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover grayscale opacity-80" />
                                ) : (
                                    user.fullName?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                            <span className="text-[11px] font-bold text-foreground truncate uppercase tracking-tighter">
                                {user.fullName}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-muted-foreground">ID: {user.id.slice(0, 8)}</span>
                            <span className={`px-1 border ${isCustomer ? 'border-amber-900/50 text-amber-500/80 bg-amber-500/5' : 'border-emerald-900/50 text-emerald-500/80 bg-emerald-500/5'}`}>
                                {isCustomer ? 'RESTR_USER' : 'CORE_STAFF'}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/login'; }}
                    className="flex w-full items-center gap-2.5 px-2 py-1.5 text-[11px] font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group uppercase tracking-widest"
                >
                    <LogOut className="h-3.5 w-3.5 shrink-0" />
                    System_Exit
                </button>
            </div>
        </aside>
    );
}
