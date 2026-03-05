'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Ticket, BookOpen, Bot,
    MessageSquareQuote, Settings, LogOut, ChevronRight, Users, User,
    Brain, Database, Layers, Mail, Link2, Megaphone, HelpCircle, MailCheck,
    Activity
} from 'lucide-react';



import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/role-guard';

const ADMIN_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Kontrol Paneli' },
    { href: '/tickets', icon: Ticket, label: 'Bilet Kuyruğu' },
    {
        section: 'BİLGİ BANKASI',
        items: [
            { href: '/knowledge-base', icon: BookOpen, label: 'Makaleler' },
            { href: '/kb-approvals', icon: MessageSquareQuote, label: 'AI Onayları' },
        ]
    },
    {
        section: 'BİLGİ HAVUZU',
        items: [
            { href: '/knowledge-pool', icon: Database, label: 'Veri Kaynakları' },
            { href: '/faq-learning', icon: Brain, label: 'Öğrenme Döngüsü' },
            { href: '/system-topology', icon: Activity, label: 'Sistem Topolojisi' },
        ]
    },
    {
        section: 'SİSTEM',
        items: [
            { href: '/ai', icon: Bot, label: 'AI Yapılandırması' },
            { href: '/customers', icon: Users, label: 'Müşteriler' },
            { href: '/customers/crm', icon: Link2, label: 'CRM Yönetimi' },
            { href: '/products', icon: Layers, label: 'Ürünler & Modüller' },
            { href: '/teams', icon: Users, label: 'Destek Ekipleri' },
            { href: '/admin/announcements', icon: Megaphone, label: 'Duyuru Yönetimi' },
            { href: '/admin/emails', icon: Mail, label: 'E-Posta Yönetimi' },
            { href: '/admin/email-validation', icon: MailCheck, label: 'E-Posta Doğrulama' },
            { href: '/users', icon: Settings, label: 'Tüm Kullanıcılar' },
            { href: '/admin/settings', icon: Settings, label: 'Sistem Ayarları' },
        ]
    },
    { href: '/help', icon: HelpCircle, label: 'Sistem Rehberi' },
    { href: '/profile', icon: User, label: 'Profil Ayarları' },
];

const CUSTOMER_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Genel Bakış' },
    { href: '/my-tickets', icon: Ticket, label: 'Destek Taleplerim' },
    { href: '/knowledge-base', icon: BookOpen, label: 'Bilgi Bankası' },
    { href: '/ai', icon: Bot, label: 'Yapay Zeka Asistanı' },
    { href: '/help', icon: HelpCircle, label: 'Sistem Rehberi' },
    { href: '/profile', icon: User, label: 'Hesabım' },
];

interface SidebarProps {
    onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const me = await api.auth.me();
                setUser(me);
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };

        fetchUser();

        // KB Approvals count check
        const checkPending = async () => {
            try {
                const res = await api.kb.listPending();
                setPendingCount(res.total || 0);
            } catch (e) { }
        };
        checkPending();
    }, []);

    const navItems = user?.role === 'ADMIN' ? ADMIN_NAV : CUSTOMER_NAV;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside className="h-full w-full border-r border-white/5 bg-[#111111]">
            <div className="flex h-full flex-col px-4 py-6">
                <div className="mb-8 flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-white leading-none">Aluplan</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Destek Masası</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
                    {navItems.map((item: any, idx) => {
                        if (item.section) {
                            return (
                                <div key={idx} className="space-y-2">
                                    <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                        {item.section}
                                    </h4>
                                    <div className="space-y-1">
                                        {item.items.map((sub: any, sIdx: number) => {
                                            const active = pathname === sub.href;
                                            return (
                                                <Link
                                                    key={sIdx}
                                                    href={sub.href}
                                                    onClick={onNavClick}
                                                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${active
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <sub.icon className={`h-4 w-4 ${active ? 'text-primary' : 'group-hover:text-white'}`} />
                                                        <span>{sub.label}</span>
                                                    </div>
                                                    {sub.href === '/kb-approvals' && pendingCount > 0 && (
                                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                                            {pendingCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        const active = pathname === item.href;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                onClick={onNavClick}
                                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-4 w-4 ${active ? 'text-primary' : 'group-hover:text-white'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {active && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-white/5 pt-4 space-y-1">
                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Güvenli Çıkış</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
