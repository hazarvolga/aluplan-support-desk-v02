'use client';

import { Building2, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.team_customers.teams
 * Covers: Team creation, department management, agent assignment
 */
export function TeamTeams() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Ekip Oluşturma</h2>
        </div>
        <p className="text-muted-foreground">
          Destek departmanlarınızı (ekipleri) oluşturun ve agent&apos;ları ilgili
          ekiplere atayın. Ekipler, biletlerin doğru uzmanlara yönlendirilmesini sağlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Ekip Oluşturma Adımları</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Ekip Yönetimi sayfasına gidin</p>
            <p>Sol menüden <strong>Ekipler</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Yeni ekip oluşturun</p>
            <p>Ekip adı ve açıklaması girin (örn. &quot;Allplan Teknik Destek&quot;).</p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Agent&apos;ları ekleyin</p>
            <p>
              Ekibe dahil edilecek agent&apos;ları seçin. Bir agent birden fazla
              ekipte yer alabilir.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">4. SLA kurallarını yapılandırın</p>
            <p>
              Ekip için yanıt süresi, çözüm süresi ve mesai saati kurallarını belirleyin.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Ekip Yapısı Önerileri</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { name: 'Teknik Destek', desc: 'Allplan kurulum ve hata sorunları' },
            { name: 'Lisans Yönetimi', desc: 'Aktivasyon ve lisans transferleri' },
            { name: 'Eğitim', desc: 'Kullanım soruları ve eğitim talepleri' },
            { name: 'Genel Destek', desc: 'Sınıflandırılamayan talepler' },
          ].map(({ name, desc }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-medium">{name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TipBox variant="tip" title="Otomatik Atama">
        Ekip ve SLA kuralları doğru yapılandırıldığında, sistem gelen biletleri
        ürün kategorisine göre otomatik olarak ilgili ekibe atar.
      </TipBox>
    </article>
  );
}
