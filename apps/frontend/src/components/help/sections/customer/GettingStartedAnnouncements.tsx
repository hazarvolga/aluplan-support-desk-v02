'use client';

import { Megaphone, Bell, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.getting_started.announcements
 * Covers: How to read and navigate announcements
 */
export function GettingStartedAnnouncements() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Megaphone className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Duyurular</h2>
        </div>
        <p className="text-muted-foreground">
          Aluplan destek ekibinin size ilettiği bakım bildirimleri, yeni özellik
          duyuruları ve önemli güncellemeleri bu sayfadan takip edebilirsiniz.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          Duyuruları Nasıl Görürsünüm?
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground pl-4">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Sol menüdeki <strong>zil ikonu</strong> okunmamış duyuru sayısını gösterir.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Zile tıklayarak duyuru listesini açabilirsiniz.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Bir duyuruya tıkladığınızda tam içeriği görüntülenir ve okundu olarak işaretlenir.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Duyuru Türleri</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm">🔧 Bakım Bildirimleri</p>
            <p className="text-xs text-muted-foreground">
              Planlı sistem bakımları ve geçici kesintiler hakkında önceden bilgilendirme.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm">✨ Yeni Özellikler</p>
            <p className="text-xs text-muted-foreground">
              Platforma eklenen yeni özellikler ve iyileştirmeler hakkında bilgi.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm">📢 Genel Duyurular</p>
            <p className="text-xs text-muted-foreground">
              Tüm müşterilere yönelik önemli bilgilendirmeler.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
            <p className="font-medium text-sm">🎯 Kişisel Duyurular</p>
            <p className="text-xs text-muted-foreground">
              Yalnızca size veya şirketinize özel iletilen mesajlar.
            </p>
          </div>
        </div>
      </section>

      <TipBox variant="tip" title="Duyuruları Kaçırmayın">
        Önemli bakım bildirimleri e-posta ile de iletilir. E-posta adresinizin güncel
        olduğundan emin olmak için <strong>Profil &amp; Ayarlar</strong> sayfasını kontrol edin.
      </TipBox>
    </article>
  );
}
