'use client';
export const dynamic = 'force-dynamic';
import { Sidebar } from '@/components/sidebar';
import { RoleGuard, useAuth } from '@/components/auth/role-guard';
import { MobileHeader } from '@/components/mobile-header';
import { useState } from 'react';
import { GlobalTicketNotification } from '@/components/global-ticket-notification';
import { GlobalAnnouncementNotification } from '@/components/global-announcement-notification';
import { AnnouncementArchiveDrawer } from '@/components/announcement-archive-drawer';
import { ProactiveChatInvite } from '@/components/proactive-chat/ProactiveChatInvite';
import { ProactiveChatWindow } from '@/components/proactive-chat/ProactiveChatWindow';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const { user } = useAuth();

    const userRoleName = (user?.role as any)?.name || user?.role || '';
    const userRole = (typeof userRoleName === 'string' ? userRoleName : '').toLowerCase();
    const isCustomer = userRole === 'customer';

    return (
        <>
            <GlobalTicketNotification />
            <GlobalAnnouncementNotification />
            <AnnouncementArchiveDrawer />

            {/* 15.1 ProactiveChatInvite — customer role only */}
            {isCustomer && (
                <ProactiveChatInvite
                    onAccepted={(sessionId) => setActiveChatSessionId(sessionId)}
                />
            )}

            {/* Chat window opened after customer accepts */}
            {isCustomer && activeChatSessionId && (
                <ProactiveChatWindow
                    sessionId={activeChatSessionId}
                    currentUserId={user?.id || ''}
                    isAgent={false}
                    onClose={() => setActiveChatSessionId(null)}
                />
            )}

            <div className="flex h-screen flex-col lg:flex-row overflow-hidden bg-background">
                {/* Mobile Header */}
                <MobileHeader
                    isOpen={isSidebarOpen}
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Sidebar Container */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <Sidebar onNavClick={() => setIsSidebarOpen(false)} />
                </div>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-y-auto w-full">
                    <div className="p-4 w-full h-full max-w-[100vw]">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </RoleGuard>
    );
}
