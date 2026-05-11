'use client';

import { Link } from '@/i18n/routing';
import { Layers } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('help');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Standalone Help Header */}
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#111111] px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">Aluplan</span>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                Support Desk
              </span>
            </div>
          </Link>
          
          <div className="hidden h-6 w-px bg-white/10 md:block" />
          
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm font-semibold text-white">{t('title')}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              {t('badge')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
