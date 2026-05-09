'use client';

import { Network, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.system_settings.topology
 * Covers: System topology view — AI nodes, database, infrastructure
 */
export function SystemTopology() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Network className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Sistem Topolojisi</h2>
        </div>
        <p className="text-muted-foreground">
          Sistem Topolojisi sayfası, platformun altyapı bileşenlerini ve AI
          node&apos;larının durumunu gerçek zamanlı olarak görüntüler.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Topoloji Görünümü</h3>
        <p className="text-sm text-muted-foreground">
          Bu sayfa, sistem yöneticilerine altyapının genel sağlık durumunu
          gösterir. Aşağıdaki bileşenler izlenir:
        </p>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { name: 'AI Node&apos;ları', desc: 'Ollama ve vektör hesaplama node&apos;larının durumu', icon: '🤖' },
            { name: 'Veritabanı', desc: 'Aktif DB node sayısı ve bağlantı durumu', icon: '🗄️' },
            { name: 'API Servisleri', desc: 'Backend servislerinin yanıt süreleri', icon: '⚡' },
            { name: 'Uptime', desc: 'SLA uyumlu çalışma süresi yüzdesi', icon: '📊' },
          ].map(({ name, desc, icon }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start">
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-medium" dangerouslySetInnerHTML={{ __html: name }} />
                <p className="text-muted-foreground text-xs mt-0.5" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Durum Göstergeleri</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
            <span><strong>Aktif / Online:</strong> Bileşen normal çalışıyor.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
            <span><strong>Uyarı:</strong> Performans düşüklüğü veya gecikme var.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
            <span><strong>Offline / Hata:</strong> Bileşen erişilemiyor.</span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">AI Sağlık Telemetrisi</h3>
        <p className="text-sm text-muted-foreground">
          Daha detaylı AI performans metrikleri için <strong>AI Sağlık &amp; Telemetri</strong>
          sayfasını ziyaret edin.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Token kullanımı ve maliyet takibi
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            RAG doğruluk oranları ve güven dağılımı
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Yanıtsız kalan sorular (bilgi bankası boşlukları)
          </li>
        </ul>
      </section>

      <TipBox variant="info" title="Sadece Okuma Yetkisi">
        Sistem Topolojisi sayfası yalnızca izleme amaçlıdır. Altyapı
        yapılandırması için sistem yöneticinizle iletişime geçin.
      </TipBox>
    </article>
  );
}
