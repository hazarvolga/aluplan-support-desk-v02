'use client';

import { Sliders, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.system_settings.settings
 * Covers: General system settings — CRM integration, email, notifications
 */
export function SystemSettings() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Sliders className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Genel Ayarlar</h2>
        </div>
        <p className="text-muted-foreground">
          Platform genelindeki yapılandırma ayarlarını bu sayfadan yönetin.
          CRM entegrasyonu, e-posta bildirimleri ve sistem parametrelerini buradan ayarlayın.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">CRM Entegrasyonu</h3>
        <p className="text-sm text-muted-foreground">
          Dynamics 365 entegrasyonunu yapılandırarak müşteri ve şirket verilerini
          otomatik olarak senkronize edin.
        </p>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Ayarlar sayfasına gidin</p>
            <p>Sol menüden <strong>Ayarlar</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. CRM Entegrasyonu bölümünü bulun</p>
            <p>Dynamics 365 bağlantı bilgilerini girin.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Alan eşleştirmesini yapılandırın</p>
            <p>
              CRM alanlarını sistem alanlarıyla eşleştirin. Yanlış eşleştirme
              veri tutarsızlıklarına yol açabilir.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">4. Senkronizasyonu test edin</p>
            <p>
              &quot;Senkronizasyonu Tetikle&quot; butonuyla manuel senkronizasyon başlatın
              ve sonuçları kontrol edin.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Diğer Ayarlar</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>E-posta Bildirimleri:</strong> Bilet güncellemeleri için e-posta şablonlarını yapılandırın.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Dil Ayarları:</strong> Platform varsayılan dilini belirleyin.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>Güvenlik:</strong> Oturum süresi ve şifre politikalarını ayarlayın.
          </li>
        </ul>
      </section>

      <TipBox variant="warning" title="Dikkatli Olun">
        Ayarlar sayfasındaki değişiklikler tüm sistemi etkiler. Özellikle CRM
        alan eşleştirmelerini değiştirmeden önce yedek alın.
      </TipBox>
    </article>
  );
}
