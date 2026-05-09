'use client';

import { FileText, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.announcements.templates
 * Covers: Template library — creating, editing, applying templates
 */
export function AnnouncementsTemplates() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Şablon Kütüphanesi</h2>
        </div>
        <p className="text-muted-foreground">
          Tekrar kullanabileceğiniz e-posta şablonları oluşturun. Şablonlar,
          duyuru oluşturma sürecini hızlandırır ve tutarlı iletişim sağlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Şablon Oluşturma</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Duyuru Yönetimi sayfasına gidin</p>
            <p>Sol menüden <strong>Duyurular</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Şablonlar sekmesini açın</p>
            <p>Sayfanın üst kısmındaki <strong>Şablonlar</strong> sekmesine geçin.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Yeni şablon oluşturun</p>
            <p>
              Şablon adı, konu satırı ve e-posta içeriğini girin. HTML formatı
              desteklenmektedir.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">4. Kaydedin</p>
            <p>Şablon kütüphanenize eklenir ve duyuru oluştururken kullanılabilir.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Şablon Kullanımı</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Duyuru oluştururken üst menüden <strong>Şablon Uygula</strong> seçeneğini kullanın.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Şablon içeriği forma otomatik olarak doldurulur.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Şablonu uyguladıktan sonra içeriği özelleştirebilirsiniz.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Önerilen Şablon Türleri</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { name: 'Bakım Bildirimi', desc: 'Planlı sistem bakımı duyurusu' },
            { name: 'Yeni Özellik', desc: 'Platform güncellemeleri ve yeni özellikler' },
            { name: 'Acil Bildirim', desc: 'Kritik sistem durumları için' },
            { name: 'Genel Duyuru', desc: 'Rutin bilgilendirmeler için' },
          ].map(({ name, desc }) => (
            <div key={name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-medium">{name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TipBox variant="info" title="Şablonları Güncel Tutun">
        Şirket bilgileri veya iletişim detayları değiştiğinde tüm şablonları
        güncellemeyi unutmayın.
      </TipBox>
    </article>
  );
}
