'use client';

import { useState, useEffect, useRef } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
    html: string;
    isLoading?: boolean;
}

export function LivePreview({ html, isLoading }: LivePreviewProps) {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current && html) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(html);
                doc.close();
            }
        }
    }, [html]);

    return (
        <div className="flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.03]">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Önizleme</span>
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('desktop')}
                        className={cn('h-8 px-2 text-[10px]', viewMode === 'desktop' && 'bg-white/10 text-white')}
                    >
                        <Monitor className="h-3.5 w-3.5 mr-1.5" />
                        Masaüstü
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('mobile')}
                        className={cn('h-8 px-2 text-[10px]', viewMode === 'mobile' && 'bg-white/10 text-white')}
                    >
                        <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                        Mobil
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#f8fafc] dark:bg-black/40">
                <div
                    className={cn(
                        "transition-all duration-300 shadow-2xl overflow-hidden bg-white",
                        viewMode === 'desktop' ? "w-full max-w-[800px]" : "w-[375px]"
                    )}
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full min-h-[600px] border-none"
                        title="Email Preview"
                    />
                </div>
            </div>
        </div>
    );
}
