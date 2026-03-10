'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';

export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('common.languages');

    const locales = [
        { code: 'tr', label: 'TR' },
        { code: 'en', label: 'EN' },
        { code: 'de', label: 'DE' }
    ] as const;

    const setLocale = async (newLocale: string) => {
        if (newLocale === locale) return;

        // 1. Immediate UI switch via URL
        router.replace(pathname, { locale: newLocale as any });

        // 2. Background sync with DB
        try {
            await api.users.updateProfile({ language: newLocale });
        } catch (error) {
            console.error('Failed to persist language preference:', error);
            // We don't block the UI if DB sync fails
        }
    };

    return (
        <div className="flex items-center gap-1 p-1 border border-white/5 bg-white/5 rounded-lg backdrop-blur-sm shadow-xl">
            {locales.map((loc) => {
                const isActive = locale === loc.code;
                return (
                    <button
                        key={loc.code}
                        onClick={() => setLocale(loc.code)}
                        title={t(loc.code)}
                        className={`
                            flex-1 px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-md transition-all duration-300
                            ${isActive
                                ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] border border-primary/20'
                                : 'text-muted-foreground/60 hover:bg-white/5 hover:text-white border border-transparent'
                            }
                        `}
                    >
                        {loc.label}
                    </button>
                );
            })}
        </div>
    );
}
