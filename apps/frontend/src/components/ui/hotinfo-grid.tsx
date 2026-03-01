import React from 'react';

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

export function HotinfoGrid({ data, variant = 'grid' }: HotinfoGridProps) {
    if (!data) return <div className="text-sm text-muted-foreground p-3">Sistem verisi bulunamadı.</div>;

    const isCompact = variant === 'compact';

    // Layout Classes
    const containerClass = isCompact
        ? "flex flex-col gap-1.5"
        : "grid grid-cols-2 md:grid-cols-3 gap-3";

    const itemWrapperClass = isCompact
        ? "flex justify-between items-start py-1.5 border-b border-white/5 last:border-0"
        : "p-3 rounded-lg bg-white/5 border border-white/10";

    const labelClass = isCompact
        ? "text-[9px] text-slate-500 dark:text-cyan-600/70 uppercase font-bold w-1/3 pt-0.5 shrink-0"
        : "text-[10px] text-slate-500 dark:text-cyan-600/60 uppercase font-bold mb-1";

    const valContainerClass = isCompact
        ? "text-right w-2/3"
        : "";

    const valClass = isCompact
        ? "text-[10px] font-medium text-slate-200 dark:text-cyan-100"
        : "text-sm font-semibold text-slate-200 dark:text-cyan-100";

    const subValClass = isCompact
        ? "text-[9px] text-slate-400 dark:text-cyan-400/80 block mt-0.5"
        : "flex flex-wrap gap-x-4 gap-y-1 mt-2";

    return (
        <div className={containerClass}>
            {/* Allplan Versiyon */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-1' : ''}`}>
                <div className={labelClass}>Allplan Versiyon</div>
                <div className={valContainerClass}>
                    <div className={valClass}>
                        {data.allplanVersion || '-'}
                        {data.allplanEdition && <span className={`${isCompact ? '' : 'ml-1'} text-[9px] text-slate-400 dark:text-cyan-400/70 block sm:inline`}>({data.allplanEdition})</span>}
                    </div>
                    {data.allplanHotfix && <div className={isCompact ? subValClass : "text-[10px] text-brand-400 dark:text-cyan-400 mt-0.5"}>Hotfix: {data.allplanHotfix}</div>}
                </div>
            </div>

            {/* İşletim Sistemi */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-2' : ''}`}>
                <div className={labelClass}>İşletim Sistemi</div>
                <div className={`${valContainerClass} ${isCompact ? '' : 'truncate'}`}>
                    <div className={valClass}>{data.osVersion || '-'}</div>
                </div>
            </div>

            {/* CPU */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-2' : ''}`}>
                <div className={labelClass}>İşlemci (CPU)</div>
                <div className={`${valContainerClass} ${isCompact ? '' : 'truncate'}`} title={data.cpu}>
                    <div className={valClass}>{data.cpu || '-'}</div>
                </div>
            </div>

            {/* RAM */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-1' : ''}`}>
                <div className={labelClass}>RAM</div>
                <div className={valContainerClass}>
                    <div className={valClass}>{data.ram || '-'}</div>
                </div>
            </div>

            {/* GPU & Video Details */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-3' : ''} ${isCompact ? 'flex-col items-start gap-1 py-2' : ''}`}>
                <div className={`${labelClass} ${isCompact ? 'w-full mb-1' : ''}`}>Ekran Kartı / GPU</div>
                <div className={`${valContainerClass} ${isCompact ? 'text-left w-full' : ''}`}>
                    <div className={`${valClass} whitespace-pre-wrap`}>{sr(data.gpu) || '-'}</div>
                    <div className={`${subValClass} ${isCompact ? 'flex flex-row flex-wrap gap-2' : ''}`}>
                        {data.gpuDriverVersion && <span className="text-[9px] text-slate-400 dark:text-cyan-500/80">Driver: <span className="text-slate-300 dark:text-cyan-300">{sr(data.gpuDriverVersion)}</span></span>}
                        {data.openglVersion && <span className="text-[9px] text-slate-400 dark:text-cyan-500/80">OpenGL: <span className="text-slate-300 dark:text-cyan-300">{sr(data.openglVersion)}</span></span>}
                        {data.vram && <span className="text-[9px] text-slate-400 dark:text-cyan-500/80">VRAM: <span className="text-slate-300 dark:text-cyan-300">{sr(data.vram)}</span></span>}
                    </div>
                </div>
            </div>

            {/* Ekran Çözünürlüğü */}
            <div className={itemWrapperClass}>
                <div className={labelClass}>Çözünürlük</div>
                <div className={valContainerClass}>
                    <div className={valClass}>{sr(data.screenResolution) || '-'}</div>
                </div>
            </div>

            {/* Disk Info */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-2' : ''}`}>
                <div className={labelClass}>Disk</div>
                <div className={`${valContainerClass} ${isCompact ? '' : 'truncate'}`} title={sr(data.diskInfo) as string}>
                    <div className={valClass}>{sr(data.diskInfo) || '-'}</div>
                </div>
            </div>

            {/* Lisans Tipi */}
            <div className={itemWrapperClass}>
                <div className={labelClass}>Lisans</div>
                <div className={valContainerClass}>
                    <div className={valClass}>{sr(data.licenseType) || '-'}</div>
                </div>
            </div>

            {/* .NET Framework */}
            <div className={itemWrapperClass}>
                <div className={labelClass}>.NET Framework</div>
                <div className={valContainerClass}>
                    <div className={valClass}>{sr(data.dotnetVersion) || '-'}</div>
                </div>
            </div>

            {/* Ağ Bilgisi */}
            <div className={`${itemWrapperClass} ${!isCompact ? 'md:col-span-3' : ''} ${isCompact ? 'flex-col items-start gap-1 py-2' : ''}`}>
                <div className={`${labelClass} ${isCompact ? 'w-full mb-1' : ''}`}>Ağ Bilgisi</div>
                <div className={`${valContainerClass} ${isCompact ? 'text-left w-full' : ''}`}>
                    <div className={`${valClass} break-words`}>{sr(data.networkInfo) || '-'}</div>
                </div>
            </div>

            {/* Installed Modules */}
            <div className={`${itemWrapperClass} border-b-0 pb-0 ${!isCompact ? 'md:col-span-3' : ''} ${isCompact ? 'flex-col items-start gap-2 pt-2' : ''}`}>
                <div className={`${labelClass} ${isCompact ? 'w-full' : ''}`}>Yüklü Modüller (Max 10)</div>
                <div className={`${valContainerClass} ${isCompact ? 'text-left w-full mt-1' : ''}`}>
                    <div className="flex flex-wrap gap-1.5">
                        {data.installedModules && Array.isArray(data.installedModules) && data.installedModules.length > 0 ? (
                            data.installedModules.slice(0, 10).map((mod: string, i: number) => (
                                <span key={i} className="text-[9px] bg-slate-800 dark:bg-cyan-950/40 border border-slate-700 dark:border-cyan-900/40 px-1.5 py-0.5 rounded text-slate-300 dark:text-cyan-200">
                                    {sr(mod)}
                                </span>
                            ))
                        ) : (
                            <span className={valClass}>-</span>
                        )}
                        {data.installedModules?.length > 10 && (
                            <span className="text-[9px] text-slate-500 dark:text-cyan-600/60 font-medium self-center pl-1">
                                ... +{data.installedModules.length - 10} adet
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
