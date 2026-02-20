'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Ticket, BookOpen, Bot,
    MessageSquareQuote, Settings, LogOut, ChevronRight, Users,
} from 'lucide-react';

import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

const ADMIN_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tickets', icon: Ticket, label: 'Kuyruk' },
    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası' },
    { href: '/knowledge-pool', icon: BookOpen, label: 'Bilgi Havuzu' },
    { href: '/ai', icon: Bot, label: 'AI Asistan' },
    { href: '/faq', icon: MessageSquareQuote, label: 'FAQ' },
    { href: '/customers', icon: Users, label: 'Müşteriler' },
    { href: '/users', icon: Settings, label: 'Ekip' },
];

const CUSTOMER_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Ana Sayfa' },
    { href: '/my-tickets', icon: Ticket, label: 'Taleplerim' },
    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası' },
    { href: '/ai', icon: Bot, label: 'AI Asistan' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        api.auth.me().then(setUser).catch(() => { });
    }, []);

    const userRoles = (user?.roles || []).map((r: string) => r.toLowerCase());
    const isCustomer = userRoles.includes('customer');
    const nav = isCustomer ? CUSTOMER_NAV : ADMIN_NAV;

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <span className="text-white font-bold text-lg">A</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white leading-tight tracking-tight">Aluplan</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Destek Masası</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${active
                                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`} />
                            <span className="flex-1">{label}</span>
                            {active && (
                                <div className="absolute -left-1 w-1.5 h-6 bg-white rounded-full" />
                            )}
                            {!active && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile & Logout */}
            <div className="mt-auto p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
                {user && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                                user.fullName?.charAt(0).toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {user.fullName}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 rounded-md w-fit ${isCustomer ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {isCustomer ? 'MÜŞTERİ' : 'EKİP'}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/login'; }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-all group"
                >
                    <LogOut className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
