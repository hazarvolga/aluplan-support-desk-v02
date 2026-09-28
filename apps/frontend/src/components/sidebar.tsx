'use client';

import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Ticket, BookOpen, Bot,
    Settings, LogOut, Users, User,
    Brain, Database, Layers, Mail, Link2, Megaphone, HelpCircle, MailCheck,
    Activity, Bell, ClipboardCheck
} from 'lucide-react';

import { api, type ReviewCenterSummary } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/role-guard';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { useAnnouncementStore } from '@/stores/announcement-store';
import { getReviewCenterDefinition } from './review-center/review-center-registry';

const ADMIN_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/tickets', icon: Ticket, labelKey: 'tickets' },
    {
        sectionKey: 'kb_section',
        items: [
            { href: '/knowledge-base', icon: BookOpen, labelKey: 'articles' },
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
            { href: '/admin/ai-health', icon: Activity, labelKey: 'ai_health' },
            { href: '/admin/email-validation', icon: MailCheck, labelKey: 'email_validation' },

            { href: '/users', icon: Settings, labelKey: 'users' },
            { href: '/admin/settings', icon: Settings, labelKey: 'settings' },
        ]
    },
    { href: '/help', icon: HelpCircle, labelKey: 'help' },
    { href: '/profile', icon: User, labelKey: 'profile' },
];

const STAFF_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/tickets', icon: Ticket, labelKey: 'tickets' },
    { href: '/knowledge-base', icon: BookOpen, labelKey: 'articles' },
    { href: '/help', icon: HelpCircle, labelKey: 'help' },
    { href: '/profile', icon: User, labelKey: 'profile' },
];

const STAFF_ROLES = new Set([
    'ADMIN', 'AGENT', 'DEPARTMENT_MANAGER', 'KB_EDITOR', 'MANAGER',
    'SENIOR_AGENT', 'SUPER_ADMIN', 'SUPERUSER', 'SUPPORT_AGENT',
    'SUPPORT_MANAGER', 'TEAM_LEAD',
]);

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
    const reviewT = useTranslations('review_center');
    const { user, logout } = useAuth();
    const [reviewSummary, setReviewSummary] = useState<ReviewCenterSummary | null>(null);
    const { unreadCount, setUnreadCount, openArchive } = useAnnouncementStore();

    const rawRole = typeof user?.role === 'object' && user.role !== null
        ? (user.role as { name?: string }).name
        : user?.role;
    const role = typeof rawRole === 'string'
        ? rawRole.trim().replace(/-/g, '_').toUpperCase()
        : '';
    const isCustomer = role === 'CUSTOMER' || role === 'VIEWER';
    const isStaff = STAFF_ROLES.has(role);

    useEffect(() => {
        let active = true;
        const loadReviewSummary = async () => {
            try {
                const result = await api.reviewCenter.summary();
                if (active) setReviewSummary(result);
            } catch {
                if (active) setReviewSummary(null);
            }
        };

        if (isStaff) {
            void loadReviewSummary();
        } else {
            setReviewSummary(null);
        }

        return () => { active = false; };
    }, [isStaff, role]);

    useEffect(() => {
        if (role === 'CUSTOMER' || role === 'VIEWER') {
            api.announcements.getUnreadCount().then((r) => setUnreadCount(r.count)).catch(() => {});
        }
    }, [role, setUnreadCount]);

    const navItems = role === 'ADMIN' ? ADMIN_NAV : isStaff ? STAFF_NAV : CUSTOMER_NAV;
    const reviewItems = (reviewSummary?.items ?? []).flatMap((item) => {
        const definition = getReviewCenterDefinition(item.id);
        return definition ? [{ ...item, definition }] : [];
    });

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
                    {isStaff && (
                        <div className="space-y-2" data-testid="review-center-section">
                            <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                                {t('nav.review_section')}
                            </h4>
                            <div className="space-y-1 border-l border-primary/20 pl-2">
                                <Link
                                    href="/review-center"
                                    onClick={onNavClick}
                                    data-testid="nav-review_center"
                                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${pathname.endsWith('/review-center')
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ClipboardCheck className="h-4 w-4" />
                                        <span>{t('nav.review_center')}</span>
                                    </div>
                                    {(reviewSummary?.pendingActions ?? 0) > 0 && (
                                        <span data-testid="review-center-badge" className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[9px] font-bold text-primary-foreground">
                                            {reviewSummary!.pendingActions > 99 ? '99+' : reviewSummary!.pendingActions}
                                        </span>
                                    )}
                                </Link>
                                {reviewItems.map((item) => {
                                    const Icon = item.definition.icon;
                                    const targetPath = item.href.split('?')[0];
                                    const active = pathname === targetPath || pathname.endsWith(targetPath);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={onNavClick}
                                            data-testid={`review-task-${item.id}`}
                                            className={`group flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${active
                                                ? 'bg-primary/[0.07] text-primary'
                                                : 'text-muted-foreground/80 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{reviewT(item.definition.titleKey)}</span>
                                            </div>
                                            {item.kind === 'ACTION' && (item.count ?? 0) > 0 && (
                                                <span className="ml-2 text-[10px] tabular-nums text-primary">{item.count}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
                    <LanguageSwitcher persistToProfile />
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
