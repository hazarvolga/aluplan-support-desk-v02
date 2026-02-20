'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
import { Button } from '@/components/ui/button';
import { Zap, Loader2 } from 'lucide-react';

interface MacroPickerProps {
    onSelect: (content: string) => void;
}

export function MacroPicker({ onSelect }: MacroPickerProps) {
    const [open, setOpen] = useState(false);
    const [macros, setMacros] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        api.auth.me().then(setUser).catch(() => setUser(null));
    }, []);

    const isAuthorized = user?.userRoles?.some((ur: any) =>
        ['admin', 'superuser', 'agent'].includes(ur.role.name)
    );

    const loadMacros = async () => {
        if (!isAuthorized) return;
        setLoading(true);
        try {
            const data = await api.get('/macros');
            setMacros(data);
        } catch (error) {
            console.error('Failed to load macros:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && isAuthorized) loadMacros();
    }, [open, isAuthorized]);

    if (!isAuthorized) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-white/5 bg-slate-900/50 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider gap-2"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 text-amber-500" />}
                    Macro Kullan
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-slate-900 border-white/10" align="start">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Macro ara..." className="h-9 border-none focus:ring-0" />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>Macro bulunamadı.</CommandEmpty>
                        <CommandGroup heading="Kayıtlı Yanıtlar">
                            {macros.map((macro) => (
                                <CommandItem
                                    key={macro.id}
                                    value={macro.name}
                                    onSelect={() => {
                                        onSelect(macro.content);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-sm">{macro.name}</span>
                                        <span className="text-[10px] text-muted-foreground line-clamp-1">{macro.content}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
