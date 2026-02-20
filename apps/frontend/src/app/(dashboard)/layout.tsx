import { Sidebar } from '@/components/sidebar';
import { RoleGuard } from '@/components/auth/role-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 w-full">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
