'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserCheck, Info } from 'lucide-react';

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: any; // If provided, edit mode
    onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
    const t = useTranslations('users');
    const tc = useTranslations('common');
    const { toast } = useToast();
    const isEdit = !!user;
    const [foundUser, setFoundUser] = useState<any>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);

    const formSchema = z.object({
        fullName: z.string().min(2, t('validation.name_min')),
        email: z.string().email(t('validation.email_invalid')),
        password: z.string().min(6, t('validation.password_min')).optional().or(z.literal('')),
        role: z.string(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
            password: '',
            role: (user?.roles || user?.userRoles)?.[0]?.role?.name || 'support_agent',
        },
    });

    const email = form.watch('email');

    useEffect(() => {
        if (isEdit || !email || email.length < 5 || !email.includes('@')) {
            setFoundUser(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLookingUp(true);
            try {
                const res = await api.users.lookup(email);
                if (res) {
                    setFoundUser(res);
                    // Pre-fill name if it was empty
                    if (!form.getValues('fullName')) {
                        form.setValue('fullName', res.fullName);
                    }
                } else {
                    setFoundUser(null);
                }
            } catch (error) {
                console.error('Lookup failed', error);
                setFoundUser(null);
            } finally {
                setIsLookingUp(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [email, isEdit, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const payload: any = {
                fullName: values.fullName,
                email: values.email,
                roles: [values.role],
            };

            if (values.password && values.password.length > 0) {
                payload.password = values.password;
            } else if (!isEdit && !foundUser) {
                toast({ title: t('validation.password_required'), variant: 'destructive' });
                return;
            }

            if (isEdit || foundUser) {
                const targetId = isEdit ? user.id : foundUser.id;
                await api.users.update(targetId, payload);
                toast({ title: foundUser && !isEdit ? 'Kullanıcı yükseltildi/güncellendi' : t('toasts.updated') });
            } else {
                await api.users.create(payload);
                toast({ title: t('toasts.created') });
            }
            onSuccess();
            onOpenChange(false);
            form.reset();
            setFoundUser(null);
        } catch (error) {
            toast({
                title: tc('error_title'),
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    const displayTitle = isEdit
        ? t('dialog.title_edit')
        : (foundUser ? 'Kullanıcıyı Güncelle/Yükselt' : t('dialog.title_create'));

    const submitBtnText = isEdit
        ? t('dialog.btn_update')
        : (foundUser ? 'Güncelle ve Rütbe Ver' : t('dialog.btn_create'));

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                form.reset();
                setFoundUser(null);
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{displayTitle}</DialogTitle>
                </DialogHeader>

                {foundUser && !isEdit && (
                    <Alert className="bg-blue-500/10 border-blue-500/20 mb-4">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <AlertTitle className="text-blue-500 font-semibold flex items-center gap-2">
                            Mevcut Kullanıcı Bulundu
                        </AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                            <strong>{foundUser.fullName}</strong> şu an <strong>{foundUser.role?.name || 'Müşteri'}</strong> rolünde. Bu işlem kendisini yeni role aktaracaktır.
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dialog.email')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder={t('dialog.email_placeholder')}
                                                {...field}
                                                disabled={isEdit}
                                                autoFocus={!isEdit}
                                            />
                                            {isLookingUp && (
                                                <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dialog.full_name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('dialog.name_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{(isEdit || foundUser) ? t('dialog.new_password_optional') : t('dialog.password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t('dialog.password_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dialog.role')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('dialog.select_role_placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">{t('dialog.roles.admin')}</SelectItem>
                                            <SelectItem value="support_manager">{t('dialog.roles.support_manager')}</SelectItem>
                                            <SelectItem value="support_agent">{t('dialog.roles.support_agent')}</SelectItem>
                                            <SelectItem value="viewer">{t('dialog.roles.viewer')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-2">
                            <Button type="submit" disabled={isLookingUp} className={foundUser && !isEdit ? "bg-blue-600 hover:bg-blue-700" : ""}>
                                {submitBtnText}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
