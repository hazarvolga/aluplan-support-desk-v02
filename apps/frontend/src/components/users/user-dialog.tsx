'use client';

import { useState } from 'react';
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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const payload: any = {
                fullName: values.fullName,
                email: values.email,
                roles: [values.role],
            };

            if (values.password && values.password.length > 0) {
                payload.password = values.password;
            } else if (!isEdit) {
                toast({ title: t('validation.password_required'), variant: 'destructive' });
                return;
            }

            if (isEdit) {
                await api.users.update(user.id, payload);
                toast({ title: t('toasts.updated') });
            } else {
                await api.users.create(payload);
                toast({ title: t('toasts.created') });
            }
            onSuccess();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast({
                title: tc('error_title'),
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('dialog.title_edit') : t('dialog.title_create')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dialog.email')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('dialog.email_placeholder')} {...field} disabled={isEdit} />
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
                                    <FormLabel>{isEdit ? t('dialog.new_password_optional') : t('dialog.password')}</FormLabel>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <DialogFooter>
                            <Button type="submit">{isEdit ? t('dialog.btn_update') : t('dialog.btn_create')}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
