'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
    onMenuClick: () => void;
    isOpen: boolean;
}

export function MobileHeader({ onMenuClick, isOpen }: MobileHeaderProps) {
    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-mono text-xs font-bold italic">A</span>
                </div>
                <span className="text-[11px] font-bold text-foreground leading-none tracking-tight uppercase">Aluplan_Ops</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
        </header>
    );
}
