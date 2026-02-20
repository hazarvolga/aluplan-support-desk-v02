'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { UserDialog } from '@/components/users/user-dialog';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.users.list();
            setUsers(res);
        } catch (error) {
            toast({ title: 'Error fetching users', description: String(error), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await api.users.delete(id);
            toast({ title: 'User deleted' });
            fetchUsers();
        } catch (error) {
            toast({ title: 'Error', description: String(error), variant: 'destructive' });
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground">Manage support agents, managers, and admins.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && <TableRow><TableCell colSpan={4} className="text-center py-4">Loading...</TableCell></TableRow>}
                        {!loading && users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-4">No users found</TableCell></TableRow>}

                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{user.fullName}</div>
                                </TableCell>
                                <TableCell>
                                    {(user.roles || user.userRoles || []).map((r: any) => (
                                        <Badge key={r.role.id} variant="outline" className="mr-1">
                                            {r.role.name}
                                        </Badge>
                                    ))}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(user)}>
                                        <Pencil className="h-4 w-4 text-slate-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(user.id, user.fullName)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {dialogOpen && (
                <UserDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    user={editingUser}
                    onSuccess={fetchUsers}
                />
            )}
        </div>
    );
}
