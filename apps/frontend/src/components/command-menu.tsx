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

import { useTranslations } from "next-intl"

export function CommandMenu() {
    const t = useTranslations("command_menu")
    const navT = useTranslations("sidebar.nav")
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
            <CommandInput placeholder={t("placeholder")} />
            <CommandList>
                <CommandEmpty>{t("empty")}</CommandEmpty>
                <CommandGroup heading={t("sections.navigation")}>
                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>{navT("dashboard")}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/tickets"))}>
                        <Ticket className="mr-2 h-4 w-4" />
                        <span>{navT("tickets")}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/knowledge-pool"))}>
                        <Database className="mr-2 h-4 w-4" />
                        <span>{navT("data_sources")}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/ai"))}>
                        <Zap className="mr-2 h-4 w-4" />
                        <span>{navT("ai_assistant")}</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading={t("sections.management")}>
                    <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{navT("settings")}</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/reports"))}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>{t("items.reports")}</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/customers"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{navT("customers")}</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading={t("sections.actions")}>
                    <CommandItem onSelect={() => runCommand(() => router.push("/tickets/new"))}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>{t("items.new_ticket")}</span>
                    </CommandItem>
                    <CommandItem onSelect={async () => {
                        try {
                            const { api } = await import('@/lib/api');
                            await api.auth.logout();
                        } catch (e) {
                            console.error('Logout error', e);
                        }
                        router.push("/login");
                    }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t("items.logout")}</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
