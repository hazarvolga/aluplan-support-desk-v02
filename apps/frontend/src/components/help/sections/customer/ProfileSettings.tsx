'use client';

import { Settings, User, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.profile.settings
 * Covers: Profile management, password change, notification preferences
 */
export function ProfileSettings() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Settings className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Profil &amp; Ayarlar</h2>
        </div>
        <p className="text-muted-foreground">
          Kişisel bilgilerinizi güncelleyin, şifrenizi değiştirin ve bildirim
          tercihlerinizi yönetin.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
          Profil Bilgilerini Güncelleme
        </h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Profil sayfasına gidin</p>
            <p>Sol menünün alt kısmındaki <strong>Profilim</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Bilgileri düzenleyin</p>
            <p>Ad, soyad, telefon numarası ve iş unvanı gibi bilgileri güncelleyebilirsiniz.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Kaydedin</p>
            <p><strong>Kaydet</strong> butonuna tıklayarak değişikliklerinizi uygulayın.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Şifre Değiştirme</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Profil sayfasındaki <strong>Şifre Değiştir</strong> bölümüne gidin.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Mevcut şifrenizi ve yeni şifrenizi girin.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Sistem Bilgisi (Hotinfo)</h3>
        <p className="text-sm text-muted-foreground">
          Profil sayfanızda kayıtlı sistem bilgisi (Hotinfo) dosyanız bulunur. Bu dosya,
          destek talebi oluştururken otomatik olarak eklenir.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Allplan&apos;dan dışa aktarılan <strong>.hxl</strong> dosyasını yükleyin.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Sistem bilgisi güncel tutulduğunda destek süreci hızlanır.
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title="E-posta Adresinizi Güncel Tutun">
        Destek talebi bildirimleri ve duyurular kayıtlı e-posta adresinize gönderilir.
        E-posta adresinizin doğru olduğundan emin olun.
      </TipBox>
    </article>
  );
}
