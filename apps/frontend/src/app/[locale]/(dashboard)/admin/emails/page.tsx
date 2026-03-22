'use client';

export const dynamic = "force-dynamic";

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, History, FileText } from 'lucide-react';
import { EmailTemplates } from '../settings/components/EmailTemplates';
import { EmailLogs } from '../settings/components/EmailLogs';

export default function EmailsPage() {
    const t = useTranslations('admin.emails');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> {t('tabs.templates')}
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> {t('tabs.logs')}
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                    <TabsContent value="templates" className="space-y-4 outline-none">
                        <EmailTemplates />
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4 outline-none">
                        <EmailLogs />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
