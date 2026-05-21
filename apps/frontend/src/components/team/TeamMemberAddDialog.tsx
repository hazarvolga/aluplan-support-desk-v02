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
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const t = useTranslations('teams');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userPickerOpen, setUserPickerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [roleOverride, setRoleOverride] = useState<string>('AGENT');
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchUsers();
            setSelectedUserId('');
            setRoleOverride('AGENT');
            setUserPickerOpen(false);
            setError(null);
        }
    }, [open]);

    const getRoleName = (user: any) => {
        if (typeof user?.role === 'string') return user.role;
        if (user?.role?.name) return user.role.name;
        if (Array.isArray(user?.roles) && user.roles.length > 0) return user.roles[0];
        if (Array.isArray(user?.userRoles) && user.userRoles.length > 0) return user.userRoles[0]?.role?.name;
        return '';
    };

    const isStaffCandidate = (user: any) => {
        const roleName = String(getRoleName(user)).toUpperCase();
        return roleName !== 'CUSTOMER' && roleName !== 'VIEWER';
    };

    const formatUserLabel = (user: any) => user?.fullName || user?.email || 'Unknown user';

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.users.list('agent').catch(() => []);
            const existingIds = existingMembers.map(m => m.user?.id || m.userId);
            const available = response
                .filter((u: any) => !existingIds.includes(u.id))
                .filter(isStaffCandidate)
                .sort((a: any, b: any) => formatUserLabel(a).localeCompare(formatUserLabel(b)));
            setUsers(available);
        } catch (err: any) {
            setError(err.message || 'Users could not be loaded.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedUserId) {
            setError(t('member_add.error_select'));
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await api.teams.addMember(teamId, {
                userId: selectedUserId,
                roleOverride: roleOverride
            });

            toast({ title: 'Başarılı', description: t('member_add.success') });
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || t('member_add.error_server'));
        } finally {
            setSubmitting(false);
        }
    };

    const selectedUser = users.find(user => user.id === selectedUserId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('member_add.title')}</DialogTitle>
                    <DialogDescription>
                        {t('member_add.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {error && (
                        <div className="p-3 text-[13px] rounded-md bg-destructive/10 text-destructive font-medium border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="user">{t('member_add.select_agent')}</Label>
                        <Popover open={userPickerOpen} onOpenChange={setUserPickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="user"
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={userPickerOpen}
                                    disabled={loading || submitting}
                                    className="h-10 w-full justify-between rounded-none border-border/70 bg-background/60 px-3 text-left"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            {t('member_add.loading_users')}
                                        </span>
                                    ) : selectedUser ? (
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-xs font-bold text-foreground">{formatUserLabel(selectedUser)}</span>
                                            <span className="block truncate text-[10px] font-medium text-muted-foreground">{selectedUser.email}</span>
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">{t('member_add.select_agent_placeholder')}</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[360px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder={t('member_add.select_agent_placeholder')} />
                                    <CommandList className="max-h-[280px]">
                                        <CommandEmpty>{t('member_add.no_users')}</CommandEmpty>
                                        <CommandGroup>
                                            {users.map(user => {
                                                const label = formatUserLabel(user);
                                                const roleName = getRoleName(user);

                                                return (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={`${label} ${user.email || ''} ${roleName}`}
                                                        onSelect={() => {
                                                            setSelectedUserId(user.id);
                                                            setUserPickerOpen(false);
                                                        }}
                                                        className="cursor-pointer items-start gap-2 py-2"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mt-0.5 h-4 w-4 shrink-0",
                                                                selectedUserId === user.id ? "opacity-100" : "opacity-0",
                                                            )}
                                                        />
                                                        <span className="min-w-0 flex flex-col">
                                                            <span className="truncate text-xs font-bold text-foreground">{label}</span>
                                                            <span className="truncate text-[10px] font-medium text-muted-foreground">{user.email}</span>
                                                            {roleName ? (
                                                                <span className="mt-1 w-fit border border-border/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                    {roleName}
                                                                </span>
                                                            ) : null}
                                                        </span>
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">{t('member_add.role')}</Label>
                        <Select value={roleOverride} onValueChange={setRoleOverride} disabled={submitting}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder={t('member_add.select_role')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AGENT">{t('roles.agent')}</SelectItem>
                                <SelectItem value="SENIOR_AGENT">{t('roles.senior_agent')}</SelectItem>
                                <SelectItem value="TEAM_LEAD">{t('roles.team_lead')}</SelectItem>
                                <SelectItem value="DEPARTMENT_MANAGER">{t('roles.department_manager')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">{t('member_add.role_desc')}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        {t('member_add.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !selectedUserId}>
                        {submitting ? t('member_add.submitting') : t('member_add.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
