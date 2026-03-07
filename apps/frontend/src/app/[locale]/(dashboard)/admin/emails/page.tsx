'use client';

export const dynamic = "force-dynamic";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, History, FileText } from 'lucide-react';
import { EmailTemplates } from '../settings/components/EmailTemplates';
import { EmailLogs } from '../settings/components/EmailLogs';

export default function EmailsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">E-Posta Yönetimi</h1>
                <p className="text-muted-foreground">MJML şablonlarını düzenleyin, yeni şablonlar oluşturun ve gönderim geçmişini takip edin.</p>
            </div>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Şablon Editör
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> Gönderim Geçmişi
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
