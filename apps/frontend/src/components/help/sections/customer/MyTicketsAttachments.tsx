'use client';

import { Paperclip, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TipBox } from '@/components/help/TipBox';
import { CodeBlock } from '@/components/help/CodeBlock';

/**
 * customer.my_tickets.attachments
 * Covers: Accepted/rejected file types, size limits, drag-and-drop
 */
export function MyTicketsAttachments() {
  const t = useTranslations('help.docs.customer.my_tickets_attachments');

  const accepted = [
    { category: t('acc_cat1'), types: 'PNG, JPG, GIF, WebP, BMP', note: t('acc_note1') },
    { category: t('acc_cat2'), types: 'PDF, DOCX, XLSX, PPTX, TXT, CSV, MD', note: t('acc_note2') },
    { category: t('acc_cat3'), types: 'ZIP, 7Z, RAR', note: t('acc_note3') },
    { category: t('acc_cat4'), types: '.log, .xml, .json, .hxl, .dmp', note: t('acc_note4') },
    { category: t('acc_cat5'), types: 'MP4, MOV, AVI, WebM', note: t('acc_note5') },
  ];

  const rejected = [
    { types: '.exe, .dll, .bat, .sh', note: t('rej_note1') },
    { types: '.js, .py, .apk, .iso', note: t('rej_note2') },
  ];

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Paperclip className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.raw('desc') }} />
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
          {t('accepted_title')}
        </h3>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('category')}</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('extensions')}</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">{t('note')}</th>
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
          {t('rejected_title')}
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
            {t('rej_warning')}
          </p>
        </div>
      </section>

      <TipBox variant="warning" title={t('tip_crash_title')}>
        <p className="text-sm" dangerouslySetInnerHTML={{ __html: t.raw('tip_crash_desc') }} />
      </TipBox>
    </article>
  );
}
