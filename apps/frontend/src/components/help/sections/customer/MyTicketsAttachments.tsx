'use client';

import { Paperclip, CheckCircle, XCircle } from 'lucide-react';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * customer.my_tickets.attachments
 * Covers: Accepted/rejected file types, size limits, drag-and-drop
 */
export function MyTicketsAttachments() {
  const accepted = [
    { category: 'Görseller', types: 'PNG, JPG, GIF, WebP, BMP', note: 'Ekran görüntüleri, hata diyalogları' },
    { category: 'Belgeler', types: 'PDF, DOCX, XLSX, PPTX, TXT, CSV, MD', note: 'Teknik dökümanlar, raporlar' },
    { category: 'Arşivler', types: 'ZIP, 7Z, RAR', note: 'Birden fazla log dosyasını paketlemek için' },
    { category: 'Tanılama Dosyaları', types: '.log, .xml, .json, .hxl, .dmp', note: 'Allplan Hotinfo ve crash dump' },
    { category: 'Video', types: 'MP4, MOV, AVI, WebM', note: 'Çökme veya hata yeniden üretimi için' },
  ];

  const rejected = [
    { types: '.exe, .dll, .bat, .sh', note: 'Çalıştırılabilir dosyalar' },
    { types: '.js, .py, .apk, .iso', note: 'Script ve imaj dosyaları' },
  ];

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Paperclip className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Dosya Ekleri</h2>
        </div>
        <p className="text-muted-foreground">
          Destek talebinize sürükle-bırak ile <strong>25 MB</strong>&apos;a kadar dosya
          ekleyebilirsiniz. Aşağıda kabul edilen ve reddedilen dosya türleri listelenmiştir.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
          Kabul Edilen Dosya Türleri
        </h3>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Kategori</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Uzantılar</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">Not</th>
              </tr>
            </thead>
            <tbody>
              {accepted.map(({ category, types, note }) => (
                <tr key={category} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{category}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{types}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
          Reddedilen Dosya Türleri
        </h3>
        <div className="rounded-lg border border-red-500/20 bg-red-900/10 p-4 space-y-2">
          {rejected.map(({ types, note }) => (
            <div key={types} className="flex gap-3 items-start text-sm">
              <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
              <div>
                <CodeBlock code={types} inline />
                <span className="text-muted-foreground ml-2">— {note}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-red-300/70 mt-2">
            Bu dosya türleri güvenlik nedeniyle engellenmektedir.
          </p>
        </div>
      </section>

      <TipBox variant="warning" title="Allplan Çökmeleri İçin">
        <p className="text-sm">
          Allplan çökmelerinde{' '}
          <CodeBlock code="%AppData%\Nemetschek\Allplan" inline />
          {' '}dizinindeki <strong>.hxl Hotinfo</strong> dosyasını ve{' '}
          <strong>.dmp crash dump</strong> dosyasını eklemeniz teşhisi önemli ölçüde
          hızlandırır.
        </p>
      </TipBox>
    </article>
  );
}
