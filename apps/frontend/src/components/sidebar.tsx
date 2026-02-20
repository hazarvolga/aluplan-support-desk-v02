'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Ticket, BookOpen, Bot,
    MessageSquareQuote, Settings, LogOut, ChevronRight, Users,
} from 'lucide-react';

const nav = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tickets', icon: Ticket, label: 'Talepler' },
    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası' },
    { href: '/ai', icon: Bot, label: 'AI Asistan' },
    { href: '/faq', icon: MessageSquareQuote, label: 'FAQ' },
    { href: '/customers', icon: Users, label: 'Müşteriler' },
    { href: '/users', icon: Settings, label: 'Ekip' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-60 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200 dark:border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white tracking-tight">Aluplan Destek</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                {nav.map(({ href, icon: Icon, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${active
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon className="h-4.5 w-4.5 shrink-0" />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-3">
                <button
                    onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/login'; }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut className="h-4.5 w-4.5 shrink-0" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
