'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    roles?: string[];
    permissions?: string[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            if (
                pathname !== '/' &&
                !pathname.startsWith('/login') &&
                !pathname.startsWith('/register') &&
                !pathname.startsWith('/reset-password')
            ) {
                router.push('/login');
            }
            return;
        }

        try {
            const data = await api.auth.me();
            setUser(data as any);
        } catch (err) {
            localStorage.removeItem('access_token');
            setUser(null);
            if (
                pathname !== '/' &&
                !pathname.startsWith('/login') &&
                !pathname.startsWith('/register') &&
                !pathname.startsWith('/reset-password')
            ) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.auth.logout();
        } catch (e) {
            console.error('Logout API call failed', e);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            router.push('/login');
        }
    };

    useEffect(() => {
        fetchUser();
    }, [pathname]);

    useEffect(() => {
        if (!loading && user) {
            if (pathname === '/' || pathname.startsWith('/login')) {
                const userRole = (user?.role || (user?.roles && user.roles[0]) || 'customer').toLowerCase();
                router.push(userRole === 'customer' ? '/my-tickets' : '/dashboard');
            }
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

export function RoleGuard({
    children,
    allowedRoles
}: {
    children: React.ReactNode;
    allowedRoles?: string[]
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && user) {
            const userRole = (user?.role || (user?.roles && user.roles[0]) || 'customer').toLowerCase();
            const isCustomer = userRole === 'customer';

            // Routes that are definitely NOT for customers
            const adminOnlyPaths = ['/users', '/settings', '/reports', '/customers', '/faq/review', '/ai/training', '/faq-learning'];
            const isUnauthorizedTarget = adminOnlyPaths.some(path => pathname.startsWith(path));

            if (allowedRoles) {
                const hasRequiredRole = allowedRoles.some(r => r.toLowerCase() === userRole);
                if (!hasRequiredRole) {
                    router.push(isCustomer ? '/my-tickets' : '/dashboard');
                }
            } else if (isCustomer && isUnauthorizedTarget) {
                router.push('/my-tickets');
            }
        }
    }, [user, loading, pathname, router, allowedRoles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
            </div>
        );
    }

    return <>{children}</>;
}
