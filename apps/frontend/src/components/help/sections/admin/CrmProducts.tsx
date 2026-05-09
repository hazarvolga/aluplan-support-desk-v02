'use client';

import { Package, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.crm_products.products
 * Covers: Product and module management for ticket classification
 */
export function CrmProducts() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Ürünler &amp; Modüller</h2>
        </div>
        <p className="text-muted-foreground">
          Müşterilerin bilet açarken gördüğü ürün kartlarını buradan yönetin.
          Doğru yapılandırılmış ürünler, AI&apos;ın biletleri doğru ekibe yönlendirmesini sağlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Ürün Ekleme</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Ürünler &amp; Modüller sayfasına gidin</p>
            <p>Sol menüden <strong>Ürünler</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. &quot;Yeni Ürün Ekle&quot; butonuna tıklayın</p>
            <p>Ürün adı ve kısa açıklama girin.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Alt kategoriler ekleyin</p>
            <p>
              Her ürün için alt kategoriler (modüller) oluşturun. Bu kategoriler
              AI&apos;ın bilet sınıflandırmasında kullanılır.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Kategori Yapısı</h3>
        <p className="text-sm text-muted-foreground">
          Her ürün altında birden fazla kategori (modül) tanımlayabilirsiniz.
          Kategoriler, AI&apos;ın biletleri otomatik etiketlemesinde kullanılır.
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          <p className="font-medium mb-2">Örnek Yapı:</p>
          <div className="space-y-1 text-muted-foreground font-mono text-xs">
            <p>📦 ALLPLAN</p>
            <p className="pl-4">├── Duvar &amp; Döşeme</p>
            <p className="pl-4">├── Lisans Yönetimi</p>
            <p className="pl-4">└── Render &amp; Görselleştirme</p>
            <p className="mt-2">📦 AX3000</p>
            <p className="pl-4">├── Kurulum</p>
            <p className="pl-4">└── Aktivasyon</p>
          </div>
        </div>
      </section>

      <TipBox variant="tip" title="Anahtar Kelimeler Kritik">
        Kategorilere yalnızca özellik adları değil, müşteri semptomlarını da ekleyin
        (örn. &quot;yavaşlama&quot;, &quot;siyah ekran&quot;, &quot;kapanıyor&quot;). AI bu anahtar kelimeleri
        okuyarak bileti doğru ekibe yönlendirir (Triage).
      </TipBox>
    </article>
  );
}
