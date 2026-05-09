'use client';

import { Clock, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.team_customers.sla
 * Covers: SLA rule configuration — response time, resolution time, business hours
 */
export function TeamSla() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">SLA Kural Yapılandırması</h2>
        </div>
        <p className="text-muted-foreground">
          SLA (Service Level Agreement) kuralları, destek taleplerine ne kadar sürede
          yanıt verilmesi ve çözülmesi gerektiğini tanımlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">SLA Parametreleri</h3>
        <div className="space-y-2 text-sm">
          {[
            {
              param: 'İlk Yanıt Süresi',
              desc: 'Bilet açıldıktan sonra ilk yanıtın verilmesi gereken maksimum süre.',
              example: 'Örn: Yüksek öncelik → 2 saat',
            },
            {
              param: 'Çözüm Süresi',
              desc: 'Biletin tamamen çözülmesi gereken maksimum süre.',
              example: 'Örn: Orta öncelik → 24 saat',
            },
            {
              param: 'Mesai Saatleri',
              desc: 'SLA sayacının çalışacağı saat aralığı. Mesai dışı duraklatılabilir.',
              example: 'Örn: Pazartesi-Cuma, 09:00-18:00',
            },
          ].map(({ param, desc, example }) => (
            <div key={param} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1">
              <p className="font-medium">{param}</p>
              <p className="text-muted-foreground text-xs">{desc}</p>
              <p className="text-primary text-xs">{example}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Öncelik Bazlı SLA</h3>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Öncelik</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">İlk Yanıt</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Çözüm</th>
              </tr>
            </thead>
            <tbody>
              {[
                { priority: 'Acil', response: '1 saat', resolution: '4 saat', color: 'text-red-400' },
                { priority: 'Yüksek', response: '2 saat', resolution: '8 saat', color: 'text-amber-400' },
                { priority: 'Orta', response: '4 saat', resolution: '24 saat', color: 'text-blue-400' },
                { priority: 'Düşük', response: '8 saat', resolution: '72 saat', color: 'text-slate-400' },
              ].map(({ priority, response, resolution, color }) => (
                <tr key={priority} className="border-b border-white/5 last:border-0">
                  <td className={`px-4 py-2.5 font-medium ${color}`}>{priority}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{response}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          * Bu değerler örnek yapılandırmadır. Ekip Yönetimi sayfasından özelleştirin.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">SLA İhlali Bildirimleri</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            SLA süresi dolmak üzereyken sistem otomatik uyarı gönderir.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            İhlal olan biletler bilet listesinde kırmızı <strong>SLA_VIO</strong> rozeti ile işaretlenir.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Dashboard&apos;da SLA ihlali istatistikleri görüntülenir.
          </li>
        </ul>
      </section>

      <TipBox variant="warning" title="Mesai Saatlerini Doğru Ayarlayın">
        SLA sayacının mesai dışında durması için mesai saatlerini doğru
        yapılandırın. Aksi halde hafta sonu ve tatil günlerinde SLA ihlalleri
        oluşabilir.
      </TipBox>
    </article>
  );
}
