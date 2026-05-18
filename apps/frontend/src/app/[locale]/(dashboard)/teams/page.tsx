'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Users,
    Building2,
    UserCircle2,
    ChevronRight,
    Search,
    ShieldCheck,
    Clock,
    Zap,
    UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AgentStatusBadge } from '@/components/team/AgentStatusBadge';
import { RoleBadge } from '@/components/team/RoleBadge';
import { TeamCreationPanel } from '@/components/team/TeamCreationPanel';
import { UserDialog } from '@/components/users/user-dialog';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function TeamsPage() {
    const t = useTranslations('teams');
    const tc = useTranslations('common');
    const [teams, setTeams] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [createPanelOpen, setCreatePanelOpen] = useState(false);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('departments');
    const { toast } = useToast();

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [teamsRes, deptsRes] = await Promise.all([
                api.teams.list(),
                api.teams.departments()
            ]);
            setTeams(teamsRes);
            setDepartments(deptsRes);
        } catch (error) {
            toast({ title: tc('error_title'), description: t('fetch_error'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 p-1">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {t('labels.command_center')}
                    </h1>
                    <p className="text-foreground/70 text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {t('labels.organization')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('search_placeholder')}
                            className="pl-9 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {activeTab === 'agents' ? (
                        <Button className="h-10 px-4 bg-primary hover:bg-primary/90" onClick={() => setUserDialogOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" /> {t('actions.add_agent')}
                        </Button>
                    ) : (
                        <Button className="h-10 px-4 bg-primary hover:bg-primary/90" onClick={() => setCreatePanelOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> {t('actions.add_team')}
                        </Button>
                    )}
                </div>
            </div>

            <TeamCreationPanel
                open={createPanelOpen}
                onOpenChange={setCreatePanelOpen}
                onSuccess={fetchAll}
            />

            <UserDialog
                open={userDialogOpen}
                onOpenChange={setUserDialogOpen}
                onSuccess={fetchAll}
            />

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full md:w-[400px] h-12 p-1 bg-muted/50">
                    <TabsTrigger value="departments" className="gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Building2 className="h-4 w-4" /> {t('tabs.departments')}
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="h-4 w-4" /> {t('tabs.teams')}
                    </TabsTrigger>
                    <TabsTrigger value="agents" className="gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <UserCircle2 className="h-4 w-4" /> {t('tabs.agents')}
                    </TabsTrigger>
                </TabsList>

                {/* Departments Content */}
                <TabsContent value="departments" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && [1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse bg-muted/20 h-48 border-dashed" />
                        ))}
                        {!loading && departments.map(dept => (
                            <Card key={dept.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {dept.slug}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                                        {dept.name}
                                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px] text-foreground/75">
                                        {dept.description || t('no_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-foreground/65 uppercase font-bold tracking-tight">{t('tabs.teams')}</span>
                                            <span className="text-xl font-bold">{dept._count?.teams || 0}</span>
                                        </div>
                                        <div className="w-px h-10 bg-border/50" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-foreground/65 uppercase font-bold tracking-tight">{t('tabs.sla_policies')}</span>
                                            <span className="text-xl font-bold">{dept.slaPolicies?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {dept.slaPolicies?.slice(0, 2).map((sla: any) => (
                                            <Badge key={sla.id} variant="secondary" className="text-[10px] gap-1 px-2 py-0 h-6 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                <Clock className="h-3 w-3" /> {sla.priority}: {sla.firstResponseMinutes}{t('min_suffix')}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/30 py-3 flex justify-between border-t border-border/40">
                                    <span className="text-xs text-foreground/65 font-medium">{t('labels.recent_activity')}</span>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold hover:bg-background shadow-none px-3" asChild>
                                        <Link href={`/teams/departments/${dept.id}`}>{t('actions.details')}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Teams Content */}
                <TabsContent value="teams" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map(team => (
                            <Card key={team.id} className="group overflow-hidden border-border/50 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <Badge variant="outline" className="text-[10px] font-bold bg-muted/50">
                                            {team.department?.name}
                                        </Badge>
                                        {team.autoAssignmentEnabled && (
                                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] h-5 px-1.5 animate-pulse">
                                                <Zap className="h-3 w-3 mr-1 fill-current" /> {t('labels.auto_assignment')}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg flex justify-between items-center">
                                        {team.name}
                                        <span className="text-foreground/70 text-sm font-normal">#{team.members?.length || 0} {t('tabs.agents')}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex -space-x-2 overflow-hidden py-2 mb-4">
                                        {team.members?.slice(0, 5).map((m: any) => (
                                            <div key={m.user.id} className="inline-block h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden ring-1 ring-border/50">
                                                {m.user.avatarUrl ? (
                                                    <img src={m.user.avatarUrl} alt={`${m.user.fullName} ${t('profile_pic_alt')}`} />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-foreground/70 uppercase">
                                                        {m.user.fullName.substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {team.members?.length > 5 && (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-slate-100 text-[10px] font-bold text-slate-500 ring-1 ring-border/50">
                                                +{team.members.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-foreground/70 flex items-center gap-1">
                                            <ShieldCheck className="h-3.5 w-3.5" /> {t('labels.strategy')}
                                        </span>
                                        <span className="font-bold text-blue-600">{team.assignmentStrategy}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-blue-50/10 border-t border-border/40 py-3">
                                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs font-bold hover:bg-background" asChild>
                                        <Link href={`/teams/team-detail/${team.id}`}>{t('actions.manage_team')}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Agents Content */}
                <TabsContent value="agents" className="mt-6">
                    <div className="border rounded-xl overflow-hidden bg-card/30 backdrop-blur-md border-border/50 shadow-xl shadow-foreground/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground/65">{t('labels.agent')}</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground/65">{t('labels.status')}</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground/65">{t('labels.role')}</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground/65 text-center">{t('labels.active_ticket_load')}</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground/65">{t('labels.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {teams.flatMap(t => t.members).map((m: any) => (
                                    <tr key={m.user.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                                                    {m.user.avatarUrl ? (
                                                        <img src={m.user.avatarUrl} className="rounded-xl" alt={`${m.user.fullName} ${t('profile_pic_alt')}`} />
                                                    ) : (
                                                        <UserCircle2 className="h-5 w-5 text-foreground/65" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground/90 group-hover:text-primary transition-colors">{m.user.fullName}</span>
                                                    <span className="text-xs text-foreground/70">{m.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <AgentStatusBadge status={m.user.agentStatus} className="shadow-none" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={m.roleOverride || m.user.role} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((m.user._count?.ticketsAssigned || 0) / 5) * 100)}%` }} />
                                                </div>
                                                <span className="text-[11px] font-bold text-foreground/70">{m.user._count?.ticketsAssigned || 0} / 5</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold shadow-none hover:bg-primary hover:text-white transition-all border-border/60" asChild>
                                                <Link href={`/teams/agents/${m.user.id}`}>{t('actions.view_profile')}</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
