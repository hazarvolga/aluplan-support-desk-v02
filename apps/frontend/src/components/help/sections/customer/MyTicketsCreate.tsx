'use client';

import { Plus, Shield, ArrowRight } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * customer.my_tickets.create
 * Covers: Step-by-step guide to creating a new support ticket
 */
export function MyTicketsCreate() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Yeni Destek Talebi Oluşturma</h2>
        </div>
        <p className="text-muted-foreground">
          Sorununuzu destek ekibine iletmek için <strong>Destek Taleplerim</strong> sayfasından
          yeni bir kayıt oluşturabilirsiniz.
        </p>
      </header>

      <TipBox variant="tip" title="Önce AI Asistanını Deneyin">
        Destek talebi açmadan önce <strong>AI Asistanı</strong> ile sorununuzu çözmeyi
        deneyin. Çoğu teknik sorun birkaç dakika içinde yanıtlanabilir.
      </TipBox>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Adım Adım Talep Oluşturma</h3>

        <div className="space-y-4 border-l-2 border-primary/30 pl-4 ml-2">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
              Ürün Seçimi
            </h4>
            <p className="text-sm text-muted-foreground">
              &quot;Yeni Talep&quot; butonuna tıkladıktan sonra sorun yaşadığınız ürün ailesini
              seçin (örn. ALLPLAN, AX3000). Bu sayede talebiniz doğrudan ilgili uzman
              ekibine yönlendirilir.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
              Konu ve Detaylar
            </h4>
            <p className="text-sm text-muted-foreground">
              Karşılaştığınız sorunu açıklayan net bir başlık ve detay girin. Aciliyet
              seviyesini seçin (SLA tarafından belirlenir).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" aria-hidden="true" />
              Dosya Ekleri
            </h4>
            <p className="text-sm text-muted-foreground">
              Sürükle-bırak ile <strong>25 MB</strong>&apos;a kadar dosya yükleyebilirsiniz.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
              Sistem Bilgisi (Hotinfo)
            </h4>
            <p className="text-sm text-muted-foreground">
              Allplan hataları için sistem bilgisi dosyası (.hxl) gereklidir. Profil
              sayfanızda kayıtlı Hotinfo varsa otomatik olarak eklenir.
            </p>
            <TipBox variant="warning" title="Allplan Çökmeleri İçin">
              <p className="text-sm">
                Çökme durumlarında{' '}
                <CodeBlock code="%AppData%\Nemetschek\Allplan" inline />
                {' '}dizinindeki <strong>.hxl Hotinfo</strong> ve{' '}
                <strong>.dmp crash dump</strong> dosyalarını ekleyin. Bu, teşhisi
                önemli ölçüde hızlandırır.
              </p>
            </TipBox>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
              Talebi Gönderin
            </h4>
            <p className="text-sm text-muted-foreground">
              &quot;Talep Oluştur&quot; butonuna tıklayın. Talebiniz oluşturulduğunda e-posta
              ile bildirim alırsınız.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
          Öncelik Seviyeleri
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { level: 'Düşük', color: 'text-slate-400', desc: 'Genel sorular, özellik istekleri' },
            { level: 'Orta', color: 'text-blue-400', desc: 'İş akışını etkileyen sorunlar' },
            { level: 'Yüksek', color: 'text-amber-400', desc: 'Kritik iş süreçleri durdu' },
            { level: 'Acil', color: 'text-red-400', desc: 'Sistem tamamen kullanılamıyor' },
          ].map(({ level, color, desc }) => (
            <div key={level} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className={`font-medium ${color}`}>{level}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
