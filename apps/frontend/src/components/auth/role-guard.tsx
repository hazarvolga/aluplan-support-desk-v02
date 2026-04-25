'use client';

import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
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
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    const fetchUser = useCallback(async () => {
        // Prevent concurrent fetchUser calls
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        const cleanPath = stripLocale(pathname);

        try {
            const data = await api.auth.me();
            setUser(data as any);
        } catch (err) {
            setUser(null);
            const isPublicRoute =
                cleanPath === '/' ||
                cleanPath.startsWith('/login') ||
                cleanPath.startsWith('/register') ||
                cleanPath.startsWith('/reset-password') ||
                cleanPath.startsWith('/verify-email');
            if (!isPublicRoute) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
            hasFetchedRef.current = true;
        }
    }, [pathname, router]);

    const logout = async () => {
        try {
            await api.auth.logout();
        } catch (e) {
            console.error('Logout API call failed', e);
        } finally {
            setUser(null);
            router.push('/login');
        }
    };

    const login = (userData: User) => {
        setUser(userData);
        setLoading(false);
    };

    // Run fetchUser on mount only
    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loading && user) {
            const cleanPath = stripLocale(pathname);
            if (cleanPath === '/' || cleanPath.startsWith('/login')) {
                const userRoleName = (user?.role as any)?.name || user?.role || (user?.roles && user.roles[0]) || 'viewer';
                const userRole = (typeof userRoleName === 'string' ? userRoleName : 'viewer').toLowerCase();
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
            const userRoleName = (user?.role as any)?.name || user?.role || (user?.roles && user.roles[0]) || 'viewer';
            const userRole = (typeof userRoleName === 'string' ? userRoleName : 'viewer').toLowerCase();
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
