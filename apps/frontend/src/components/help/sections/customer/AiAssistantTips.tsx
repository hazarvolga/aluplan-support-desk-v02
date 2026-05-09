'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * customer.ai_assistant.tips
 * Covers: Tips for asking effective questions to the AI assistant
 */
export function AiAssistantTips() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Etkili Soru Sorma İpuçları</h2>
        </div>
        <p className="text-muted-foreground">
          AI Asistanından en iyi sonuçları almak için sorularınızı nasıl
          formüle etmeniz gerektiğini öğrenin.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Yapın ✅</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3 items-start rounded-lg border border-white/10 bg-white/5 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Modül adını belirtin</p>
              <p className="mt-0.5">
                Hangi Allplan modülünde sorun yaşadığınızı yazın.
              </p>
              <CodeBlock code="AX3000 modülünde lisans hatası alıyorum" inline className="mt-1" />
            </div>
          </li>
          <li className="flex gap-3 items-start rounded-lg border border-white/10 bg-white/5 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Hata mesajını kopyalayın</p>
              <p className="mt-0.5">
                Ekranda gördüğünüz hata mesajını olduğu gibi yapıştırın.
              </p>
              <CodeBlock code='Error: "License server not found (0x80070005)"' inline className="mt-1" />
            </div>
          </li>
          <li className="flex gap-3 items-start rounded-lg border border-white/10 bg-white/5 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Adımları açıklayın</p>
              <p className="mt-0.5">
                Hatanın hangi işlem sırasında oluştuğunu belirtin.
              </p>
              <CodeBlock code="Duvar çizerken, 3. noktayı tıkladığımda program kapanıyor" inline className="mt-1" />
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Yapmayın ❌</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3 items-start rounded-lg border border-red-500/10 bg-red-900/10 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Çok genel sorular sormayın</p>
              <CodeBlock code="Program çalışmıyor" inline className="mt-1" />
              <p className="mt-1 text-xs">Hangi program? Nasıl çalışmıyor?</p>
            </div>
          </li>
          <li className="flex gap-3 items-start rounded-lg border border-red-500/10 bg-red-900/10 p-3">
            <ArrowRight className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Birden fazla konuyu tek soruda sormayın</p>
              <CodeBlock code="Lisans hatası ve ayrıca duvar çizimi ve de raporlama nasıl yapılır?" inline className="mt-1" />
            </div>
          </li>
        </ul>
      </section>

      <TipBox variant="tip" title="Pro İpucu">
        Sorunuzu İngilizce sormak, AI&apos;ın daha geniş bir bilgi tabanına erişmesini
        sağlayabilir. Ancak Türkçe sorular da tam olarak desteklenmektedir.
      </TipBox>
    </article>
  );
}
