"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Home,
    Ticket,
    Database,
    Zap,
    PlusCircle,
    BarChart3,
    LogOut,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Bir komut yazın veya arayın..." />
            <CommandList>
                <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                <CommandGroup heading="Navigasyon">
                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/tickets"))}>
                        <Ticket className="mr-2 h-4 w-4" />
                        <span>Destek Talepleri</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/knowledge-pool"))}>
                        <Database className="mr-2 h-4 w-4" />
                        <span>Bilgi Havuzu</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai"))}>
                        <Zap className="mr-2 h-4 w-4" />
                        <span>AI Asistan</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Yönetim">
                    <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Ayarlar</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/reports"))}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Raporlar</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/customers"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Müşteriler</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Hızlı İşlemler">
                    <CommandItem onSelect={() => runCommand(() => router.push("/tickets/new"))}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Yeni Talep Oluştur</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {
                        localStorage.removeItem("token");
                        router.push("/auth/login");
                    })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Çıkış Yap</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
