'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * admin.ai_knowledge.approvals
 * Covers: KB Approvals workflow — approve/reject AI learning candidates
 */
export function AiApprovals() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">AI Onayları (KB Approvals)</h2>
        </div>
        <p className="text-muted-foreground">
          5 yıldızlı çözümler ve FAQ adayları, ana veritabanına eklenmeden önce
          admin onayından geçer. Bu sayede bilgi kalitesi korunur.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Onay İş Akışı</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. KB Onayları sayfasına gidin</p>
            <p>Sol menüden <strong>KB Onayları</strong> bağlantısına tıklayın.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Adayları inceleyin</p>
            <p>
              Her aday için kaynak bilet, önerilen soru-cevap çifti ve güven skoru
              görüntülenir.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Onayla veya Reddet</p>
            <p>
              <strong>Onayla</strong> — Çözüm Knowledge Pool&apos;a eklenir ve AI
              tarafından kullanılmaya başlanır.
            </p>
            <p className="mt-1">
              <strong>Reddet</strong> — Çözüm atlanır, veritabanına eklenmez.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Güven Skoru</h3>
        <p className="text-sm text-muted-foreground">
          Her aday için sistem bir güven skoru hesaplar. Yüksek skor, çözümün
          benzer sorularla güçlü eşleşme gösterdiğini belirtir.
        </p>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          {[
            { range: '80-100%', label: 'Yüksek', color: 'text-green-400', desc: 'Güvenle onaylanabilir' },
            { range: '50-79%', label: 'Orta', color: 'text-amber-400', desc: 'İnceleme önerilir' },
            { range: '0-49%', label: 'Düşük', color: 'text-red-400', desc: 'Dikkatli değerlendirin' },
          ].map(({ range, label, color, desc }) => (
            <div key={range} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className={`font-medium ${color}`}>{label} ({range})</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TipBox variant="tip" title="Kalite Kontrolü">
        Onaylamadan önce kaynak bileti okuyun. Çözümün gerçekten doğru ve
        tekrarlanabilir olduğundan emin olun.
      </TipBox>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Toplu İşlemler</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Birden fazla adayı seçerek toplu onay veya red işlemi yapabilirsiniz.
          </li>
          <li className="flex gap-2 items-start">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            Filtreler ile belirli ürün veya kategorideki adayları görüntüleyin.
          </li>
        </ul>
      </section>
    </article>
  );
}
