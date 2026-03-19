'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TeamMemberAddDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId: string;
    existingMembers: any[];
    onSuccess: () => void;
}

export function TeamMemberAddDialog({
    open,
    onOpenChange,
    teamId,
    existingMembers,
    onSuccess
}: TeamMemberAddDialogProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [roleOverride, setRoleOverride] = useState<string>('AGENT');
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchUsers();
            setSelectedUserId('');
            setRoleOverride('AGENT');
            setError(null);
        }
    }, [open]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Provide fallback empty array to prevent map errors if endpoint fails
            const response = await api.users.list().catch(() => []);
            // Filter out users already in the team
            const existingIds = existingMembers.map(m => m.user?.id || m.userId);
            const available = response.filter((u: any) => !existingIds.includes(u.id));
            setUsers(available);
        } catch (err: any) {
            setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedUserId) {
            setError('Lütfen bir ajan seçin.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await api.teams.addMember(teamId, {
                userId: selectedUserId,
                roleOverride: roleOverride
            });

            toast({ title: 'Başarılı', description: 'Ekibe yeni üye başarıyla eklendi.' });
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || 'Üye eklenirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Ajan Ata</DialogTitle>
                    <DialogDescription>
                        Ekibe sistemde kayıtlı olan bir kullanıcıyı ajan olarak atayın.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {error && (
                        <div className="p-3 text-[13px] rounded-md bg-destructive/10 text-destructive font-medium border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="user">Kullanıcı (Ajan)</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loading || submitting}>
                            <SelectTrigger id="user">
                                <SelectValue placeholder={loading ? "Kullanıcılar yükleniyor..." : "Bir kullanıcı seçin"} />
                            </SelectTrigger>
                            <SelectContent>
                                {users.length === 0 && !loading && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">Atanabilecek yeni kullanıcı bulunamadı.</div>
                                )}
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.fullName} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Ekip İçi Rolü</Label>
                        <Select value={roleOverride} onValueChange={setRoleOverride} disabled={submitting}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Rol seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AGENT">Standart Ajan</SelectItem>
                                <SelectItem value="SENIOR_AGENT">Kıdemli Ajan</SelectItem>
                                <SelectItem value="TEAM_LEAD">Takım Lideri</SelectItem>
                                <SelectItem value="DEPARTMENT_MANAGER">Departman Yöneticisi</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">Bu rol sadece bu ekip içindeki yetkilerini belirler.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        İptal
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !selectedUserId}>
                        {submitting ? 'Ekleniyor...' : 'Ekibe Ata'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
