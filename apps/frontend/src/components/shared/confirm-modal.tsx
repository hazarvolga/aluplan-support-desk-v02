'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    loading = false,
    variant = 'primary'
}: ConfirmModalProps) {
    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    const variantStyles = {
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        warning: 'bg-amber-500 text-white hover:bg-amber-600',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    };

    const iconStyles = {
        danger: 'text-destructive bg-destructive/10',
        warning: 'text-amber-500 bg-amber-500/10',
        primary: 'text-primary bg-primary/10',
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="flex flex-row items-center gap-4">
                    <div className={`p-3 rounded-full ${iconStyles[variant]}`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-6">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="font-semibold"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`font-semibold ${variant === 'warning' ? variantStyles.warning : ''}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                İşlem yapılıyor...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
