'use client';

import { UserCheck, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.team_customers.customers
 * Covers: Customer approval, CRM verification, account management
 */
export function TeamCustomers() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <UserCheck className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Müşteri Onaylama</h2>
        </div>
        <p className="text-muted-foreground">
          Yeni kayıt olan müşterileri onaylayın, CRM doğrulamasını yönetin ve
          müşteri profillerini güncelleyin.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Müşteri Onay Süreci</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Müşteriler sayfasına gidin</p>
            <p>Sol menüden <strong>Müşteriler</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Bekleyen müşterileri filtreleyin</p>
            <p>
              Durum filtresinden <strong>Doğrulanmamış</strong> seçeneğini seçerek
              onay bekleyen müşterileri listeleyin.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Müşteriyi inceleyin ve onaylayın</p>
            <p>
              Müşteri profilini açın, CRM bilgilerini doğrulayın ve
              <strong> Onayla</strong> butonuna tıklayın.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">CRM Doğrulama</h3>
        <p className="text-sm text-muted-foreground">
          Dynamics 365 entegrasyonu aktifse, müşteri kaydı otomatik olarak CRM
          veritabanıyla eşleştirilir.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>DYNAMICS_OK:</strong> CRM&apos;de eşleşme bulundu.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>MANUAL_ENTRY:</strong> CRM&apos;de kayıt yok, manuel onay gerekli.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <strong>NOT_FOUND:</strong> Müşteri CRM&apos;de bulunamadı.
          </li>
        </ul>
      </section>

      <TipBox variant="info" title="Toplu Doğrulama">
        Birden fazla müşteriyi seçerek toplu e-posta doğrulama işlemi
        başlatabilirsiniz. Bu, büyük müşteri listelerini hızlıca işlemenizi sağlar.
      </TipBox>
    </article>
  );
}
