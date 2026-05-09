'use client';

import { Send, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.announcements.overview
 * Covers: Creating and publishing announcements — 4-step workflow
 */
export function AnnouncementsOverview() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Send className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Duyuru Oluşturma &amp; Yayınlama</h2>
        </div>
        <p className="text-muted-foreground">
          Müşterilerinize toplu veya hedefli duyurular (kampanyalar, bakım bildirimleri vb.)
          göndermek için 4 adımlı süreci takip edin.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">4 Adımlı Duyuru Süreci</h3>
        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          {[
            {
              step: '1',
              icon: '📝',
              title: 'Şablon Hazırlama',
              desc: 'Şablonlar sekmesinde yeniden kullanabileceğiniz e-posta içerikleri tasarlayın ve kaydedin.',
            },
            {
              step: '2',
              icon: '📢',
              title: 'Duyuru Oluşturma ve Şablon Seçimi',
              desc: 'Duyuru Oluştur sekmesinde yeni içerik yazın veya üst menüden bir şablon uygulayın.',
            },
            {
              step: '3',
              icon: '🎯',
              title: 'Hedef Kitle Seçimi',
              desc: 'Sağdaki filtrelerle duyurunun hangi sektör veya şirkete gönderileceğini belirleyin. Sistem ulaşılacak kişi sayısını anlık gösterir.',
            },
            {
              step: '4',
              icon: '🚀',
              title: 'Taslak Kaydet ve Yayınla',
              desc: '"Protokol Taslağı" butonuna basıldığında duyurunuz Taslak olarak kaydedilir. Henüz e-posta gönderilmez. Geçmiş sekmesinden ilgili duyuruyu bulun ve "Yayınla" ikonuna tıklayarak gerçek e-postaları gönderin.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="space-y-1">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {step}
                </span>
                <span aria-hidden="true">{icon}</span>
                {title}
              </h4>
              <p className="text-sm text-muted-foreground pl-9">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Hedef Kitle Filtreleri</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Sektör:</strong> Belirli bir sektördeki tüm müşteriler
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Şirket:</strong> Belirli bir şirketteki tüm kullanıcılar
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Tüm Müşteriler:</strong> Sistemdeki tüm aktif kullanıcılar
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title="Göndermeden Önce Test Edin">
        Taslak duyurularınızı önizleme modunda test edin. Gerçek e-postalar yalnızca
        &quot;Yayınla&quot; ikonuna tıklandığında gönderilir.
      </TipBox>
    </article>
  );
}
