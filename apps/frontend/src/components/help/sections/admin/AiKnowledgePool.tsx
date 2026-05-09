'use client';

import { HardDrive, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { DocAccordion } from '@/components/help/DocAccordion';

/**
 * admin.ai_knowledge.pool
 * Covers: Knowledge Pool management — PDF upload, web scraper, raw text
 */
export function AiKnowledgePool() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <HardDrive className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Knowledge Pool Yönetimi</h2>
        </div>
        <p className="text-muted-foreground">
          AI&apos;ın doğru yanıtlar üretebilmesi için Knowledge Pool&apos;u sürekli
          güncel tutmanız gerekir. Üç farklı yöntemle veri ekleyebilirsiniz.
        </p>
      </header>

      <DocAccordion
        defaultValue={['pdf', 'scraper', 'raw']}
        items={[
          {
            id: 'pdf',
            title: 'PDF / Dosya Yükleme',
            icon: HardDrive,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Teknik şartnameleri, kullanım kılavuzlarını ve diğer belgeleri
                  PDF olarak doğrudan veritabanına ekleyin.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Sistem, PDF&apos;i otomatik olarak <strong>Embedding (Vektör)</strong> parçalarına böler.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Desteklenen formatlar: PDF, DOCX, TXT, MD.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Yükleme tamamlandıktan sonra AI hemen bu içeriği kullanabilir.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            id: 'scraper',
            title: 'Web Scraper',
            icon: ArrowRight,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Güncel &quot;Nasıl Yapılır&quot; URL&apos;lerini sisteme sağladığınızda,
                  AI web sitenizi okuyarak belleğine kaydeder.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    URL ekleyin, sistem sayfayı otomatik olarak tarar.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Periyodik yenileme ile içerik güncel tutulabilir.
                  </li>
                </ul>
                <TipBox variant="info">
                  Yalnızca kamuya açık ve erişilebilir URL&apos;ler taranabilir.
                  Giriş gerektiren sayfalar desteklenmez.
                </TipBox>
              </div>
            ),
          },
          {
            id: 'raw',
            title: 'Ham Metin (Raw Text)',
            icon: ArrowRight,
            children: (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Sık sorulan soruları ve yanıtlarını manuel olarak girerek AI için
                  &quot;Talimatlar&quot; oluşturabilirsiniz.
                </p>
                <ul className="space-y-1.5 pl-4">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Soru-cevap formatında içerik girin.
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    Şirket politikaları ve prosedürler için idealdir.
                  </li>
                </ul>
              </div>
            ),
          },
        ]}
      />

      <TipBox variant="tip" title="Kaliteli Veri = Kaliteli Yanıt">
        Knowledge Pool&apos;a eklediğiniz içeriklerin kalitesi, AI&apos;ın yanıt
        kalitesini doğrudan etkiler. Güncel, doğru ve kapsamlı belgeler ekleyin.
      </TipBox>
    </article>
  );
}
