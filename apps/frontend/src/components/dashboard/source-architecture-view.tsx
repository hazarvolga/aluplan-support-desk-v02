'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import {
    FileText,
    BookOpen,
    Globe,
    Ticket,
    Zap,
    Cpu,
    Compass,
    Database,
    ArrowDown,
    Activity
} from "lucide-react";

interface SourceArchitectureViewProps {
    stats: {
        pillars: {
            DOCUMENTS: number;
            ARTICLES: number;
            URLS: number;
            TICKETS: number;
        };
        totalSources: number;
    };
}

export function SourceArchitectureView({ stats }: SourceArchitectureViewProps) {
    const t = useTranslations('admin.system_topology');

    const pillars = [
        {
            id: 'DOCUMENTS',
            label: t('pillars.documents'),
            icon: FileText,
            layer: t('layers.doc_parser'),
            strategy: t('strategies.parent_child'),
            count: stats.pillars.DOCUMENTS,
            color: 'text-blue-400'
        },
        {
            id: 'ARTICLES',
            label: t('pillars.articles'),
            icon: BookOpen,
            layer: t('layers.rich_editor'),
            strategy: t('strategies.direct_embed'),
            count: stats.pillars.ARTICLES,
            color: 'text-green-400'
        },
        {
            id: 'URLS',
            label: t('pillars.urls'),
            icon: Globe,
            layer: t('layers.crawl_engine'),
            strategy: t('strategies.content_clean'),
            count: stats.pillars.URLS,
            color: 'text-purple-400'
        },
        {
            id: 'TICKETS',
            label: t('pillars.tickets'),
            icon: Ticket,
            layer: t('layers.cluster_engine'),
            strategy: t('strategies.faq_generator'),
            count: stats.pillars.TICKETS,
            color: 'text-orange-400'
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" /> {t('subtitle')}
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary uppercase">
                    {t('total_entropy')}: {stats.totalSources} {t('units')}
                </Badge>
            </div>

            <Card className="border-border/60 bg-black/40 overflow-hidden">
                <CardContent className="p-6">
                    {/* Top Layer: Sources */}
                    <div className="grid grid-cols-4 gap-4">
                        {pillars.map((p) => (
                            <div key={p.id} className="flex flex-col items-center gap-3">
                                <div className={`h-12 w-12 rounded-none border border-border/40 bg-muted/10 flex items-center justify-center ${p.color} shadow-lg shadow-black/40 group relative overflow-hidden`}>
                                    <p.icon className="h-6 w-6 relative z-10" />
                                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{p.label}</p>
                                    <p className="text-[12px] font-mono font-bold mt-0.5">{p.count}</p>
                                </div>
                                <ArrowDown className="h-3 w-3 text-muted-foreground/30" />
                            </div>
                        ))}
                    </div>

                    {/* Middle Layer: Processing Engines */}
                    <div className="grid grid-cols-4 gap-4 mt-2">
                        {pillars.map((p) => (
                            <div key={`${p.id}-engine`} className="flex flex-col items-center">
                                <div className="w-full border border-border/20 p-2 text-center bg-muted/5 min-h-[48px] flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-tighter leading-tight">{p.layer}</p>
                                    <p aria-hidden="true" className="text-[7px] text-muted-foreground/50 mt-0.5 font-mono italic uppercase">{t('status_running')}</p>
                                </div>
                                <ArrowDown className="h-3 w-3 text-muted-foreground/30 mt-2" />
                            </div>
                        ))}
                    </div>

                    {/* Logic Layer: Strategy */}
                    <div className="grid grid-cols-4 gap-4 mt-2">
                        {pillars.map((p) => (
                            <div key={`${p.id}-strategy`} className="flex flex-col items-center">
                                <div className="w-full border border-dashed border-border/30 p-2 text-center bg-black/20 min-h-[32px] flex items-center justify-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter leading-tight">{p.strategy}</p>
                                </div>
                                <div className="h-8 w-[1px] bg-gradient-to-b from-border/30 to-primary/40 mt-2" />
                            </div>
                        ))}
                    </div>

                    {/* Bottom Layer: Vector DB & Retrieval */}
                    <div className="mt-2 text-center relative border border-primary/20 bg-primary/5 p-4">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-4">
                            <div className="h-2 w-2 rounded-full bg-primary/40" />
                            <div className="h-2 w-2 rounded-full bg-primary/40" />
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3">
                                <Database className="h-4 w-4 text-primary" />
                                <span className="text-[11px] font-extrabold uppercase tracking-[0.3em]">{t('vector.unified_index')}</span>
                            </div>
                            <div className="flex gap-4 mt-1">
                                <Badge aria-hidden="true" variant="outline" className="text-[7px] border-primary/20 font-mono uppercase">{t('vector.re_ranking')}</Badge>
                                <Badge aria-hidden="true" variant="outline" className="text-[7px] border-primary/20 font-mono uppercase">{t('vector.trust_priority')}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Output: Retrieval Engine */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center opacity-40">
                                <Compass className="h-4 w-4 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('engine.query_preproc')}</span>
                            </div>
                            <Zap className="h-5 w-5 text-primary animate-pulse" />
                            <div className="flex flex-col items-center">
                                <Cpu className="h-4 w-4 mb-1 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('engine.hybrid_retrieval')}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
