'use client';

import { LayoutDashboard, Bell, Ticket, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * customer.getting_started.dashboard
 * Covers: Dashboard overview, active tickets, announcements board
 */
export function GettingStartedDashboard() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Dashboard &amp; Genel Bakış</h2>
        </div>
        <p className="text-muted-foreground">
          Sisteme giriş yaptığınızda karşılaştığınız ilk ekran <strong>Dashboard</strong>'dur.
          Bu ekran, destek süreçlerinizi tek bakışta takip etmenizi sağlar.
        </p>
      </header>

      <DocAccordion
        defaultValue={['overview', 'tickets', 'announcements']}
        items={[
          {
            id: 'overview',
            title: 'Dashboard Nedir?',
            icon: LayoutDashboard,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Dashboard, platformdaki tüm aktivitelerinizin özetini sunan ana kontrol
                  panelidir. Açık destek talepleriniz, son bilgi bankası makaleleri ve
                  sistem duyuruları burada bir arada görünür.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Aktif destek taleplerinizin anlık durumunu görüntüleyin.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Son oluşturulan bilgi bankası makalelerine hızlıca erişin.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Size özel sistem duyurularını &quot;Duyurular&quot; panosundan okuyun.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            id: 'tickets',
            title: 'Aktif Destek Taleplerim',
            icon: Ticket,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Dashboard&apos;daki <strong>Aktif Talepler</strong> kartı, yanıt bekleyen
                  veya işlemde olan tüm destek taleplerinizi listeler.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Talep durumunu (Açık, Yanıtlandı, Kapalı) buradan takip edebilirsiniz.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Bir talebe tıklayarak detay sayfasına geçebilirsiniz.
                  </li>
                </ul>
                <TipBox variant="info" title="Hızlı Erişim">
                  Sol menüdeki <strong>Destek Taleplerim</strong> bağlantısı sizi doğrudan
                  tüm taleplerinizin listelendiği sayfaya götürür.
                </TipBox>
              </div>
            ),
          },
          {
            id: 'announcements',
            title: 'Duyurular Panosu',
            icon: Bell,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Aluplan destek ekibi, bakım bildirimleri, yeni özellik duyuruları ve
                  önemli güncellemeleri <strong>Duyurular</strong> panosu aracılığıyla
                  iletir.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Okunmamış duyurular sol menüdeki zil ikonuyla belirtilir.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Duyurular size özel veya tüm müşterilere yönelik olabilir.
                  </li>
                </ul>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
}
