'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, routing } from '@/i18n/routing';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const toggleLocale = () => {
        const nextLocale = locale === 'en' ? 'tr' : 'en';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-all group shadow-[0_0_15px_rgba(255,255,255,0.02)]"
        >
            <Languages className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 group-hover:text-white">
                {locale === 'en' ? 'TR' : 'EN'}
            </span>
        </button>
    );
}
