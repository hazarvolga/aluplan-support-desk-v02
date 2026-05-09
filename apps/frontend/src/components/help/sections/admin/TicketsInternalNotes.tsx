'use client';

import { StickyNote, ArrowRight, UserCheck } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.tickets.internal_notes
 * Covers: Internal notes (team-only), assignment workflow
 */
export function TicketsInternalNotes() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <StickyNote className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">İç Notlar &amp; Atama</h2>
        </div>
        <p className="text-muted-foreground">
          İç notlar, müşteriye görünmeden ekip içi iletişim kurmanızı sağlar.
          Atama özelliği ile biletleri doğru uzmana yönlendirin.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-400" aria-hidden="true" />
          İç Not Ekleme
        </h3>
        <div className="space-y-3 border-l-2 border-amber-500/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Bilet detayına gidin</p>
            <p>Yanıt kutusunun üstündeki sekmeleri bulun.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. &quot;İç Not&quot; sekmesini seçin</p>
            <p>
              <strong>İç Not (Yalnızca Ekip)</strong> sekmesine geçin. Bu sekmedeki
              mesajlar müşteriye görünmez.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Notu yazın ve gönderin</p>
            <p>
              Ekip üyelerine iletmek istediğiniz bilgileri yazın. Notlar sarı arka
              planla işaretlenerek normal yanıtlardan ayrılır.
            </p>
          </div>
        </div>
        <TipBox variant="warning" title="Dikkat">
          İç not sekmesindeyken gönderilen mesajlar müşteriye iletilmez. Müşteriye
          yanıt vermek için <strong>Yanıt</strong> sekmesine geçtiğinizden emin olun.
        </TipBox>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Bilet Atama İş Akışı
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Bilet detay sayfasında sağ paneldeki <strong>Ata</strong> butonuna tıklayın.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Açılan listeden uygun agent&apos;ı seçin.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Atanan agent e-posta bildirimi alır ve bilet listesinde görünür.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Atama geçmişi bilet aktivite logunda kayıtlıdır.
          </li>
        </ul>
      </section>
    </article>
  );
}
