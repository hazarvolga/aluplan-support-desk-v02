'use client';

import { Library, Search, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.knowledge_base.overview
 * Covers: What is the knowledge base, how to search, article types
 */
export function KnowledgeBaseOverview() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Library className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Bilgi Bankası</h2>
        </div>
        <p className="text-muted-foreground">
          Bilgi Bankası, sık karşılaşılan sorunların çözümlerini, nasıl yapılır
          kılavuzlarını ve teknik belgeleri içeren kurumsal hafıza merkezidir.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" aria-hidden="true" />
          Bilgi Bankasında Arama
        </h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Bilgi Bankası sayfasına gidin</p>
            <p>Sol menüden <strong>Bilgi Bankası</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Arama yapın</p>
            <p>
              Üst kısımdaki arama kutusuna anahtar kelimeler girin. Sistem başlık ve
              içerik üzerinde tam metin araması yapar.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Makaleyi okuyun</p>
            <p>
              İlgili makaleye tıklayarak adım adım çözüm kılavuzuna ulaşın.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Makale Türleri</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { icon: '📖', title: 'Nasıl Yapılır', desc: 'Adım adım işlem kılavuzları' },
            { icon: '🔧', title: 'Sorun Giderme', desc: 'Hata mesajları ve çözümleri' },
            { icon: '📋', title: 'Referans', desc: 'Teknik özellikler ve parametreler' },
            { icon: '🎓', title: 'Eğitim', desc: 'Özellik kullanım rehberleri' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start">
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Makale Durumları</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            { status: 'Aktif', desc: 'Onaylanmış ve güncel makaleler' },
            { status: 'Taslak', desc: 'Henüz yayınlanmamış içerikler' },
            { status: 'Arşiv', desc: 'Güncelliğini yitirmiş eski makaleler' },
          ].map(({ status, desc }) => (
            <li key={status} className="flex gap-2 items-start">
              <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span><strong>{status}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <TipBox variant="info" title="AI ile Arama">
        Bilgi bankasında aradığınızı bulamazsanız <strong>AI Asistanı</strong>&apos;nı
        kullanın. AI, bilgi bankasını semantik olarak tarar ve daha geniş bir bağlamda
        yanıt üretir.
      </TipBox>
    </article>
  );
}
