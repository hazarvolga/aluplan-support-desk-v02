'use client';

import { RefreshCw, ArrowRight, Star } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.ai_knowledge.learning_cycle
 * Covers: How the AI learning loop works, 5-star tickets, FAQ extraction
 */
export function AiLearningCycle() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Öğrenme Döngüsü</h2>
        </div>
        <p className="text-muted-foreground">
          AI, kapatılan biletlerden otomatik olarak öğrenir. Bu döngü, zamanla
          daha doğru ve hızlı yanıtlar üretilmesini sağlar.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
          Öğrenme Döngüsü Nasıl Çalışır?
        </h3>
        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          {[
            {
              step: '1',
              title: 'Müşteri 5 yıldız verir',
              desc: 'Kapatılan bir bilet müşteri tarafından 5 yıldızla değerlendirildiğinde, sistem bu çözümü "mükemmel" olarak işaretler.',
            },
            {
              step: '2',
              title: 'AI Onayları kuyruğuna girer',
              desc: 'Çözüm, doğrudan ana veritabanına yazılmaz. Önce KB Onayları (AI Approvals) sekmesine gönderilir.',
            },
            {
              step: '3',
              title: 'Admin onaylar veya reddeder',
              desc: 'Siz bu çözümün AI tarafından öğrenilmesini (Onayla) veya atlanmasını (Reddet) seçebilirsiniz.',
            },
            {
              step: '4',
              title: 'Onaylanan çözüm Knowledge Pool\'a eklenir',
              desc: 'Onaylanan çözüm vektör veritabanına eklenir ve gelecekteki benzer sorularda kullanılır.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-1">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {step}
                </span>
                {title}
              </h4>
              <p className="text-sm text-muted-foreground pl-8">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">FAQ Otomatik Çıkarma</h3>
        <p className="text-sm text-muted-foreground">
          <strong>FAQ Yönetimi</strong> sayfasından öğrenme döngüsünü manuel olarak
          tetikleyebilirsiniz. Sistem, kapatılan biletleri analiz ederek sık sorulan
          soruları otomatik çıkarır.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            &quot;Çıkarma Başlat&quot; butonuyla pipeline&apos;ı tetikleyin.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Çıkarılan FAQ adayları inceleme kuyruğuna düşer.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Onaylanan FAQ&apos;lar bilgi bankasına eklenir.
          </li>
        </ul>
      </section>

      <TipBox variant="info" title="Döngüyü Aktif Tutun">
        Öğrenme döngüsünün etkin çalışması için müşterileri bilet kapatıldığında
        memnuniyet puanı vermeye teşvik edin.
      </TipBox>
    </article>
  );
}
