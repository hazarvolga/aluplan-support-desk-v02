'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ShieldCheck,
    Clock,
    Users,
    Settings2,
    Calendar,
    ArrowUpRight,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AgentStatusBadge } from '@/components/team/AgentStatusBadge';
import Link from 'next/link';

export default function DepartmentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [dept, setDept] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDept = async () => {
            try {
                const res = await api.teams.getDepartment(id as string);
                setDept(res);
            } catch (error) {
                toast({ title: 'Hata', description: 'Departman bilgileri alınamadı.', variant: 'destructive' });
                router.push('/teams');
            } finally {
                setLoading(false);
            }
        };
        fetchDept();
    }, [id]);

    if (loading) return <div className="p-8 animate-pulse text-muted-foreground font-mono">Departman verileri yükleniyor...</div>;
    if (!dept) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground hover:text-foreground h-8" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Geri Dön
                </Button>
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight">{dept.name}</h1>
                            <Badge variant="outline" className="h-6 font-mono bg-primary/5 text-primary border-primary/20">
                                {dept.slug}
                            </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            {dept.description || 'Bu departman organizasyonun temel destek kollarından biridir.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="h-10 border-border/60 shadow-none font-bold">
                            <Settings2 className="mr-2 h-4 w-4" /> Departmanı Düzenle
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="h-12 bg-muted/30 border-b border-border/40 w-full justify-start rounded-none px-0 gap-8 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="overview" className="px-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none font-bold">Genel Bakış</TabsTrigger>
                    <TabsTrigger value="teams" className="px-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none font-bold text-muted-foreground data-[state=active]:text-foreground">Ekipler ({dept.teams?.length || 0})</TabsTrigger>
                    <TabsTrigger value="sla" className="px-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none font-bold text-muted-foreground data-[state=active]:text-foreground">SLA Politikaları</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-card/50 border-border/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">Aktif Ekipler</CardDescription>
                                <CardTitle className="text-3xl font-black">{dept.teams?.length || 0}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3 text-emerald-500" /> +0 geçen ay
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-border/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">Toplam Ajan</CardDescription>
                                <CardTitle className="text-3xl font-black">24</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="h-3 w-3" /> 8 Aktif Online
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-border/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">Ort. Yanıt Süresi</CardDescription>
                                <CardTitle className="text-3xl font-black">12dk</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                                    Normalin üzerinde (+2dk)
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-border/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-[11px] font-bold uppercase tracking-wider">SLA Uyumu</CardDescription>
                                <CardTitle className="text-3xl font-black">%98.2</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
                                    Yüksek Performans
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card/50 border-border/40 min-h-[300px]">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" /> Son Aktiviteler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-48 text-muted-foreground italic text-sm">
                                Aktivite grafiği yakında eklenecek.
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-border/40">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-amber-500" /> Kritik SLA Hedefleri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {dept.slaPolicies?.map((sla: any) => (
                                    <div key={sla.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/30">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{sla.name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{sla.priority} ÖNCELİK</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold">İLK YANIT</div>
                                                <div className="text-sm font-black">{sla.firstResponseMinutes}dk</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold">ÇÖZÜM</div>
                                                <div className="text-sm font-black">{sla.resolutionMinutes}dk</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Teams List */}
                <TabsContent value="teams" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dept.teams?.map((team: any) => (
                            <Card key={team.id} className="group hover:border-primary/40 transition-all border-border/40 shadow-none">
                                <CardHeader className="flex flex-row justify-between items-start pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors cursor-pointer">{team.name}</CardTitle>
                                        <CardDescription>{team.assignmentStrategy}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                                        <Link href={`/teams/team-detail/${team.id}`}>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" /> {team._count?.members || 0} Ajan
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" /> {team.autoAssignmentEnabled ? 'Oto-Atama Açık' : 'Manuel Atama'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* SLA Policies */}
                <TabsContent value="sla" className="pt-6">
                    <Card className="bg-card/30 border-dashed border-2">
                        <CardHeader>
                            <CardTitle>SLA Yapılandırması</CardTitle>
                            <CardDescription>Departman genelindeki hizmet seviyesi hedefleri.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dept.slaPolicies?.map((sla: any) => (
                                    <div key={sla.id} className="grid grid-cols-4 p-4 rounded-xl bg-muted/20 border border-border/50 items-center">
                                        <div className="col-span-1">
                                            <div className="font-black text-lg">{sla.name}</div>
                                            <Badge variant="outline" className="text-[10px]">{sla.priority}</Badge>
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <div className="text-[11px] text-muted-foreground font-bold uppercase">İlk Yanıt</div>
                                            <div className="text-xl font-black">{sla.firstResponseMinutes} dk</div>
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <div className="text-[11px] text-muted-foreground font-bold uppercase">Çözüm Süresi</div>
                                            <div className="text-xl font-black">{sla.resolutionMinutes} dk</div>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-primary">DÜZENLE</Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-dashed h-12 text-muted-foreground hover:text-primary transition-colors">
                                    <Plus className="mr-2 h-4 w-4" /> Yeni SLA Politikası Ekle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
