'use client';

import { UserCircle, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.system_settings.profile
 * Covers: Admin profile management — personal info, password, preferences
 */
export function SystemProfile() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Profil Yönetimi</h2>
        </div>
        <p className="text-muted-foreground">
          Kişisel bilgilerinizi güncelleyin, şifrenizi değiştirin ve hesap
          tercihlerinizi yönetin.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Profil Bilgilerini Güncelleme</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Profil sayfasına gidin</p>
            <p>Sol menünün alt kısmındaki <strong>Profilim</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Bilgileri düzenleyin</p>
            <p>Ad, soyad, telefon numarası ve iş unvanı gibi bilgileri güncelleyin.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Kaydedin</p>
            <p><strong>Kaydet</strong> butonuna tıklayarak değişikliklerinizi uygulayın.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
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

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Dil Tercihi</h3>
        <p className="text-sm text-muted-foreground">
          Platform arayüz dilini profil sayfanızdan değiştirebilirsiniz.
          Türkçe ve İngilizce desteklenmektedir.
        </p>
      </section>

      <TipBox variant="tip" title="Güvenli Şifre Kullanın">
        Hesabınızın güvenliği için büyük/küçük harf, rakam ve özel karakter
        içeren güçlü bir şifre kullanın. Şifrenizi düzenli olarak değiştirin.
      </TipBox>
    </article>
  );
}
