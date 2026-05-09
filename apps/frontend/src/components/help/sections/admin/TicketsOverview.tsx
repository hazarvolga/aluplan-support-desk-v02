'use client';

import { Inbox, ArrowRight, UserCheck } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * admin.tickets.overview
 * Covers: Ticket pool, status management, assignment
 */
export function TicketsOverview() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Inbox className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Bilet Havuzu</h2>
        </div>
        <p className="text-muted-foreground">
          <strong>Destek Talepleri</strong> sayfası, müşterilerden gelen tüm talepleri
          tek bir havuzda toplar. Durum yönetimi, atama ve önceliklendirme işlemlerini
          buradan gerçekleştirebilirsiniz.
        </p>
      </header>

      <DocAccordion
        defaultValue={['pool', 'status', 'assignment']}
        items={[
          {
            id: 'pool',
            title: 'Bilet Havuzu Görünümü',
            icon: Inbox,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Bilet havuzu, tüm aktif ve geçmiş destek taleplerini listeler.
                  Filtreler ve sıralama seçenekleriyle iş yükünüzü yönetin.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Durum, öncelik, şirket ve tarih aralığına göre filtreleyin.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Toplu işlemler için birden fazla bilet seçin.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    SLA ihlali olan biletler kırmızı rozet ile işaretlenir.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            id: 'status',
            title: 'Durum Değiştirme',
            icon: ArrowRight,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Bilet detay sayfasında sağ paneldeki açılır menüden durumu
                  değiştirebilirsiniz.
                </p>
                <div className="space-y-2">
                  {[
                    { from: 'Yeni → Açık', desc: 'Talebi incelemeye aldığınızda' },
                    { from: 'Açık → İşlemde', desc: 'Aktif olarak çalışmaya başladığınızda' },
                    { from: 'İşlemde → Çözüm Onayı', desc: 'Çözüm sunduğunuzda' },
                    { from: 'Çözüm Onayı → Çözüldü', desc: 'Müşteri onayladığında otomatik' },
                  ].map(({ from, desc }) => (
                    <div key={from} className="flex gap-2 items-start">
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span><strong>{from}:</strong> {desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'assignment',
            title: 'Bilet Atama',
            icon: UserCheck,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Bilet detay sayfasındaki <strong>Ata</strong> butonuyla talebi
                  belirli bir uzman agent&apos;a devredebilirsiniz.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Atanan agent e-posta bildirimi alır.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Atama değiştirilebilir; geçmiş atamalar loglanır.
                  </li>
                </ul>
                <TipBox variant="info">
                  SLA kuralları, atanmamış biletleri otomatik olarak uygun ekibe
                  yönlendirebilir. Ekip Yönetimi sayfasından SLA kurallarını yapılandırın.
                </TipBox>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
}
