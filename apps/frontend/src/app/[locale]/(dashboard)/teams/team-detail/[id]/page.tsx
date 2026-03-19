'use client';

export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Users,
    UserPlus,
    Settings,
    Trash2,
    ShieldAlert,
    Zap,
    BarChart3,
    Clock,
    UserCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AgentStatusBadge } from '@/components/team/AgentStatusBadge';
import { RoleBadge } from '@/components/team/RoleBadge';
import { TeamMemberAddDialog } from '@/components/team/TeamMemberAddDialog';
import Link from 'next/link';

export default function TeamDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await api.teams.get(id as string);
                setTeam(res);
            } catch (error) {
                toast({ title: 'Hata', description: 'Ekip bilgileri alınamadı.', variant: 'destructive' });
                router.push('/teams');
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [id]);

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Bu üyeyi ekipten çıkarmak istediğinize emin misiniz?')) return;
        try {
            await api.teams.removeMember(id as string, userId);
            setTeam({
                ...team,
                members: team.members.filter((m: any) => m.user.id !== userId)
            });
            toast({ title: 'Başarılı', description: 'Üye ekipten çıkarıldı.' });
        } catch (error) {
            toast({ title: 'Hata', description: 'Üye çıkarılamadı.', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-muted-foreground font-mono text-center">Ekip verileri senkronize ediliyor...</div>;
    if (!team) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-[1400px] mx-auto">
            {/* Nav */}
            <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground hover:text-foreground h-8" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Geri Dön
            </Button>

            <TeamMemberAddDialog
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                teamId={id as string}
                existingMembers={team.members || []}
                onSuccess={() => {
                    api.teams.get(id as string).then(setTeam).catch(console.error);
                }}
            />

            {/* Header Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                            <Users className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">{team.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] font-bold uppercase">{team.department?.name}</Badge>
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black">{team.assignmentStrategy}</Badge>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-lg italic">
                        {team.description || 'Bu ekip departman hedeflerine ulaşmak için atanmış özel bir çalışma grubudur.'}
                    </p>
                </div>

                <div className="bg-muted/30 rounded-3xl p-6 border border-border/40 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OTOMASYON DURUMU</span>
                        {team.autoAssignmentEnabled ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 font-bold animate-pulse">
                                <Zap className="h-3 w-3 fill-current" /> AKTİF
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-rose-500 border-rose-500/20 font-bold">PASİF</Badge>
                        )}
                    </div>
                    <div className="mt-4">
                        <div className="text-4xl font-black text-foreground">Round Robin</div>
                        <div className="text-xs text-muted-foreground mt-1">Sıralı atama stratejisi uygulanıyor.</div>
                    </div>
                    <Button variant="outline" className="w-full mt-6 h-10 font-bold border-border/60 hover:bg-background">
                        Yapılandır
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content: Members List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-extrabold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> Ekip Üyeleri
                            <span className="text-muted-foreground text-sm font-normal">({team.members?.length || 0})</span>
                        </h2>
                        <Button className="h-9 px-4 font-bold" onClick={() => setIsAddMemberOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Yeni Üye Ekle
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {team.members?.map((m: any) => (
                            <Card key={m.user.id} className="group relative overflow-hidden hover:border-primary/30 transition-all shadow-none bg-card/40 border-border/50">
                                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center border border-border/60 group-hover:scale-105 transition-transform overflow-hidden">
                                        {m.user.avatarUrl ? (
                                            <img src={m.user.avatarUrl} alt={`${m.user.fullName} profil resmi`} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserCircle2 className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-base group-hover:text-primary transition-colors font-bold">{m.user.fullName}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            <RoleBadge role={m.roleOverride || m.user.role} className="text-[10px] h-5" />
                                            <AgentStatusBadge status={m.user.agentStatus} className="text-[10px] h-5" showIcon={false} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase">
                                        <span>Aktif Ticket Yükü</span>
                                        <span className="text-foreground">2 / 5</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-end gap-2 pr-4 pb-4">
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-wider h-8" asChild>
                                        <Link href={`/teams/agents/${m.user.id}`}>PROFİL</Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                                        onClick={() => handleRemoveMember(m.user.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </CardFooter>
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full"><Settings className="h-3 w-3" /></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Stats & Info */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20 shadow-none rounded-3xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tighter">Hızlı İstatistikler</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end border-b border-primary/10 pb-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-primary/60 font-bold uppercase">Online Oranı</span>
                                    <span className="text-2xl font-black">%40</span>
                                </div>
                                <div className="text-primary"><Zap className="h-5 w-5" /></div>
                            </div>
                            <div className="flex justify-between items-end border-b border-primary/10 pb-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-primary/60 font-bold uppercase">Bekleyen Kuyruk</span>
                                    <span className="text-2xl font-black">12</span>
                                </div>
                                <div className="text-primary"><Clock className="h-5 w-5" /></div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-primary/60 font-bold uppercase">Bugün Çözülen</span>
                                    <span className="text-2xl font-black">148</span>
                                </div>
                                <div className="text-primary"><BarChart3 className="h-5 w-5" /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-sm border-border/40 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-rose-500" /> Uyarılar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-3">
                            <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                <p className="font-bold text-amber-700">Fazla Yüklenme</p>
                                <p className="mt-1 opacity-80">2 ajan maksimum (5) ticket limitine ulaştı.</p>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                <p className="font-bold text-emerald-700">SLA Stabil</p>
                                <p className="mt-1 opacity-80">Ekip %100 SLA uyumu ile çalışıyor.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
