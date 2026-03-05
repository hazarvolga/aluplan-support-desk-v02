'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SourceArchitectureView } from '@/components/dashboard/source-architecture-view';

export default function SystemTopologyPage() {
    const [sourceStats, setSourceStats] = useState({
        pillars: {
            DOCUMENTS: 0,
            ARTICLES: 0,
            URLS: 0,
            TICKETS: 0
        },
        totalSources: 0
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const load = async () => {
        setLoading(true);
        try {
            const sourceRes = await api.ai.getSourcesStats();
            setSourceStats(sourceRes);
        } catch (error) {
            toast({
                title: 'Data sync error',
                description: String(error),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight uppercase flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Sistem Kaynak Topolojisi
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">
                        SİSTEM_KAYNAK_TOPOLOJİSİ: VERİ AKIŞI VE İŞLEME MİMARİSİ
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={load}
                    className="h-8 text-[10px] uppercase font-bold tracking-widest border-border/40 rounded-none"
                    disabled={loading}
                >
                    <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    YENİLE
                </Button>
            </div>

            <div className="max-w-5xl mx-auto py-8">
                <SourceArchitectureView stats={sourceStats} />
            </div>
        </div>
    );
}
