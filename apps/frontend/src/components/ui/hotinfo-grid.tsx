import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, Copy, Check, Monitor, HardDrive, Printer, Database, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Ensures mixed XML parsed data is rendered as a clean string.
 * Extracts nested text fields if parsed by fast-xml-parser.
 */
const sr = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'object') {
        return val['@_version'] || val['@_name'] || val['#text'] || JSON.stringify(val);
    }
    return String(val);
};

export interface HotinfoGridProps {
    data: any; // The hotinfo parsed JSON object
    variant?: 'grid' | 'compact';
}

type GraphicsCardSummary = {
    name: string | null;
    vram?: string | null;
    ram?: string | null;
    resolution?: string | null;
    driverDate?: string | null;
    driverVersion?: string | null;
    openglVersion?: string | null;
};

const normalizeGraphicsCards = (data: any): GraphicsCardSummary[] => {
    const cards = Array.isArray(data?.graphicsCards)
        ? data.graphicsCards
            .map((card: any) => ({
                name: sr(card?.name),
                vram: sr(card?.vram),
                ram: sr(card?.ram),
                resolution: sr(card?.resolution),
                driverDate: sr(card?.driverDate),
                driverVersion: sr(card?.driverVersion),
                openglVersion: sr(card?.openglVersion),
            }))
            .filter((card: any) => card.name)
        : [];

    if (cards.length > 0) return cards.slice(0, 2);

    return [{
        name: sr(data?.gpu) || '-',
        vram: sr(data?.vram),
        ram: sr(data?.gpuRam),
        resolution: sr(data?.screenResolution),
        driverDate: sr(data?.gpuDriverDate),
        driverVersion: sr(data?.gpuDriverVersion),
        openglVersion: sr(data?.openglVersion),
    }].filter((card) => card.name && card.name !== '-');
};

export function HotinfoGrid({ data, variant = 'grid' }: HotinfoGridProps) {
    const t = useTranslations('common.hotinfo_labels');
    const [copied, setCopied] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    if (!data) return <div className="text-sm text-muted-foreground p-3">{t('not_found')}</div>;

    const isCompact = variant === 'compact';

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const graphicsCards = normalizeGraphicsCards(data);

    const copyToClipboard = () => {
        const gpuSummary = graphicsCards.map((card, index) => (
            `GPU ${index + 1}: ${card.name} | VRAM: ${card.vram || 'N/A'} | RAM: ${card.ram || 'N/A'} | Resolution: ${card.resolution || 'N/A'} | Driver Date: ${card.driverDate || 'N/A'} | Driver Version: ${card.driverVersion || 'N/A'}`
        ));
        const summary = [
            `Allplan: ${data.allplanVersion} (${data.allplanEdition || 'N/A'}) - Build: ${data.allplanBuildId || 'N/A'}`,
            `OS: ${data.osVersion}`,
            `CPU: ${data.cpu}`,
            `RAM: ${data.ram}`,
            ...gpuSummary,
            `Disk: ${JSON.stringify(data.drives || data.diskInfo)}`,
        ].join('\n');

        navigator.clipboard.writeText(summary);
        setCopied(true);
        toast.success("Özet kopyalandı");
        setTimeout(() => setCopied(false), 2000);
    };

    // Layout Classes
    const containerClass = isCompact
        ? "flex flex-col gap-1.5"
        : "grid grid-cols-2 md:grid-cols-3 gap-3";

    const itemWrapperClass = isCompact
        ? "flex justify-between items-start py-1.5 border-b border-white/5 last:border-0"
        : "p-3 rounded-lg bg-white/5 border border-white/10 relative group";

    const labelClass = isCompact
        ? "text-[9px] text-slate-500 dark:text-cyan-600/70 uppercase font-bold w-1/3 pt-0.5 shrink-0"
        : "text-[10px] text-slate-500 dark:text-cyan-600/60 uppercase font-bold mb-1 flex items-center gap-1.5";

    const valContainerClass = isCompact ? "text-right w-2/3" : "";

    const valClass = isCompact
        ? "text-[10px] font-medium text-slate-200 dark:text-cyan-100"
        : "text-sm font-semibold text-slate-200 dark:text-cyan-100";

    const subValClass = isCompact
        ? "text-[10px] text-slate-300 dark:text-cyan-300/90 block mt-0.5"
        : "flex flex-wrap gap-x-4 gap-y-1.5 mt-2";

    const detailTextClass = "text-[11px] leading-5 text-slate-300 dark:text-cyan-200/90";
    const detailLabelClass = "font-semibold text-slate-400 dark:text-cyan-400/80";

    const SectionHeader = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors mt-2"
        >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 dark:text-cyan-500/80">
                <Icon size={14} className="text-brand-400 dark:text-cyan-400" />
                {label}
            </div>
            {expandedSections[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
    );

    return (
        <div className="space-y-4">
            {!isCompact && (
                <div className="flex justify-end">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={copyToClipboard}
                        className="h-7 text-[10px] gap-1.5 text-slate-400 hover:text-white"
                    >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        {copied ? "KOPYALANDI" : "TÜMÜNÜ KOPYALA"}
                    </Button>
                </div>
            )}

            <div className={containerClass}>
                {/* Allplan Versiyon */}
                <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-1' : ''}`}>
                    <div className={labelClass}>{t('allplan_version')}</div>
                    <div className={valContainerClass}>
                        <div className={valClass}>
                            {data.allplanVersion || '-'}
                            {data.allplanEdition && <span className={`${isCompact ? '' : 'ml-1'} text-[9px] text-slate-400 dark:text-cyan-400/70 block sm:inline`}>({data.allplanEdition})</span>}
                        </div>
                        {data.allplanBuildId && <div className="text-[11px] leading-5 text-slate-300 dark:text-cyan-300/85 mt-1">Build ID: {data.allplanBuildId}</div>}
                        {data.allplanHotfix && <div className={isCompact ? subValClass : "text-[10px] text-brand-400 dark:text-cyan-400 mt-0.5"}>{t('hotfix')}: {data.allplanHotfix}</div>}
                    </div>
                </div>

                {/* İşletim Sistemi */}
                <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-2' : ''}`}>
                    <div className={labelClass}>{t('os')}</div>
                    <div className={`${valContainerClass} ${isCompact ? '' : 'truncate'}`}>
                        <div className={valClass}>{data.osVersion || '-'}</div>
                        {data.envVars?.COMPUTERNAME && !isCompact && (
                            <div className="text-[9px] text-slate-500 dark:text-cyan-700/80 mt-0.5 font-mono">
                                {data.envVars.COMPUTERNAME} \\ {data.envVars.USERNAME}
                            </div>
                        )}
                    </div>
                </div>

                {/* CPU */}
                <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-2' : ''}`}>
                    <div className={labelClass}>{t('cpu')}</div>
                    <div className={`${valContainerClass} ${isCompact ? '' : 'truncate'}`} title={data.cpu}>
                        <div className={valClass}>{data.cpu || '-'}</div>
                    </div>
                </div>

                {/* RAM */}
                <div className={itemWrapperClass}>
                    <div className={labelClass}>{t('ram')}</div>
                    <div className={valContainerClass}>
                        <div className={valClass}>{data.ram || '-'}</div>
                    </div>
                </div>

                {/* GPU & Video Details */}
                <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-3' : ''} ${isCompact ? 'flex-col items-start gap-1 py-2' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                        {(graphicsCards.length > 0 ? graphicsCards : [{ name: '-' }]).map((card: any, index: number) => (
                            <div key={`${card.name}-${index}`} className="border border-cyan-900/25 bg-cyan-950/10 p-3">
                                <div className={`${labelClass} ${isCompact ? 'w-full mb-1' : ''}`}>
                                    <Monitor size={12} className="hidden md:inline mr-1" />
                                    {index + 1} {t('gpu')}
                                </div>
                                <div className={`${valContainerClass} ${isCompact ? 'text-left w-full' : ''}`}>
                                    <div className={`${valClass} whitespace-pre-wrap`}>{card.name || '-'}</div>
                                    <div className={`${subValClass} ${isCompact ? 'flex flex-row flex-wrap gap-2' : ''}`}>
                                        <span className={detailTextClass}><span className={detailLabelClass}>{t('vram')}:</span> {card.vram || '-'}</span>
                                        <span className={detailTextClass}><span className={detailLabelClass}>{t('gpu_ram')}:</span> {card.ram || '-'}</span>
                                        <span className={detailTextClass}><span className={detailLabelClass}>{t('resolution')}:</span> {card.resolution || '-'}</span>
                                        <span className={detailTextClass}><span className={detailLabelClass}>{t('driver_date')}:</span> {card.driverDate || '-'}</span>
                                        <span className={detailTextClass}><span className={detailLabelClass}>{t('driver_version')}:</span> {card.driverVersion || '-'}</span>
                                        {card.openglVersion && <span className={detailTextClass}><span className={detailLabelClass}>{t('opengl')}:</span> {card.openglVersion}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lisans Tipi */}
                <div className={itemWrapperClass}>
                    <div className={labelClass}>{t('license')}</div>
                    <div className={valContainerClass}>
                        <div className={valClass}>{sr(data.licenseType) || '-'}</div>
                    </div>
                </div>

                {/* .NET Framework */}
                <div className={itemWrapperClass}>
                    <div className={labelClass}>{t('dotnet')}</div>
                    <div className={valContainerClass}>
                        <div className={valClass}>{sr(data.dotnetVersion) || '-'}</div>
                    </div>
                </div>
            </div>

            {!isCompact && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Disk Details */}
                    {data.drives && data.drives.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                                <HardDrive size={14} /> {t('drives')}
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-md overflow-hidden">
                                {data.drives.map((drive: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-brand-400 dark:text-cyan-400">{drive.root}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">[{drive.fs}]</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-semibold text-slate-300">{drive.free} / {drive.total}</div>
                                            <div className="text-[9px] text-slate-500">BOŞ / TOPLAM</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Printer List */}
                    {data.printers && data.printers.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                                <Printer size={14} /> {t('printers')}
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-md p-2 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                <div className="flex flex-col gap-1.5">
                                    {data.printers.map((printer: string, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between group/p">
                                            <span className={cn(
                                                "text-[10px] truncate max-w-[80%]",
                                                printer === data.defaultPrinter ? "text-cyan-300 font-bold" : "text-slate-400"
                                            )}>
                                                {printer}
                                            </span>
                                            {printer === data.defaultPrinter && (
                                                <span className="text-[8px] bg-cyan-950/40 text-cyan-500 px-1 rounded border border-cyan-900/40 uppercase">
                                                    {t('default_printer')}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Registry Paths (Collapsible) */}
            {!isCompact && data.registryPaths && Object.keys(data.registryPaths).length > 0 && (
                <div>
                    <SectionHeader id="registry" label={t('registry_paths')} icon={Database} />
                    {expandedSections['registry'] && (
                        <div className="mt-2 p-3 bg-black/20 border border-white/5 rounded-md space-y-2 font-mono">
                            {Object.entries(data.registryPaths).map(([key, val]: any) => (
                                <div key={key} className="text-[10px] flex flex-col sm:flex-row sm:items-start border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                                    <span className="text-brand-400/80 dark:text-cyan-600/80 w-full sm:w-32 shrink-0">{key}:</span>
                                    <span className="text-slate-400 break-all">{val}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Conflicting Processes */}
            {/* Conflicting Processes & Security */}
            {!isCompact && (data.conflictingProcesses?.length > 0 || data.securityServices?.length > 0) && (
                <div className="mt-4 p-3 bg-red-950/10 border border-red-900/20 rounded-md">
                    <div className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center gap-2">
                        ⚠ OLASI ÇAKIŞAN SÜREÇLER & GÜVENLİK
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {data.conflictingProcesses && data.conflictingProcesses.map((p: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-red-950/20 text-red-500 border border-red-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle size={10} /> {p}
                            </span>
                        ))}
                        {data.securityServices && data.securityServices.map((s: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-emerald-950/20 text-emerald-500 border border-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck size={10} /> {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
