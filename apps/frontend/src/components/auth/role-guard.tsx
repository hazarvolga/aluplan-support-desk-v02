'use client';

import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Strip the locale prefix from a pathname for route matching.
 * e.g., "/en/login" → "/login", "/tr/dashboard" → "/dashboard", "/en" → "/"
 */
function stripLocale(pathname: string): string {
    for (const locale of routing.locales) {
        const prefix = `/${locale}`;
        if (pathname === prefix) return '/';
        if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
    }
    return pathname;
}

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
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        const token = localStorage.getItem('access_token');
        const cleanPath = stripLocale(pathname);
        if (!token) {
            setUser(null);
            setLoading(false);
            // Only redirect to login if user is on a protected route
            const isPublicRoute =
                cleanPath === '/' ||
                cleanPath.startsWith('/login') ||
                cleanPath.startsWith('/register') ||
                cleanPath.startsWith('/reset-password');
            if (!isPublicRoute) {
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
            const isPublicRoute =
                cleanPath === '/' ||
                cleanPath.startsWith('/login') ||
                cleanPath.startsWith('/register') ||
                cleanPath.startsWith('/reset-password');
            if (!isPublicRoute) {
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

    const login = (userData: User) => {
        setUser(userData);
        setLoading(false);
    };

    // Run fetchUser on mount
    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-sync if path changes and we have a token but no user (handles cross-page navigation)
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token && !user) {
            fetchUser();
        }
    }, [pathname, user]);

    useEffect(() => {
        if (!loading && user) {
            const cleanPath = stripLocale(pathname);
            console.log('[RoleGuard Trace] AuthProvider checking redirect. cleanPath:', cleanPath, 'User Role:', user?.role);
            if (cleanPath === '/' || cleanPath.startsWith('/login')) {
                const userRole = (user?.role || (user?.roles && user.roles[0]) || 'viewer').toLowerCase();
                router.push(userRole === 'customer' || userRole === 'viewer' ? '/my-tickets' : '/dashboard');
            }
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
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
            const userRole = (user?.role || (user?.roles && user.roles[0]) || 'viewer').toLowerCase();
            const isCustomer = userRole === 'customer' || userRole === 'viewer';
            const cleanPath = stripLocale(pathname);

            // Routes that are definitely NOT for customers
            const adminOnlyPaths = ['/users', '/settings', '/reports', '/customers', '/faq/review', '/ai/training', '/faq-learning'];
            const isUnauthorizedTarget = adminOnlyPaths.some(path => cleanPath.startsWith(path));

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
