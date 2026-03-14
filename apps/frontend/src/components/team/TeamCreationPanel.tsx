'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, ShieldCheck, Zap } from 'lucide-react';

interface TeamCreationPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const TeamCreationPanel: React.FC<TeamCreationPanelProps> = ({ open, onOpenChange, onSuccess }) => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        departmentId: '',
        customerId: '',
        assignmentStrategy: 'ROUND_ROBIN',
        autoAssignmentEnabled: true
    });
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            Promise.all([
                api.teams.departments(),
                api.customers.list()
            ]).then(([depts, custs]) => {
                setDepartments(depts);
                setCustomers(custs);
            }).catch(() => {
                toast({ title: 'Hata', description: 'Veriler yüklenemedi.', variant: 'destructive' });
            });
        }
    }, [open, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.departmentId) {
            toast({ title: 'Hata', description: 'Lütfen bir departman seçin.', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            await api.teams.create(formData);
            toast({ title: 'Başarılı', description: 'Yeni ekip başarıyla oluşturuldu.' });
            onSuccess();
            onOpenChange(false);
            setFormData({
                name: '',
                description: '',
                departmentId: '',
                customerId: '',
                assignmentStrategy: 'ROUND_ROBIN',
                autoAssignmentEnabled: true
            });
        } catch (error) {
            toast({ title: 'Hata', description: 'Ekip oluşturulurken bir hata oluştu.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border border-border/40 rounded-3xl shadow-2xl">
                <DialogHeader className="space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 text-center">
                        <DialogTitle className="text-2xl font-black">Yeni Ekip Oluştur</DialogTitle>
                        <DialogDescription className="text-xs">
                            Operasyonel süreçleri yönetmek için yeni bir ekip tanımlayın.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ekip İsmi</Label>
                        <Input
                            id="name"
                            placeholder="Örn: Teknik Destek - Seviye 2"
                            className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 shadow-none text-sm font-medium"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dept" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Departman</Label>
                        <Select
                            value={formData.departmentId}
                            onValueChange={val => setFormData({ ...formData, departmentId: val })}
                        >
                            <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none shadow-none text-sm font-medium">
                                <SelectValue placeholder="Departman seçin" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                {departments.map(d => (
                                    <SelectItem key={d.id} value={d.id} className="rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3 w-3 opacity-50" /> {d.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Müşteri (Opsiyonel)</Label>
                        <Select
                            value={formData.customerId}
                            onValueChange={val => setFormData({ ...formData, customerId: val })}
                        >
                            <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none shadow-none text-sm font-medium">
                                <SelectValue placeholder="Müşteri seçin" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id} className="rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-3 w-3 opacity-50" /> {c.user?.fullName || c.name || 'İsimsiz Müşteri'}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Açıklama</Label>
                        <Textarea
                            id="desc"
                            placeholder="Ekibin görev tanımı..."
                            className="min-h-[80px] rounded-xl bg-muted/30 border-none shadow-none resize-none text-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/20">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-blue-500" /> Otomatik Atama
                                </Label>
                                <p className="text-[10px] text-muted-foreground">Yeni ticketlar bu ekibe otomatik atanır.</p>
                            </div>
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-none bg-muted/50 accent-primary cursor-pointer shadow-none"
                                checked={formData.autoAssignmentEnabled}
                                onChange={e => setFormData({ ...formData, autoAssignmentEnabled: e.target.checked })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Atama Stratejisi</Label>
                            <Select
                                value={formData.assignmentStrategy}
                                onValueChange={val => setFormData({ ...formData, assignmentStrategy: val })}
                            >
                                <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-none shadow-none text-sm font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                    <SelectItem value="ROUND_ROBIN" className="rounded-lg">Round Robin (Sıralı)</SelectItem>
                                    <SelectItem value="LEAST_LOADED" className="rounded-lg">Least Loaded (Yük Bazlı)</SelectItem>
                                    <SelectItem value="SKILL_BASED" className="rounded-lg">Skill Based (Yetenek Bazlı)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? 'Oluşturuluyor...' : 'Ekibi Başlat'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
