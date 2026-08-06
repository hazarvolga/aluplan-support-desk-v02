'use client';

import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Ticket, BookOpen, Bot,
    MessageSquareQuote, Settings, LogOut, ChevronRight, Users, User,
    Brain, Database, Layers, Mail, Link2, Megaphone, HelpCircle, MailCheck,
    Activity, Bell, MessagesSquare
} from 'lucide-react';

import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/role-guard';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { useAnnouncementStore } from '@/stores/announcement-store';

const ADMIN_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/tickets', icon: Ticket, labelKey: 'tickets' },
    {
        sectionKey: 'kb_section',
        items: [
            { href: '/knowledge-base', icon: BookOpen, labelKey: 'articles' },
            { href: '/kb-approvals', icon: MessageSquareQuote, labelKey: 'ai_approvals' },
        ]
    },
    {
        sectionKey: 'kp_section',
        items: [
            { href: '/knowledge-pool', icon: Database, labelKey: 'data_sources' },
            { href: '/faq-learning', icon: Brain, labelKey: 'learning_loop' },
            { href: '/system-topology', icon: Activity, labelKey: 'topology' },
        ]
    },
    {
        sectionKey: 'system_section',
        items: [
            { href: '/ai', icon: Bot, labelKey: 'ai_config' },
            { href: '/customers', icon: Users, labelKey: 'customers' },
            { href: '/customers/crm', icon: Link2, labelKey: 'crm' },
            { href: '/products', icon: Layers, labelKey: 'products' },
            { href: '/teams', icon: Users, labelKey: 'teams' },
            { href: '/admin/announcements', icon: Megaphone, labelKey: 'announcements' },
            { href: '/admin/emails', icon: Mail, labelKey: 'emails' },
            { href: '/admin/ai-intelligence', icon: Brain, labelKey: 'ai_intelligence' },
            { href: '/admin/ai-interactions', icon: MessagesSquare, labelKey: 'ai_interactions' },
            { href: '/admin/ai-health', icon: Activity, labelKey: 'ai_health' },
            { href: '/admin/email-validation', icon: MailCheck, labelKey: 'email_validation' },

            { href: '/users', icon: Settings, labelKey: 'users' },
            { href: '/admin/settings', icon: Settings, labelKey: 'settings' },
        ]
    },
    { href: '/help', icon: HelpCircle, labelKey: 'help' },
    { href: '/profile', icon: User, labelKey: 'profile' },
];

const CUSTOMER_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'overview' },
    { href: '/my-tickets', icon: Ticket, labelKey: 'my_tickets' },
    { href: '/knowledge-base', icon: BookOpen, labelKey: 'articles' },
    // /ai is intentionally excluded for customers — staff/admin only
    { href: '#announcements', icon: Bell, labelKey: 'announcements_bell', isAnnouncementBell: true },
    { href: '/help', icon: HelpCircle, labelKey: 'help' },
    { href: '/profile', icon: User, labelKey: 'account' },
];

interface SidebarProps {
    onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
    const pathname = usePathname();
    const t = useTranslations('sidebar');
    const { user, logout } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const { unreadCount, setUnreadCount, openArchive } = useAnnouncementStore();

    useEffect(() => {
        // KB Approvals count check
        const checkPending = async () => {
            try {
                const res = await api.kb.listPending();
                setPendingCount(res.total || 0);
            } catch (e) { }
        };
        if (user?.role?.toUpperCase() === 'ADMIN') {
            checkPending();
        }
    }, [user]);

    useEffect(() => {
        const role = user?.role?.toUpperCase?.() ?? '';
        if (role === 'CUSTOMER' || role === 'VIEWER') {
            api.announcements.getUnreadCount().then((r) => setUnreadCount(r.count)).catch(() => {});
        }
    }, [user]);

    const navItems = user?.role?.toUpperCase() === 'ADMIN' ? ADMIN_NAV : CUSTOMER_NAV;

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
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                            {t('app_subtitle')}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
                    {navItems.map((item: any, idx) => {
                        if (item.sectionKey) {
                            return (
                                <div key={idx} className="space-y-2">
                                    <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                        {t(`nav.${item.sectionKey}`)}
                                    </h4>
                                    <div className="space-y-1">
                                        {item.items.map((sub: any, sIdx: number) => {
                                            const active = pathname === sub.href || pathname.endsWith(sub.href);
                                            return (
                                                <Link
                                                    key={sIdx}
                                                    href={sub.href}
                                                    onClick={onNavClick}
                                                    data-testid={`nav-${sub.labelKey}`}
                                                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${active
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <sub.icon className={`h-4 w-4 ${active ? 'text-primary' : 'group-hover:text-white'}`} />
                                                        <span>{t(`nav.${sub.labelKey}`)}</span>
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

                        if (item.isAnnouncementBell) {
                            return (
                                <button
                                    key={idx}
                                    onClick={() => { openArchive(); onNavClick?.(); }}
                                    data-testid={`nav-${item.labelKey}`}
                                    className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all text-muted-foreground hover:bg-white/5 hover:text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <Bell className="h-4 w-4 group-hover:text-white" />
                                        <span>{t(`nav.${item.labelKey}`)}</span>
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="ml-auto text-[9px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        }

                        const active = pathname === item.href || pathname.endsWith(item.href);
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                target={item.href === '/help' ? '_blank' : undefined}
                                rel={item.href === '/help' ? 'noopener noreferrer' : undefined}
                                onClick={onNavClick}
                                data-testid={`nav-${item.labelKey}`}
                                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-4 w-4 ${active ? 'text-primary' : 'group-hover:text-white'}`} />
                                    <span>{t(`nav.${item.labelKey}`)}</span>
                                </div>
                                {active && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-white/5 pt-4 space-y-4">
                    <LanguageSwitcher />
                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
