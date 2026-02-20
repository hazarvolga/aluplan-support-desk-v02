import { Sidebar } from '@/components/sidebar';
import { RoleGuard } from '@/components/auth/role-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard>
            <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
