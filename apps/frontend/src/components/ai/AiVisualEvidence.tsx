'use client';

import { ExternalLink, Image as ImageIcon } from 'lucide-react';

export type AiVisualEvidenceItem = {
    url: string;
    alt?: string;
    caption?: string;
    summary: string;
    sourceTitle: string;
    sourceId: string;
};

type AiVisualEvidenceLabels = {
    title: string;
    description: string;
    open: string;
    source: string;
};

type AiVisualEvidenceProps = {
    visuals?: AiVisualEvidenceItem[];
    labels: AiVisualEvidenceLabels;
    accent?: 'brand' | 'orange';
};

export function AiVisualEvidence({ visuals, labels, accent = 'brand' }: AiVisualEvidenceProps) {
    const uniqueVisuals = Array.from(
        new Map((visuals ?? []).filter(visual => visual.url).map(visual => [visual.url, visual])).values(),
    );

    if (uniqueVisuals.length === 0) return null;

    const accentClass = accent === 'orange'
        ? 'border-orange-500/20 bg-orange-500/5 text-orange-300'
        : 'border-brand-500/20 bg-brand-500/5 text-brand-300';

    return (
        <section className={`rounded-xl border ${accentClass} p-4`}>
            <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20">
                    <ImageIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white">{labels.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">{labels.description}</p>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {uniqueVisuals.map((visual, index) => {
                    const caption = visual.caption || visual.alt || visual.summary;
                    return (
                        <article
                            key={`${visual.url}-${index}`}
                            className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/50"
                        >
                            <a
                                href={visual.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group block bg-black/30"
                                aria-label={`${labels.open}: ${caption}`}
                            >
                                <img
                                    src={visual.url}
                                    alt={visual.alt || visual.caption || visual.sourceTitle}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    className="aspect-video w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                            </a>
                            <div className="space-y-2 border-t border-white/10 p-3">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{caption}</p>
                                <p className="line-clamp-2 text-xs leading-relaxed text-white/55">{visual.summary}</p>
                                <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-white/45">
                                    <span className="truncate">
                                        {labels.source}: {visual.sourceTitle}
                                    </span>
                                    <a
                                        href={visual.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center gap-1 text-white/70 hover:text-white"
                                    >
                                        {labels.open}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
