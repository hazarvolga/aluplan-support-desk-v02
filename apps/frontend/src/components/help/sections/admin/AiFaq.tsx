'use client';

import { HelpCircle, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.ai_knowledge.faq
 * Covers: FAQ management — review, publish, dismiss FAQ candidates
 */
export function AiFaq() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">FAQ Yönetimi</h2>
        </div>
        <p className="text-muted-foreground">
          Sistem, kapatılan biletlerden otomatik olarak sık sorulan soruları çıkarır.
          Bu sayfadan FAQ adaylarını inceleyebilir, yayınlayabilir veya reddedebilirsiniz.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">FAQ Çıkarma Süreci</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Otomatik Çıkarma</p>
            <p>
              Sistem periyodik olarak kapatılan biletleri analiz eder ve tekrar eden
              soruları FAQ adayı olarak işaretler.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Manuel Tetikleme</p>
            <p>
              <strong>Çıkarma Başlat</strong> butonuyla pipeline&apos;ı manuel olarak
              çalıştırabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">FAQ Durumları</h3>
        <div className="space-y-2 text-sm">
          {[
            { status: 'İnceleme Bekliyor', color: 'bg-amber-500', desc: 'Henüz değerlendirilmemiş adaylar' },
            { status: 'Yayınlandı', color: 'bg-green-500', desc: 'Onaylanmış ve aktif FAQ\'lar' },
            { status: 'Taslak', color: 'bg-slate-500', desc: 'Reddedilmiş veya beklemedeki içerikler' },
          ].map(({ status, color, desc }) => (
            <div key={status} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
              <div>
                <p className="font-medium">{status}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">FAQ Onaylama</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Onayla</strong> — FAQ yayınlanır ve bilgi bankasına eklenir.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Reddet</strong> — FAQ taslak/silinmiş durumuna geçer.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Güven skoru ve kaynak bilet bilgisi her aday için görüntülenir.
          </li>
        </ul>
      </section>

      <TipBox variant="info" title="FAQ Öğrenme Döngüsü">
        FAQ Yönetimi ve KB Onayları birlikte çalışır. Öğrenme döngüsünün tamamı
        için her iki sayfayı da düzenli olarak kontrol edin.
      </TipBox>
    </article>
  );
}
