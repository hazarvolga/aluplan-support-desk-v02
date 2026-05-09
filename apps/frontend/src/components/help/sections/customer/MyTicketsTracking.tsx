'use client';

import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';

/**
 * customer.my_tickets.tracking
 * Covers: How to track ticket status, status meanings, CSAT feedback
 */
export function MyTicketsTracking() {
  const statuses = [
    { label: 'Yeni', color: 'bg-slate-500', desc: 'Talebiniz alındı, henüz incelenmedi.' },
    { label: 'Açık', color: 'bg-blue-500', desc: 'Destek ekibi talebinizi inceliyor.' },
    { label: 'İşlemde', color: 'bg-amber-500', desc: 'Uzman tarafından aktif olarak çalışılıyor.' },
    { label: 'Müşteri Bekliyor', color: 'bg-purple-500', desc: 'Ekip sizden ek bilgi bekliyor.' },
    { label: 'Çözüm Onayı', color: 'bg-orange-500', desc: 'Çözüm sunuldu, onayınız bekleniyor.' },
    { label: 'Çözüldü', color: 'bg-green-500', desc: 'Sorun çözüldü ve kapatıldı.' },
    { label: 'Kapalı', color: 'bg-slate-600', desc: 'Talep tamamlandı ve arşivlendi.' },
  ];

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Talep Takibi</h2>
        </div>
        <p className="text-muted-foreground">
          Oluşturduğunuz destek taleplerini <strong>Destek Taleplerim</strong> sayfasından
          anlık olarak takip edebilirsiniz.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Talep Durumları</h3>
        <div className="space-y-2">
          {statuses.map(({ label, color, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
            >
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Çözüm Onaylama</h3>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-2 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
              Çözüm Önerisi Geldiğinde
            </p>
            <p>
              Destek ekibi bir çözüm sunduğunda talep <strong>Çözüm Onayı</strong> durumuna
              geçer. Size e-posta bildirimi gönderilir.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
              Onaylama veya Reddetme
            </p>
            <p>
              Talep detay sayfasında çözümü <strong>Onayla</strong> veya{' '}
              <strong>Yetersiz, Detay Bekliyorum</strong> olarak işaretleyebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Memnuniyet Puanı (CSAT)</h3>
        <p className="text-sm text-muted-foreground">
          Talep kapatıldıktan sonra 1-5 yıldız arasında memnuniyet puanı verebilirsiniz.
          Bu geri bildirimler AI&apos;ın öğrenme sürecine katkı sağlar.
        </p>
        <TipBox variant="tip" title="5 Yıldız Verin">
          5 yıldızlı çözümler AI tarafından öğrenme adayı olarak işaretlenir ve
          gelecekteki benzer sorunlarda otomatik yanıt olarak kullanılabilir.
        </TipBox>
      </section>
    </article>
  );
}
