'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Users, LayoutTemplate, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function TeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [teamsRes, deptsRes, orgsRes] = await Promise.all([
                    api.teams.list(),
                    api.teams.departments(),
                    api.teams.organizations()
                ]);
                setTeams(teamsRes);
                setDepartments(deptsRes);
                setOrganizations(orgsRes);
            } catch (error) {
                toast({ title: 'Fetch Error', description: String(error), variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ekipler</h1>
                    <p className="text-muted-foreground">{organizations.length} Tenancy / {departments.length} Department hierarchy mapped.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Ekip Oluştur
                </Button>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Org & Dept Overview */}
                <div className="border rounded-lg p-4 bg-muted/20">
                    <h2 className="text-lg font-bold flex items-center mb-4"><MapPin className="h-5 w-5 mr-2" /> Departmanlar</h2>
                    <ul className="space-y-2">
                        {departments.map(d => (
                            <li key={d.id} className="text-sm flex justify-between p-2 hover:bg-muted/50 rounded">
                                <span className="font-medium">{d.name} <span className="text-xs text-muted-foreground">({d.organization.name})</span></span>
                                <Badge variant={d.isActive ? 'outline' : 'destructive'}>{d.isActive ? 'Active' : 'Offline'}</Badge>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Team Mapping */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-bold flex items-center mb-4"><Users className="h-5 w-5 mr-2" /> Aktif Ekipler</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ekip</TableHead>
                                <TableHead>Routing</TableHead>
                                <TableHead>Üyeler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={3}>Yükleniyor...</TableCell></TableRow>}
                            {!loading && teams.length === 0 && <TableRow><TableCell colSpan={3}>Kayıt bulunamadı.</TableCell></TableRow>}
                            {teams.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <div className="font-semibold">{t.name}</div>
                                        <div className="text-xs text-muted-foreground">{t.department.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{t.routingLogic}</Badge>
                                    </TableCell>
                                    <TableCell>{t.members?.length || 0} Ajan</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
