'use client';

import { Tag, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * admin.crm_products.taxonomy
 * Covers: Taxonomy rules, keyword configuration for AI triage
 */
export function CrmTaxonomy() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Tag className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Taksonomi &amp; Anahtar Kelimeler</h2>
        </div>
        <p className="text-muted-foreground">
          Taksonomi kuralları, AI&apos;ın gelen biletleri doğru ürün kategorisine
          otomatik olarak atamasını sağlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Taksonomi Kuralı Nedir?</h3>
        <p className="text-sm text-muted-foreground">
          Her kategori için tanımladığınız anahtar kelimeler, AI&apos;ın bilet içeriğini
          analiz ederken kullandığı etiketleme kurallarıdır.
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
          <p className="font-medium">Örnek Kural:</p>
          <div className="space-y-2 text-muted-foreground">
            <p><strong>Kategori:</strong> Model Çökmesi</p>
            <p><strong>Anahtar Kelimeler:</strong></p>
            <CodeBlock
              code="kapanıyor, çöküyor, crash, donuyor, siyah ekran, yanıt vermiyor"
              language="text"
            />
            <p className="text-xs">
              Bu anahtar kelimelerden herhangi birini içeren biletler otomatik olarak
              &quot;Model Çökmesi&quot; kategorisine atanır.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Anahtar Kelime Stratejisi</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              <strong>Özellik adları:</strong> Duvar, Döşeme, Çatı, Render
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              <strong>Müşteri semptomları:</strong> yavaş, donuyor, açılmıyor, hata
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              <strong>Hata kodları:</strong> 0x80070005, Error 1001
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              <strong>Türkçe ve İngilizce:</strong> Her iki dilde de anahtar kelime ekleyin
            </span>
          </li>
        </ul>
      </section>

      <TipBox variant="warning" title="Çakışan Anahtar Kelimeler">
        Aynı anahtar kelimeyi birden fazla kategoride kullanmaktan kaçının.
        Çakışmalar AI&apos;ın yanlış sınıflandırma yapmasına neden olabilir.
      </TipBox>
    </article>
  );
}
