'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Mail,
    Clock,
    Award,
    Calendar,
    BarChart3,
    Settings,
    UserCircle2,
    ShieldCheck,
    Trophy,
    Target,
    Zap,
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AgentStatusBadge } from '@/components/team/AgentStatusBadge';
import { RoleBadge } from '@/components/team/RoleBadge';

export default function AgentProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [agent, setAgent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await api.teams.getAgentProfile(id as string);
                setAgent(res);
            } catch (error) {
                toast({ title: 'Hata', description: 'Ajan profili alınamadı.', variant: 'destructive' });
                router.push('/teams');
            } finally {
                setLoading(false);
            }
        };
        fetchAgent();
    }, [id]);

    if (loading) return <div className="p-8 animate-pulse text-muted-foreground font-mono text-center">Profil verileri analiz ediliyor...</div>;
    if (!agent) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-20">
            {/* Header / Cover Area */}
            <div className="relative group">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground h-8" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Ekiplere Dön
                </Button>

                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-tr from-primary to-blue-500 p-1.5 shadow-2xl shadow-primary/20">
                            <div className="h-full w-full rounded-[2.2rem] bg-background flex items-center justify-center overflow-hidden border-4 border-background">
                                {agent.avatarUrl ? (
                                    <img src={agent.avatarUrl} alt={agent.fullName} className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircle2 className="h-16 w-16 text-muted-foreground/30" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <AgentStatusBadge status={agent.agentStatus} className="rounded-2xl px-3 border-4 border-background shadow-lg" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight">{agent.fullName}</h1>
                            <RoleBadge role={agent.role} className="h-7 px-3 rounded-full text-xs font-black uppercase tracking-wider" />
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {agent.email}</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {agent.title || 'Kıdemli Destek Uzmanı'}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {agent.timezone}</span>
                        </div>
                        <p className="text-muted-foreground/80 max-w-2xl text-sm italic leading-relaxed">
                            {agent.bio || 'Müşteri memnuniyeti odaklı, teknik çözüm süreçlerinde 5+ yıl deneyimli uzman.'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button className="font-bold shadow-lg shadow-primary/20 bg-primary h-12 px-6 rounded-2xl">Profili Düzenle</Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border/60"><Settings className="h-5 w-5" /></Button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="h-14 bg-muted/20 border border-border/40 w-full lg:w-fit p-1 rounded-2xl gap-1">
                    <TabsTrigger value="performance" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2">
                        <BarChart3 className="h-4 w-4" /> Performans
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2 text-muted-foreground data-[state=active]:text-foreground">
                        <Users className="h-4 w-4" /> Ekipler ({agent.teamMembers?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2 text-muted-foreground data-[state=active]:text-foreground">
                        <Award className="h-4 w-4" /> Yetkinlikler
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2 text-muted-foreground data-[state=active]:text-foreground">
                        <Calendar className="h-4 w-4" /> Çalışma Takvimi
                    </TabsTrigger>
                </TabsList>

                {/* Performance */}
                <TabsContent value="performance" className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-card/40 border-border/40 rounded-3xl shadow-none">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Ticket İstatistikleri</span>
                                <Badge variant="secondary" className="font-bold">SON 30 GÜN</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center border-t border-border/30">
                            <div className="text-center space-y-2">
                                <Trophy className="h-12 w-12 text-primary/20 mx-auto" />
                                <p className="text-muted-foreground italic text-sm">Performans grafikleri hazırlanıyor.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-3 divide-x border-t border-border/30 p-0">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-black">{agent._count?.ticketsAssigned || 0}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Aktif İş Yükü</div>
                            </div>
                            <div className="p-6 text-center">
                                <div className="text-3xl font-black">4.9/5</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">CSAT Skoru</div>
                            </div>
                            <div className="p-6 text-center">
                                <div className="text-3xl font-black">8dk</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Ort. Yanıt</div>
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-3xl shadow-none">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black uppercase text-emerald-700 flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Başarı Rozetleri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                <Badge className="bg-emerald-500 text-white border-none h-8 px-3">SLA Master</Badge>
                                <Badge className="bg-amber-500 text-white border-none h-8 px-3">Top Rated</Badge>
                                <Badge className="bg-blue-500 text-white border-none h-8 px-3">Hızlı Çözüm</Badge>
                            </CardContent>
                        </Card>
                        <Card className="bg-card shadow-sm border-border/40 rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Hedefler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 uppercase">
                                        <span>Aylık Ticket Kotası</span>
                                        <span>%85</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '85%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 uppercase">
                                        <span>İlk Yanıt SLA Hedefi</span>
                                        <span>%92</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: '92%' }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Teams */}
                <TabsContent value="teams" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agent.teamMembers?.map((tm: any) => (
                            <Card key={tm.team.id} className="hover:border-primary/40 transition-all border-border/40 group overflow-hidden rounded-3xl">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[10px] font-black uppercase text-muted-foreground">{tm.team.department?.name}</Badge>
                                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black">{tm.roleOverride || 'Üye'}</Badge>
                                    </div>
                                    <CardTitle className="mt-3 text-2xl font-extrabold group-hover:text-primary transition-colors">{tm.team.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground font-medium">Katılım: {new Date(tm.joinedAt).toLocaleDateString('tr-TR')}</span>
                                    <Button variant="ghost" size="sm" className="font-bold text-xs h-8 text-primary shadow-none">TAKIMI GÖR</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="pt-6">
                    <Card className="rounded-3xl border-border/40 shadow-none bg-card/30">
                        <CardHeader>
                            <CardTitle>Teknik Yetkinlikler</CardTitle>
                            <CardDescription>Ajanın uzmanlık alanları ve güven seviyeleri.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {agent.agentSkills?.map((as: any) => (
                                    <div key={as.skill.id} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-lg">{as.skill.name}</span>
                                            <span className="text-xs font-black text-primary">SEVİYE {as.proficiency}/10</span>
                                        </div>
                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full" style={{ width: `${as.proficiency * 10}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {agent.agentSkills?.length === 0 && <p className="text-muted-foreground col-span-2 py-8 italic text-center border border-dashed rounded-3xl">Henüz yetkinlik atanmamış.</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-border/30">
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed font-bold hover:bg-background">Yeni Yetkinlik Ekle</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Schedule */}
                <TabsContent value="schedule" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day, idx) => {
                            const shift = agent.shifts?.find((s: any) => s.dayOfWeek === (idx + 1) % 7);
                            return (
                                <Card key={day} className={`rounded-2xl border-border/40 shadow-none ${shift ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 opacity-50'}`}>
                                    <CardHeader className="p-4 text-center border-b border-border/30">
                                        <span className="text-[11px] font-black uppercase tracking-wider">{day}</span>
                                    </CardHeader>
                                    <CardContent className="p-4 text-center">
                                        {shift ? (
                                            <div className="space-y-1">
                                                <div className="text-sm font-black">{shift.startTime}</div>
                                                <div className="text-xs text-muted-foreground">—</div>
                                                <div className="text-sm font-black">{shift.endTime}</div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-muted-foreground">İZİN</span>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
