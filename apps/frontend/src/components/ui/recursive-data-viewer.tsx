import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RecursiveDataViewerProps {
    data: any;
    name?: string;
    level?: number;
    className?: string;
}

export function RecursiveDataViewer({ data, name, level = 0, className }: RecursiveDataViewerProps) {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
    const isObject = data !== null && typeof data === 'object' && !Array.isArray(data);
    const isArray = Array.isArray(data);

    if (!isObject && !isArray) {
        return (
            <div className={cn("flex justify-between py-1 px-3 border-b border-cyan-900/20 last:border-0 hover:bg-cyan-950/20 transition-colors", className)}>
                {name && <span className="font-semibold text-cyan-500/80 mr-4 break-words">{name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase()}</span>}
                <span className="text-cyan-100/90 break-words self-end text-right">{String(data)}</span>
            </div>
        );
    }

    const isEmpty = isObject ? Object.keys(data).length === 0 : data.length === 0;

    if (isEmpty) {
        return (
            <div className={cn("flex justify-between py-1 px-3 border-b border-cyan-900/20 last:border-0", className)}>
                {name && <span className="font-semibold text-cyan-500/80 mr-4 break-words">{name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase()}</span>}
                <span className="text-cyan-500/50 italic">{isArray ? '[]' : '{}'}</span>
            </div>
        );
    }

    return (
        <div className={cn("border-b border-cyan-900/20 last:border-0", className)}>
            {name && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center gap-1.5 py-1.5 px-3 hover:bg-cyan-950/30 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-cyan-500/60" />
                    ) : (
                        <ChevronRight className="h-3 w-3 text-cyan-500/60" />
                    )}
                    <span className="font-semibold text-cyan-500/90 break-words">{name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase()}</span>
                    <span className="text-[9px] text-cyan-600/60 font-mono ml-2">
                        {isArray ? `[${data.length}]` : `{${Object.keys(data).length}}`}
                    </span>
                </button>
            )}

            {(!name || isExpanded) && (
                <div className={cn(
                    "flex flex-col w-full text-[10px] text-left",
                    name ? "pl-4 border-l border-cyan-900/30 my-1 ml-4" : ""
                )}>
                    {isObject && Object.entries(data).map(([key, value], idx) => (
                        <RecursiveDataViewer
                            key={idx}
                            name={key}
                            data={value}
                            level={level + 1}
                        />
                    ))}
                    {isArray && data.map((item, idx) => (
                        <RecursiveDataViewer
                            key={idx}
                            name={`[${idx}]`}
                            data={item}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
