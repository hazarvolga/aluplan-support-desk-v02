'use client';

export const dynamic = "force-dynamic";

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
import { useTranslations } from 'next-intl';

export default function AgentProfilePage() {
    const t = useTranslations('teams');
    const tc = useTranslations('common');
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
                toast({ title: tc('error_title'), description: t('errors.fetch_profile'), variant: 'destructive' });
                router.push('/teams');
            } finally {
                setLoading(false);
            }
        };
        fetchAgent();
    }, [id]);

    if (loading) return <div className="p-8 animate-pulse text-muted-foreground font-mono text-center">{t('loading.agent')}</div>;
    if (!agent) return null;

    const days = [
        t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-20">
            {/* Header / Cover Area */}
            <div className="relative group">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground h-8" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> {t('nav.back_teams')}
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
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {agent.title || t('labels.senior_agent')}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {agent.timezone}</span>
                        </div>
                        <p className="text-muted-foreground/80 max-w-2xl text-sm italic leading-relaxed">
                            {agent.bio || t('labels.default_bio')}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button className="font-bold shadow-lg shadow-primary/20 bg-primary h-12 px-6 rounded-2xl">{t('actions.edit_profile')}</Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border/60"><Settings className="h-5 w-5" /></Button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="h-14 bg-muted/20 border border-border/40 w-full lg:w-fit p-1 rounded-2xl gap-1">
                    <TabsTrigger value="performance" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2">
                        <BarChart3 className="h-4 w-4" /> {t('tabs.performance')}
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2 text-muted-foreground data-[state=active]:text-foreground">
                        <Users className="h-4 w-4" /> {t('tabs.teams')} ({agent.teamMembers?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2 text-muted-foreground data-[state=active]:text-foreground">
                        <Award className="h-4 w-4" /> {t('tabs.skills')}
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="px-6 rounded-xl data-[state=active]:bg-background font-bold gap-2 text-muted-foreground data-[state=active]:text-foreground">
                        <Calendar className="h-4 w-4" /> {t('tabs.schedule')}
                    </TabsTrigger>
                </TabsList>

                {/* Performance */}
                <TabsContent value="performance" className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-card/40 border-border/40 rounded-3xl shadow-none">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>{t('stats.tickets')}</span>
                                <Badge variant="secondary" className="font-bold">{t('stats.last_30_days')}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center border-t border-border/30">
                            <div className="text-center space-y-2">
                                <Trophy className="h-12 w-12 text-primary/20 mx-auto" />
                                <p className="text-muted-foreground italic text-sm">{t('labels.preparing_charts')}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center border-t border-border/30 p-0">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-black">{agent._count?.ticketsAssigned || 0}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{t('stats.active_load')}</div>
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="space-y-6">
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
                                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black">{tm.roleOverride || t('labels.member')}</Badge>
                                    </div>
                                    <CardTitle className="mt-3 text-2xl font-extrabold group-hover:text-primary transition-colors">{tm.team.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground font-medium">{t('labels.joined_at', { date: new Date(tm.joinedAt).toLocaleDateString() })}</span>
                                    <Button variant="ghost" size="sm" className="font-bold text-xs h-8 text-primary shadow-none">{t('actions.view_team')}</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="pt-6">
                    <Card className="rounded-3xl border-border/40 shadow-none bg-card/30">
                        <CardHeader>
                            <CardTitle>{t('labels.technical_skills')}</CardTitle>
                            <CardDescription>{t('labels.skills_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {agent.agentSkills?.map((as: any) => (
                                    <div key={as.skill.id} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-lg">{as.skill.name}</span>
                                            <span className="text-xs font-black text-primary">{t('labels.level_prefix')} {as.proficiency}/10</span>
                                        </div>
                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full" style={{ width: `${as.proficiency * 10}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {agent.agentSkills?.length === 0 && <p className="text-muted-foreground col-span-2 py-8 italic text-center border border-dashed rounded-3xl">{t('labels.no_skills')}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-border/30">
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed font-bold hover:bg-background">{t('actions.add_skill')}</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Schedule */}
                <TabsContent value="schedule" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {days.map((day, idx) => {
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
                                            <span className="text-[10px] font-bold text-muted-foreground">{t('labels.leave')}</span>
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
