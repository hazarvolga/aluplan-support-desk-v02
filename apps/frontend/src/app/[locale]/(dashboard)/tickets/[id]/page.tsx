'use client';

export const dynamic = "force-dynamic";
import { useState, useEffect, use, useRef } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { subscribeTicketRoom } from '@/lib/socket-room';
import {
    Shield, Send, Paperclip, Download,
    AlertTriangle, Loader2, Bot, X,
    MessageCircle, Mail, Globe, Cpu, ExternalLink,
    type LucideIcon,
} from 'lucide-react';
import { HotinfoGrid } from "@/components/ui/hotinfo-grid";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { tr as trLocale, enUS as enLocale, de as deLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { MacroPicker } from '@/components/macros/macro-picker';
import { AiVisualEvidence, type AiVisualEvidenceItem } from '@/components/ai/AiVisualEvidence';
import { AiAnswerContent } from '@/components/ai/ai-answer-content';
import { useTranslations, useLocale } from 'next-intl';
import { ContentSanitizer } from '@/lib/content-sanitizer';
import { markdownToHtml } from '@/lib/markdown-to-html';
import { getTicketSupportCategoryNames, type TicketSupportCategoryLabels } from '@/lib/ticket-category-display';
import { displayAttachmentFilename } from '@/lib/attachment-filename';
import { TicketLifecycle } from './ticket-lifecycle';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'border-blue-900/50 text-blue-400 bg-blue-400/5',
    OPEN: 'border-sky-900/50 text-sky-400 bg-sky-400/5',
    IN_PROGRESS: 'border-amber-900/50 text-amber-400 bg-amber-400/5',
    PENDING_CUSTOMER: 'border-purple-900/50 text-purple-400 bg-purple-400/5',
    PENDING_CUSTOMER_REVIEW: 'border-orange-900/50 text-orange-400 bg-orange-400/5',
    RESOLVED: 'border-emerald-900/50 text-emerald-400 bg-emerald-400/5',
    CLOSED: 'border-border text-muted-foreground bg-muted/5',
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'text-muted-foreground',
    MEDIUM: 'text-amber-500',
    HIGH: 'text-orange-600',
    URGENT: 'text-red-600 font-black italic',
};

interface TicketAttachment {
    id: string;
    fileName?: string;
}

interface TicketUser {
    id: string;
    fullName?: string;
    email?: string;
    role?: string | { name?: string };
    roles?: string[];
    permissions?: string[];
    customerProfile?: { isVip?: boolean; hotinfoData?: unknown };
}

interface TicketMessage {
    id: string;
    message: string;
    senderId?: string;
    sender?: TicketUser;
    createdAt: string;
    isInternal?: boolean;
    isOptimistic?: boolean;
    attachments?: TicketAttachment[];
    metadata?: { action?: string; previousClosedAt?: string | null } | null;
}

interface TicketDetailData {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    channel: string;
    createdAt: string;
    closedAt?: string | null;
    resolvedAt?: string | null;
    satisfactionScore?: number | null;
    satisfactionComment?: string | null;
    userId: string;
    assignedTo?: string;
    chatStatus?: string;
    creator?: TicketUser;
    assignee?: TicketUser;
    messages: TicketMessage[];
    hotinfoSnapshot?: unknown;
    department?: { slug?: string | null; name?: string | null } | null;
    tags?: string[] | null;
}

interface AssignableAgent {
    id: string;
    fullName?: string;
    email?: string;
}

interface AiTrace {
    interaction?: {
        provider?: string;
        model?: string;
        confidenceBand?: string;
        userQuery?: string;
        responseGenerated?: string;
        userContext?: { visuals?: AiVisualEvidenceItem[] };
    };
    quality?: {
        responseLanguage?: string;
        requestLocale?: string;
        routeLocale?: string;
        profileLanguage?: string;
        sourceLeakDetected?: boolean;
        mixedLanguageRisk?: boolean;
        ticketCreatedFlagMatches?: boolean;
        contractSections?: Record<string, boolean | number | undefined> & { isComplete?: boolean; passed?: number };
    };
}

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';
const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalString = (value: unknown) => typeof value === 'string' ? value : undefined;

const toTicketUser = (value: unknown): TicketUser | undefined => {
    if (!isRecord(value) || typeof value.id !== 'string') return undefined;
    const customerProfile = isRecord(value.customerProfile)
        ? {
            isVip: typeof value.customerProfile.isVip === 'boolean' ? value.customerProfile.isVip : undefined,
            hotinfoData: value.customerProfile.hotinfoData,
        }
        : undefined;
    return {
        id: value.id,
        fullName: optionalString(value.fullName),
        email: optionalString(value.email),
        role: typeof value.role === 'string' || isRecord(value.role) ? value.role as string | { name?: string } : undefined,
        roles: Array.isArray(value.roles) ? value.roles.filter((role): role is string => typeof role === 'string') : undefined,
        permissions: Array.isArray(value.permissions) ? value.permissions.filter((permission): permission is string => typeof permission === 'string') : undefined,
        customerProfile,
    };
};

const toTicketMessage = (value: unknown): TicketMessage | null => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.message !== 'string' || typeof value.createdAt !== 'string') return null;
    const attachments = Array.isArray(value.attachments)
        ? value.attachments.flatMap(attachment => isRecord(attachment) && typeof attachment.id === 'string'
            ? [{ id: attachment.id, fileName: optionalString(attachment.fileName) }]
            : [])
        : undefined;
    const metadata = isRecord(value.metadata)
        ? {
            action: optionalString(value.metadata.action),
            previousClosedAt: typeof value.metadata.previousClosedAt === 'string'
                ? value.metadata.previousClosedAt
                : null,
        }
        : null;
    return {
        id: value.id,
        message: value.message,
        senderId: optionalString(value.senderId),
        sender: toTicketUser(value.sender),
        createdAt: value.createdAt,
        isInternal: typeof value.isInternal === 'boolean' ? value.isInternal : undefined,
        isOptimistic: typeof value.isOptimistic === 'boolean' ? value.isOptimistic : undefined,
        attachments,
        metadata,
    };
};

const toTicketDetail = (value: unknown): TicketDetailData | null => {
    if (!isRecord(value)) return null;
    const requiredKeys = ['id', 'ticketNumber', 'subject', 'description', 'status', 'priority', 'channel', 'createdAt'] as const;
    if (requiredKeys.some(key => typeof value[key] !== 'string')) return null;
    const creator = toTicketUser(value.creator);
    const department = isRecord(value.department)
        ? { slug: optionalString(value.department.slug) ?? null, name: optionalString(value.department.name) ?? null }
        : null;
    return {
        id: value.id as string,
        ticketNumber: value.ticketNumber as string,
        subject: value.subject as string,
        description: value.description as string,
        status: value.status as string,
        priority: value.priority as string,
        channel: value.channel as string,
        createdAt: value.createdAt as string,
        closedAt: typeof value.closedAt === 'string' ? value.closedAt : null,
        resolvedAt: typeof value.resolvedAt === 'string' ? value.resolvedAt : null,
        satisfactionScore: typeof value.satisfactionScore === 'number' ? value.satisfactionScore : null,
        satisfactionComment: typeof value.satisfactionComment === 'string' ? value.satisfactionComment : null,
        userId: optionalString(value.userId) ?? creator?.id ?? '',
        assignedTo: optionalString(value.assignedTo),
        chatStatus: optionalString(value.chatStatus),
        creator,
        assignee: toTicketUser(value.assignee),
        messages: Array.isArray(value.messages) ? value.messages.flatMap(message => {
            const normalized = toTicketMessage(message);
            return normalized ? [normalized] : [];
        }) : [],
        hotinfoSnapshot: value.hotinfoSnapshot,
        department,
        tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : null,
    };
};

const toAssignableAgent = (value: unknown): AssignableAgent | null =>
    isRecord(value) && typeof value.id === 'string'
        ? { id: value.id, fullName: optionalString(value.fullName), email: optionalString(value.email) }
        : null;

const toVisualEvidence = (value: unknown): AiVisualEvidenceItem | null => {
    if (!isRecord(value) || typeof value.url !== 'string' || typeof value.summary !== 'string'
        || typeof value.sourceTitle !== 'string' || typeof value.sourceId !== 'string') return null;
    return {
        url: value.url,
        summary: value.summary,
        sourceTitle: value.sourceTitle,
        sourceId: value.sourceId,
        alt: optionalString(value.alt),
        caption: optionalString(value.caption),
    };
};

const toAiTrace = (value: unknown): AiTrace | null => {
    if (!isRecord(value)) return null;
    const interaction = isRecord(value.interaction) ? value.interaction : null;
    const userContext = interaction && isRecord(interaction.userContext) ? interaction.userContext : null;
    const visuals = userContext && Array.isArray(userContext.visuals)
        ? userContext.visuals.flatMap(item => {
            const normalized = toVisualEvidence(item);
            return normalized ? [normalized] : [];
        })
        : undefined;
    const quality = isRecord(value.quality) ? value.quality : null;
    const contractSections = quality && isRecord(quality.contractSections)
        ? Object.fromEntries(Object.entries(quality.contractSections).filter((entry): entry is [string, boolean | number] =>
            typeof entry[1] === 'boolean' || typeof entry[1] === 'number'))
        : undefined;
    return {
        interaction: interaction ? {
            provider: optionalString(interaction.provider),
            model: optionalString(interaction.model),
            confidenceBand: optionalString(interaction.confidenceBand),
            userQuery: optionalString(interaction.userQuery),
            responseGenerated: optionalString(interaction.responseGenerated),
            userContext: visuals ? { visuals } : undefined,
        } : undefined,
        quality: quality ? {
            responseLanguage: optionalString(quality.responseLanguage),
            requestLocale: optionalString(quality.requestLocale),
            routeLocale: optionalString(quality.routeLocale),
            profileLanguage: optionalString(quality.profileLanguage),
            sourceLeakDetected: typeof quality.sourceLeakDetected === 'boolean' ? quality.sourceLeakDetected : undefined,
            mixedLanguageRisk: typeof quality.mixedLanguageRisk === 'boolean' ? quality.mixedLanguageRisk : undefined,
            ticketCreatedFlagMatches: typeof quality.ticketCreatedFlagMatches === 'boolean' ? quality.ticketCreatedFlagMatches : undefined,
            contractSections,
        } : undefined,
    };
};

const CHANNEL_ICONS: Record<string, LucideIcon> = {
    WEB: Globe,
    WHATSAPP: MessageCircle,
    EMAIL: Mail,
    API: Cpu,
};

const CHANNEL_COLORS: Record<string, string> = {
    WEB: 'text-blue-400',
    WHATSAPP: 'text-emerald-400',
    EMAIL: 'text-amber-400',
    API: 'text-purple-400',
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <TicketDetail key={id} id={id} />;
}

function TicketDetail({ id }: { id: string }) {
    const t = useTranslations('tickets.detail');
    const tickets = useTranslations('tickets');
    const ts = useTranslations('tickets.status');
    const tp = useTranslations('tickets.priority');
    const tc = useTranslations('common');
    const locale = useLocale();
    const [ticket, setTicket] = useState<TicketDetailData | null>(null);
    const [user, setUser] = useState<TicketUser | null>(null);
    const [reply, setReply] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<{ messageId: string; files: File[] } | null>(null);
    const replyOperationRef = useRef(false);
    const activeRef = useRef(true);
    const [updating, setUpdating] = useState(false);
    const reopenOperationRef = useRef(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [drafting, setDrafting] = useState(false);
    const [draftVisuals, setDraftVisuals] = useState<AiVisualEvidenceItem[]>([]);
    const [draftEvidence, setDraftEvidence] = useState<{ sources: Array<{ title: string; similarity: number }>; reviewReason?: string } | null>(null);
    const [downloadingHotinfo, setDownloadingHotinfo] = useState(false);
    const [aiTrace, setAiTrace] = useState<AiTrace | null>(null);
    const [agents, setAgents] = useState<AssignableAgent[]>([]);
    const [assigning, setAssigning] = useState(false);

    // Live chat states
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        activeRef.current = true;
        return () => {
            activeRef.current = false;
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);
    const [someoneTyping, setSomeoneTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const getDateLocale = () => {
        if (locale === 'tr') return trLocale;
        if (locale === 'de') return deLocale;
        return enLocale;
    };
    const dateLocale = getDateLocale();
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior, block: 'end' });
        }
    };

    const load = async () => {
        try {
            const [ticketRes, userRes] = await Promise.all([
                api.tickets.get(id),
                api.auth.me()
            ]);
            const resolvedTicket = toTicketDetail(ticketRes);
            if (!resolvedTicket) throw new Error('Invalid ticket response');
            setTicket(resolvedTicket);
            setUser(userRes);
            const resolvedUser = userRes as TicketUser;
            const userRoleName = (typeof resolvedUser?.role === 'string' ? resolvedUser.role : resolvedUser?.role?.name)?.toLowerCase();
            const resolvedUserRoles = (resolvedUser?.roles || []).map((r: string) => r.toLowerCase());
            const isCustomerRole = resolvedUserRoles.includes('customer') || resolvedUserRoles.includes('viewer') || userRoleName === 'customer' || userRoleName === 'viewer';
            if (isCustomerRole) {
                setAiTrace(null);
                setAgents([]);
            } else {
                const [trace] = await Promise.all([
                    api.tickets.getAiTrace(id).catch((err) => {
                    console.warn('[TicketDetail] AI trace unavailable:', err);
                    return null;
                    }),
                    api.tickets.assignableAgents(id).then(items => setAgents(items.flatMap(item => {
                        const normalized = toAssignableAgent(item);
                        return normalized ? [normalized] : [];
                    }))).catch((err) => {
                        console.warn('[TicketDetail] Assignable agent list unavailable:', err);
                        setAgents([]);
                    }),
                ]);
                setAiTrace(toAiTrace(trace));
            }
            // Initial scroll to bottom
            setTimeout(() => scrollToBottom('auto'), 100);
        } catch {
            toast.error(t('load_error'));
        } finally {
            setLoading(false);
        }
    };

    const downloadHotinfo = async () => {
        const customerId = ticket?.creator?.id;
        if (!customerId) return;

        setDownloadingHotinfo(true);
        try {
            const { blob, filename } = await api.customers.downloadHotinfo(customerId);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `hotinfo_${customerId}.hxl`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success(t('hotinfo_download_started'));
        } catch {
            toast.error(t('hotinfo_download_error'));
        } finally {
            setDownloadingHotinfo(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    useEffect(() => {
        if (!id || !user) return;

        const socket = getSocket();
        const leaveTicketRoom = subscribeTicketRoom(socket, id);

        const handleNewMessage = (data: { ticketId: string; message: TicketMessage }) => {
            if (data.ticketId === id && data.message.senderId !== user.id) {
                // Smart Buffer: Emit read event immediately if user is viewing the bilet
                getSocket().emit('ticket:message_read', {
                    ticketId: id,
                    messageId: data.message.id
                });

                setTicket((prev) => {
                    if (!prev) return prev;
                    // Prevent duplicate if optimistic message already exists with same content (unlikely but safe)
                    return {
                        ...prev,
                        messages: [...prev.messages, data.message]
                    };
                });
                setTimeout(() => scrollToBottom(), 50);
            }
        };

        const handleTyping = (data: { userId: string; isTyping: boolean }) => {
            if (data.userId !== user.id) {
                setSomeoneTyping(data.isTyping);
            }
        };

        const handleTicketUpdated = (updatedTicket: Partial<TicketDetailData>) => {
            setTicket((prev) => prev ? { ...prev, ...updatedTicket, messages: prev.messages } : prev);
        };

        const handlePresence = (data: { ticketId: string, userIds: string[] }) => {
            if (data.ticketId === id) {
                setOnlineUsers(data.userIds);
            }
        };

        const handleAttachmentAdded = (data: { messageId: string, attachment: TicketAttachment }) => {
            setTicket((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: prev.messages.map((m) => {
                        if (m.id === data.messageId) {
                            if (m.attachments?.some((attachment) => attachment.id === data.attachment.id)) return m;
                            return {
                                ...m,
                                attachments: [...(m.attachments || []), data.attachment]
                            };
                        }
                        return m;
                    })
                };
            });
        };

        socket.on('ticket:new_message', handleNewMessage);
        socket.on('ticket:attachment_added', handleAttachmentAdded);
        socket.on('ticket:typing', handleTyping);
        socket.on('ticket:updated', handleTicketUpdated);
        socket.on('ticket:presence', handlePresence);
        if (!socket.connected) socket.connect();

        return () => {
            leaveTicketRoom();
            socket.off('ticket:new_message', handleNewMessage);
            socket.off('ticket:attachment_added', handleAttachmentAdded);
            socket.off('ticket:typing', handleTyping);
            socket.off('ticket:updated', handleTicketUpdated);
            socket.off('ticket:presence', handlePresence);
        };
    }, [id, user]);

    const handleTypingChange = (html: string) => {
        setReply(html);
        if (!isTyping) {
            setIsTyping(true);
            getSocket().emit('ticket:typing', { ticketId: id, isTyping: true });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            getSocket().emit('ticket:typing', { ticketId: id, isTyping: false });
        }, 2000);
    };

    const userRoles = (user?.roles || []).map((r: string) => r.toLowerCase());
    const roleName = (typeof user?.role === 'string' ? user.role : user?.role?.name)?.toLowerCase();
    const isCustomer = userRoles.includes('customer') || userRoles.includes('viewer') || roleName === 'customer' || roleName === 'viewer';
    const normalizedRole = roleName?.trim().toUpperCase().replace(/-/g, '_');
    const isReopenStaff = ['ADMIN', 'SUPER_ADMIN', 'SUPERUSER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER'].includes(normalizedRole || '');
    const canReopen = Boolean(user?.id) && isReopenStaff && ['ticket:update', '*', 'admin'].some(permission => user?.permissions?.includes(permission));
    const isReplyEffectivelyEmpty = ContentSanitizer.isEffectivelyEmpty(reply);
    const isComposerDisabled = ticket?.status === 'CLOSED';
    const isLiveChatEligible = !isCustomer || Boolean(ticket?.creator?.customerProfile?.isVip);
    const aiTraceVisuals = aiTrace?.interaction?.userContext?.visuals ?? [];

    const handleRequestLiveChat = async () => {
        try {
            const nextStatus = isCustomer ? 'REQUESTED' : 'LIVE';
            await api.patch(`/tickets/${id}`, { chatStatus: nextStatus });
            toast.success(isCustomer ? t('live_request_success') : t('live_start_success'));
            load(); // Refresh state to show WAITING_AGENT UI
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            toast.error(message.includes('LIVE_CHAT_VIP_REQUIRED') ? t('live_chat_vip_required') : t('chat_update_error'));
        }
    };

    const handleAcceptLiveChat = async () => {
        try {
            await api.patch(`/tickets/${id}`, { chatStatus: 'LIVE' });
            toast.success(t('live_accept_success'));
            load(); // Refresh state to show LIVE_SESSION_ACTIVE UI
        } catch {
            toast.error(t('chat_start_error'));
        }
    };

    const handleAssignTicket = async (assigneeId: string) => {
        if (!ticket || !assigneeId || assigneeId === ticket.assignedTo || assigning) return;

        setAssigning(true);
        try {
            await api.tickets.assign(ticket.id, assigneeId);
            toast.success(t('assign_success'));
            await load();
        } catch {
            toast.error(t('assign_error'));
        } finally {
            setAssigning(false);
        }
    };

    const uploadReplyAttachments = async (messageId: string, uploadFiles: File[]) => {
        for (let index = 0; index < uploadFiles.length; index++) {
            if (!activeRef.current) return;
            try {
                const attachment = await api.attachments.upload(messageId, uploadFiles[index]) as { id: string };
                if (!activeRef.current) return;
                setTicket((prev) => prev ? ({ ...prev, messages: prev.messages.map((message) =>
                    message.id === messageId && !message.attachments?.some((existing) => existing.id === attachment.id)
                        ? { ...message, attachments: [...(message.attachments || []), attachment] } : message) }) : prev);
            } catch {
                if (!activeRef.current) return;
                setPendingAttachments({ messageId, files: uploadFiles.slice(index) });
                toast.error(t('attachment_partial_failure'));
                return;
            }
        }
        if (!activeRef.current) return;
        setPendingAttachments(null);
        await load();
    };

    const handleRetryAttachments = async () => {
        if (replyOperationRef.current || !pendingAttachments || isComposerDisabled) return;
        replyOperationRef.current = true;
        setSending(true);
        try {
            await uploadReplyAttachments(pendingAttachments.messageId, pendingAttachments.files);
        } finally {
            replyOperationRef.current = false;
            if (activeRef.current) setSending(false);
        }
    };

    const handleSendReply = async () => {
        if (!user || replyOperationRef.current || pendingAttachments || isComposerDisabled) return;
        const sanitizedReply = ContentSanitizer.sanitize(reply);
        if (ContentSanitizer.isEffectivelyEmpty(sanitizedReply) && files.length === 0) return;

        const messageText = sanitizedReply;
        const previousReply = reply;
        const previousDraftVisuals = draftVisuals;
        const uploadFiles = [...files];
        replyOperationRef.current = true;
        setSending(true);

        // Optimistic UI: Add message locally first
        const tempId = 'temp-' + Date.now();
        const optimisticMessage = {
            id: tempId,
            message: messageText,
            senderId: user.id,
            sender: user,
            createdAt: new Date().toISOString(),
            isInternal: false,
            isOptimistic: true,
            attachments: []
        };

        setTicket((prev) => prev ? ({
            ...prev,
            messages: [...prev.messages, optimisticMessage]
        }) : prev);

        setTimeout(() => scrollToBottom(), 50);

        try {
            const message = await api.tickets.addMessage(id, {
                message: messageText,
                isInternal: false,
                contentFormat: 'HTML',
            });

            if (!activeRef.current) return;
            // Message persistence is independent of the following attachment uploads.
            const persistedMessage = message as TicketMessage;
            setTicket((prev) => prev ? ({
                ...prev,
                messages: prev.messages.map((m) => m.id === tempId ? { ...persistedMessage, sender: user ?? undefined } : m)
            }) : prev);

            setReply((current) => current === previousReply ? '' : current);
            setDraftVisuals((current) => current === previousDraftVisuals ? [] : current);
            setFiles((current) => current.filter((file) => !uploadFiles.includes(file)));
            await uploadReplyAttachments(message.id, uploadFiles);
        } catch (error: unknown) {
            if (!activeRef.current) return;
            toast.error(t('send_error', { error: errorMessage(error) }));
            // Remove optimistic message on failure
            setTicket((prev) => prev ? ({
                ...prev,
                messages: prev.messages.filter((m) => m.id !== tempId)
            }) : prev);
        } finally {
            replyOperationRef.current = false;
            if (activeRef.current) setSending(false);
        }
    };

    const handleSummarize = async () => {
        if (!summarizing) setSummarizing(true);
        try {
            const generatedSummary = await api.get(`/ai/tickets/${id}/summarize`);
            if (!generatedSummary) throw new Error('Invalid summary response');
            setSummary(generatedSummary);
            toast.success(t('summary_success'));
        } catch {
            toast.error(t('summary_error'));
        } finally {
            setSummarizing(false);
        }
    };

    const handleDraft = async () => {
        setDrafting(true);
        try {
            const res = await api.ai.getCopilotDraft(id);
            let htmlDraft = markdownToHtml(res.draft);

            if (res.visuals && res.visuals.length > 0) {
                const visualsHtml = res.visuals.map((v) => {
                    const altText = v.alt || v.caption || v.sourceTitle || 'Visual';
                    const caption = v.sourceTitle || 'Source Visual';
                    return `<br/><br/><p><a href="${v.url}" target="_blank"><img src="${v.url}" alt="${altText}" style="max-width:100%; border-radius:8px; border:1px solid #ffffff20;" /></a><br/><small style="color:#ffffff70;"><em>${caption}</em></small></p>`;
                }).join('');
                htmlDraft += visualsHtml;
            }

            // A review reason is an internal diagnostic, never a customer-ready reply.
            if (!res.reviewReason) setReply(htmlDraft);
            setDraftVisuals([]);
            const reviewReason = res.reviewReason === 'NO_RESULTS' ? t('draft_reason_no_results')
                : res.reviewReason === 'BELOW_THRESHOLD' ? t('draft_reason_below_threshold')
                    : res.reviewReason === 'LICENSE_ERA_MISMATCH' ? t('draft_reason_era_mismatch')
                        : res.reviewReason === 'MISSING_LICENSING_INTAKE' ? t('draft_reason_missing_intake')
                            : res.reviewReason === 'GENERATION_ERROR' ? t('draft_reason_generation_error')
                                : undefined;
            setDraftEvidence({ sources: res.sources ?? [], reviewReason });
            if (res.reviewReason) toast.warning(t('draft_manual_review'));
            else toast.success(t('draft_success'));
        } catch (err: unknown) {
            toast.error(t('draft_error', { error: errorMessage(err) }));
        } finally {
            setDrafting(false);
        }
    };

    const handleReopenTicket = async () => {
        if (!canReopen || ticket?.status !== 'CLOSED' || reopenOperationRef.current) return;
        reopenOperationRef.current = true;
        setUpdating(true);
        try {
            const updated = await api.tickets.updateStatus(ticket.id, 'OPEN');
            if (!activeRef.current) return;
            setTicket((previous) => previous ? ({ ...previous, ...(updated as Partial<TicketDetailData>) }) : previous);
            toast.success(t('reopen_success'));
            await load();
        } catch {
            if (activeRef.current) toast.error(t('status_update_error'));
        } finally {
            reopenOperationRef.current = false;
            if (activeRef.current) setUpdating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
    );

    if (!ticket) return (
        <div className="text-center py-20">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">{t('not_found')}</h2>
            <p className="text-muted-foreground">{t('not_found_desc')}</p>
        </div>
    );

    const supportCategoryLabels: TicketSupportCategoryLabels = {
        technical_support: tickets('new.departments.technical_support'),
        billing_payments: tickets('new.departments.billing_payments'),
        sales_pre_sales: tickets('new.departments.sales_pre_sales'),
        general_support: tickets('new.departments.general_support'),
        licensing: t('category_licensing'),
        customer_success: tickets('new.departments.customer_success'),
        general_inquiries: tickets('new.departments.general_inquiries'),
        security_compliance: tickets('new.departments.security_compliance'),
    };
    const ticketCategories = getTicketSupportCategoryNames(ticket, supportCategoryLabels);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full py-0">
            {/* Main Conversation Column */}
            <div className="lg:col-span-3 space-y-4">
                <Card className="flex flex-col min-h-[700px] border-border/60 overflow-hidden">
                    <CardHeader className="py-3 bg-muted/20 border-b border-border/40 z-10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 font-bold uppercase tracking-widest">
                                        {(() => {
                                            const Icon = CHANNEL_ICONS[ticket.channel] || Globe;
                                            return <Icon className={`h-3 w-3 ${CHANNEL_COLORS[ticket.channel] || ''}`} />;
                                        })()}
                                        {t('ticket_id', { id: ticket.ticketNumber })}
                                    </div>
                                    <Badge className={STATUS_COLORS[ticket.status]}>{ts(ticket.status)}</Badge>
                                </div>
                                <CardTitle className="text-[16px] normal-case text-foreground font-bold tracking-tight mt-1">
                                    {ticket.subject.toUpperCase()}
                                </CardTitle>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                    <span className="flex items-center gap-1">
                                        {t('started_by', { name: ticket.creator?.fullName || tc('system') })}
                                    </span>
                                    <span className="flex items-center gap-1">{t('timestamp', { date: `${new Date(ticket.createdAt).toLocaleDateString(locale)} ${new Date(ticket.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` })}</span>
                                </div>
                                <div className="flex items-center gap-2 pt-2" data-testid="ticket-category">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('category_label')}</span>
                                    {ticketCategories.length > 0 ? ticketCategories.map((category) => (
                                        <Badge key={category} variant="outline" className="px-1.5 py-0 text-[11px] font-bold tracking-wide bg-primary/5 text-primary border-primary/20">
                                            {category}
                                        </Badge>
                                    )) : <span className="text-[10px] text-muted-foreground">—</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {canReopen && ticket.status === 'CLOSED' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReopenTicket}
                                        disabled={updating}
                                        className="h-7 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        {updating ? t('reopening') : t('reopen_ticket')}
                                    </Button>
                                )}
                                {!isCustomer && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSummarize}
                                        disabled={summarizing}
                                        className="h-7 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <Bot className={`h-3 w-3 ${summarizing ? 'animate-pulse' : ''}`} />
                                        {summarizing ? t('summarizing') : t('ai_summary_btn')}
                                    </Button>
                                )}
                                {!isCustomer && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDraft}
                                        disabled={drafting}
                                        className="h-7 border-purple-500/30 text-purple-400 bg-purple-400/5 hover:bg-purple-400/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <Bot className={`h-3 w-3 ${drafting ? 'animate-pulse' : ''}`} />
                                        {drafting ? t('drafting') : t('ai_draft_btn')}
                                    </Button>
                                )}
                                {ticket.chatStatus === 'NORMAL' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRequestLiveChat}
                                        disabled={!isLiveChatEligible}
                                        title={!isLiveChatEligible ? t('live_chat_vip_only') : undefined}
                                        className="h-7 border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 gap-1.5 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <MessageCircle className="h-3 w-3" />
                                        {isCustomer ? t('start_live_support') : t('request_live_chat')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {ticket.chatStatus === 'REQUESTED' && (
                            <div className="mt-2 p-3 border border-blue-500/30 bg-blue-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                        {isCustomer ? t('waiting_agent') : t('customer_waiting_live')}
                                    </span>
                                </div>
                                {!isCustomer && (
                                    <Button
                                        size="sm"
                                        onClick={handleAcceptLiveChat}
                                        className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        {t('start_conversation')}
                                    </Button>
                                )}
                            </div>
                        )}

                        {ticket.chatStatus === 'LIVE' && (
                            <div className="mt-2 p-2 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                                    {t('live_session_active')}
                                </span>
                            </div>
                        )}

                        <TicketLifecycle ticket={ticket} user={user} onUpdated={updated => {
                            // Apply the mutation response immediately so lifecycle-only
                            // fields (for example satisfactionScore/comment) do not wait
                            // for the follow-up fetch before becoming visible.
                            setTicket((previous) => {
                                if (!previous) return previous;
                                return {
                                    ...previous,
                                    status: updated.status ?? previous.status,
                                    closedAt: updated.closedAt === undefined ? previous.closedAt : updated.closedAt,
                                    satisfactionScore: updated.satisfactionScore === undefined
                                        ? previous.satisfactionScore
                                        : updated.satisfactionScore,
                                    satisfactionComment: updated.satisfactionComment === undefined
                                        ? previous.satisfactionComment
                                        : updated.satisfactionComment,
                                };
                            });
                            void load();
                        }} />

                        {summary && (
                            <div className="mt-2 p-3 border border-primary/20 bg-primary/5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Bot className="h-3 w-3 text-primary" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">{t('ai_summary_record')}</span>
                                    <button onClick={() => setSummary(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <p className="text-[11px] leading-relaxed text-foreground/90 font-medium italic">"{summary}"</p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col bg-muted/5 relative">
                        <ScrollArea className="flex-1 p-4 h-[550px]">
                            <div className="space-y-6">
                                {/* Initial Description as first message */}
                                <div className="flex gap-3 group">
                                    <div className="relative shrink-0">
                                        <div className="h-8 w-8 bg-muted flex items-center justify-center border border-border text-[10px] font-bold uppercase">
                                            {ticket.creator?.fullName?.[0] || 'OP'}
                                        </div>
                                        {onlineUsers.includes(ticket.userId) && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 max-w-[85%]">
                                        <div className="flex items-baseline justify-between gap-4">
                                            <span className="text-[11px] font-mono font-bold uppercase tracking-tight truncate">{ticket.creator?.fullName || 'EXTERNAL_AGENT'}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-mono shrink-0">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                                        </div>
                                        <div className="bg-muted/30 border border-border/50 p-3 text-[12px] leading-relaxed tracking-tight text-foreground font-medium shadow-sm">
                                            <RichTextRenderer content={ticket.description} />

                                            {/* Show attachments from the first message here if it's the description duplicate */}
                                            {(ticket.messages[0]?.attachments?.length ?? 0) > 0 && (
                                                <div className="mt-3 pt-2 border-t border-border/20 space-y-1">
                                                    <p className="text-[9px] uppercase font-bold text-muted-foreground/60 mb-1">{t('initial_attachments') || 'Bilet Ekleri'}</p>
                                                    {ticket.messages[0]?.attachments?.map((file) => (
                                                        <a
                                                            key={file.id}
                                                            href={api.attachments.getDownloadUrl(file.id)}
                                                            target="_blank"
                                                            className="flex items-center gap-2 bg-black/20 p-1.5 hover:bg-black/40 transition-none text-[10px] font-mono border border-border/20"
                                                        >
                                                            <Paperclip className="h-3 w-3 opacity-60" />
                                                            <span className="flex-1 truncate uppercase">{displayAttachmentFilename(file.fileName)}</span>
                                                            <Download className="h-3 w-3 opacity-60" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Thread */}
                                {ticket.messages.map((msg) => {
                                    const isMe = msg.senderId === user?.id;
                                    const isSystem = !msg.senderId;

                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isSystem ? 'justify-center' : ''}`}>
                                            {!isSystem && (
                                                <div className="relative shrink-0">
                                                    <div className={`h-8 w-8 flex items-center justify-center border text-[10px] font-bold uppercase ${isMe ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted border-border'}`}>
                                                        {msg.sender?.fullName?.[0] || '??'}
                                                    </div>
                                                    {msg.senderId && onlineUsers.includes(msg.senderId) && (
                                                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                                                    )}
                                                </div>
                                            )}

                                            <div className={`flex flex-col space-y-1 ${isSystem ? 'max-w-full items-center' : isMe ? 'items-end max-w-[85%]' : 'items-start max-w-[85%]'}`}>
                                                {!isSystem && (
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[11px] font-mono font-bold uppercase tracking-tight">{msg.sender?.fullName || tc('anonymous')}</span>
                                                        <span className="text-[9px] text-muted-foreground uppercase font-mono">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                                                    </div>
                                                )}

                                                <div className={`p-3 text-[13px] leading-relaxed tracking-tight font-medium ${isSystem
                                                    ? 'bg-transparent text-muted-foreground italic text-center text-[11px]'
                                                    : isMe
                                                        ? 'bg-primary text-primary-foreground border border-primary rounded-tl-lg rounded-bl-lg rounded-br-none shadow-sm [&_.rich-text-content_a]:!text-primary-foreground hover:[&_.rich-text-content_a]:!text-primary-foreground/80'
                                                        : 'bg-card border border-border/60 rounded-tr-lg rounded-br-lg rounded-bl-none shadow-sm'
                                                    } ${msg.isOptimistic ? 'opacity-70 italic' : ''}`}>
                                                    <RichTextRenderer content={msg.message} />

                                                    {/* Attachments for this message */}
                                                    {(msg.attachments?.length ?? 0) > 0 && (
                                                        <div className="mt-3 pt-2 border-t border-border/20 space-y-1">
                                                            {msg.attachments?.map((file) => (
                                                                <a
                                                                    key={file.id}
                                                                    href={api.attachments.getDownloadUrl(file.id)}
                                                                    target="_blank"
                                                                    className="flex items-center gap-2 bg-black/20 p-1.5 hover:bg-black/40 transition-none text-[10px] font-mono border border-border/20"
                                                                >
                                                                    <Paperclip className="h-3 w-3 opacity-60" />
                                                                    <span className="flex-1 truncate uppercase">{displayAttachmentFilename(file.fileName)}</span>
                                                                    <Download className="h-3 w-3 opacity-60" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.isOptimistic && (
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-primary animate-pulse">{t('sending')}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing Indicator */}
                                {someoneTyping && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 bg-muted border border-border flex items-center justify-center text-[10px] animate-bounce shrink-0">{tc('ai_bot')}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="p-3 w-16 bg-card border border-border/60 rounded-tr-lg rounded-br-lg rounded-bl-none">
                                                <span className="flex gap-1 justify-center items-center h-4">
                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0s]" />
                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={scrollRef} className="h-px" />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-sm flex flex-col gap-3 z-10">
                        {pendingAttachments && (
                            <div role="alert" className="w-full rounded-md border border-amber-500/40 p-3 text-sm space-y-2">
                                <p>{t('pending_attachments_notice')}</p>
                                <ul>{pendingAttachments.files.map((file, index) => <li key={index}>{file.name}</li>)}</ul>
                                <div className="flex gap-2">
                                    <Button onClick={handleRetryAttachments} disabled={sending || isComposerDisabled}>{t('retry_attachments')}</Button>
                                    <Button variant="outline" disabled={sending} onClick={() => {
                                        if (!replyOperationRef.current) setPendingAttachments(null);
                                    }}>{t('discard_pending_attachments')}</Button>
                                </div>
                            </div>
                        )}
                        {/* Selected Files Preview */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 w-full">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-muted border border-border px-1.5 py-0.5 text-[9px] font-mono uppercase">
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-3 w-full">
                            <label className="mb-2 cursor-pointer text-muted-foreground hover:text-primary transition-all p-1.5 hover:bg-primary/10 rounded-full">
                                <Paperclip className="h-5 w-5" />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center mr-1">
                                    <MacroPicker onSelect={(content: string) => {
                                        const macroHtml = markdownToHtml(content);
                                        setReply((prev) => prev && !ContentSanitizer.isEffectivelyEmpty(prev)
                                            ? `${prev}${macroHtml}`
                                            : macroHtml);
                                    }} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                                        <Shield className="h-2.5 w-2.5" /> {t('secure_chat')}
                                    </span>
                                </div>
                                <RichTextEditor
                                    placeholder={t('message_placeholder')}
                                    value={reply}
                                    onChange={handleTypingChange}
                                    disabled={isComposerDisabled}
                                    aria-label={t('message_placeholder')}
                                    onSubmit={() => {
                                        if (!sending && !pendingAttachments && (!isReplyEffectivelyEmpty || files.length > 0)) {
                                            handleSendReply();
                                        }
                                    }}
                                    className="min-h-20 transition-colors"
                                />
                                {draftEvidence && (
                                    <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-xs text-muted-foreground" role="status">
                                        {draftEvidence.reviewReason && <p>{t('draft_manual_review')}: {draftEvidence.reviewReason}</p>}
                                        <p>{t('draft_sources')}: {draftEvidence.sources.length > 0
                                            ? draftEvidence.sources.map(source => `${source.title} (${Math.round(source.similarity * 100)}%)`).join(', ')
                                            : t('draft_no_sources')}</p>
                                    </div>
                                )}
                            </div>
                            {!isComposerDisabled && (
                                <Button
                                    onClick={handleSendReply}
                                    disabled={sending || Boolean(pendingAttachments) || (isReplyEffectivelyEmpty && files.length === 0)}
                                    className="shrink-0 bg-primary hover:bg-primary/90 rounded-md h-auto min-h-20 w-14 border-border transition-all hover:scale-[1.02] active:scale-[0.98] self-stretch"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" /> : <Send className="h-6 w-6 text-primary-foreground" />}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-4">
                <Card className="border-border/60">
                    <CardHeader className="py-2 bg-muted/10 border-b border-border/40">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">{t('ticket_metadata')}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-3 grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.1em]">{t('status_label')}</label>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-tight text-foreground truncate">{ts(ticket.status)}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.1em]">{t('channel_label')}</label>
                            <div className="flex items-center gap-1.5">
                                {(() => {
                                    const Icon = CHANNEL_ICONS[ticket.channel] || Globe;
                                    return <Icon className={`h-3 w-3 ${CHANNEL_COLORS[ticket.channel] || ''}`} />;
                                })()}
                                <span className="text-[10px] font-bold uppercase tracking-tight text-foreground">{ticket.channel || 'WEB'}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.1em]">{t('priority_label')}</label>
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className={`text-[9px] h-4 px-1 py-0 rounded-none ${PRIORITY_COLORS[ticket.priority]}`}>{tp(ticket.priority)}</Badge>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.1em]">{t('open_date')}</label>
                            <p className="text-[9px] font-mono font-medium text-foreground truncate">{new Date(ticket.createdAt).toLocaleDateString(locale)} {new Date(ticket.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="space-y-0.5 col-span-2">
                            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.1em]">{t('category_label')}</label>
                            <div className="flex flex-wrap gap-1">
                                {ticketCategories.length > 0 ? ticketCategories.map((category) => (
                                    <Badge key={category} variant="outline" className="px-1.5 py-0 text-[11px] font-bold tracking-wide bg-primary/5 text-primary border-primary/20">
                                        {category}
                                    </Badge>
                                )) : <span className="text-[10px] text-muted-foreground">—</span>}
                            </div>
                        </div>
                        <div className="space-y-1 col-span-2 pt-2 border-t border-border/20">
                            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-[0.1em]">{t('assignee_label')}</label>
                            {!isCustomer ? (
                                <Select
                                    value={ticket.assignedTo || ''}
                                    onValueChange={handleAssignTicket}
                                    disabled={assigning || agents.length === 0 || ticket.status === 'CLOSED'}
                                >
                                    <SelectTrigger className="h-8 rounded-none border-border/60 bg-background/60 text-[10px] font-bold uppercase tracking-tight">
                                        <SelectValue placeholder={agents.length === 0 ? t('assign_no_agents') : t('assign_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                <span className="flex flex-col">
                                                    <span>{agent.fullName || agent.email}</span>
                                                    {agent.email ? (
                                                        <span className="text-[10px] font-medium normal-case tracking-normal text-muted-foreground">
                                                            {agent.email}
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 bg-muted border border-border flex items-center justify-center text-[8px] font-bold">
                                        {ticket.assignee?.fullName?.[0] || 'AX'}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-tight">{ticket.assignee?.fullName || tc('unassigned')}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {!isCustomer && aiTrace && (
                    <Card className="border-purple-500/25 bg-purple-500/[0.03]">
                        <CardHeader className="py-2 border-b border-purple-500/15">
                            <CardTitle className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.18em] text-purple-300">
                                <Bot className="h-3.5 w-3.5" />
                                {t('ai_trace_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 py-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_provider')}</label>
                                    <p className="text-[10px] font-mono text-foreground truncate">{aiTrace.interaction?.provider || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_model')}</label>
                                    <p className="text-[10px] font-mono text-foreground truncate">{aiTrace.interaction?.model || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_language')}</label>
                                    <p className="text-[10px] font-mono text-foreground uppercase">{aiTrace.quality?.responseLanguage || aiTrace.quality?.requestLocale || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_confidence')}</label>
                                    <p className="text-[10px] font-mono text-foreground">{aiTrace.interaction?.confidenceBand || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_route_locale')}</label>
                                    <p className="text-[10px] font-mono text-foreground uppercase">{aiTrace.quality?.routeLocale || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_profile_language')}</label>
                                    <p className="text-[10px] font-mono text-foreground uppercase">{aiTrace.quality?.profileLanguage || '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{t('ai_trace_contract')}</span>
                                    <Badge variant="outline" className={`h-5 rounded-none text-[9px] ${aiTrace.quality?.contractSections?.isComplete ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10'}`}>
                                        {aiTrace.quality?.contractSections?.passed || 0}/5
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-5 gap-1">
                                    {['problem', 'cause', 'checks', 'steps', 'verification'].map((key) => (
                                        <div
                                            key={key}
                                            className={`h-1.5 ${aiTrace.quality?.contractSections?.[key] ? 'bg-emerald-400' : 'bg-amber-500/50'}`}
                                            title={key}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase">
                                    <span className="text-muted-foreground">{t('ai_trace_source_leak')}</span>
                                    <span className={aiTrace.quality?.sourceLeakDetected ? 'text-red-300' : 'text-emerald-300'}>
                                        {aiTrace.quality?.sourceLeakDetected ? t('ai_trace_fail') : t('ai_trace_pass')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase">
                                    <span className="text-muted-foreground">{t('ai_trace_language_risk')}</span>
                                    <span className={aiTrace.quality?.mixedLanguageRisk ? 'text-amber-300' : 'text-emerald-300'}>
                                        {aiTrace.quality?.mixedLanguageRisk ? t('ai_trace_risk') : t('ai_trace_pass')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase">
                                    <span className="text-muted-foreground">{t('ai_trace_ticket_flag')}</span>
                                    <span className={aiTrace.quality?.ticketCreatedFlagMatches ? 'text-emerald-300' : 'text-amber-300'}>
                                        {aiTrace.quality?.ticketCreatedFlagMatches ? t('ai_trace_pass') : t('ai_trace_risk')}
                                    </span>
                                </div>
                            </div>

                            {aiTrace.interaction?.userQuery && (
                                <div className="pt-2 border-t border-purple-500/15">
                                    <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_query')}</label>
                                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/85 line-clamp-3">{aiTrace.interaction.userQuery}</p>
                                </div>
                            )}

                            <div className="pt-2 border-t border-purple-500/15">
                                <label className="text-[8px] uppercase font-bold text-muted-foreground/70 tracking-[0.1em]">{t('ai_trace_response')}</label>
                                {aiTrace.interaction?.responseGenerated?.trim() ? (
                                    <div className="mt-2 max-h-80 overflow-y-auto rounded-md border border-purple-500/15 bg-black/10 p-3">
                                        <AiAnswerContent content={aiTrace.interaction.responseGenerated} className="text-[15px] leading-6 text-foreground" />
                                    </div>
                                ) : (
                                    <p className="mt-1 text-[11px] text-muted-foreground">{t('ai_trace_no_response')}</p>
                                )}
                            </div>

                            <AiVisualEvidence
                                visuals={aiTraceVisuals}
                                labels={{
                                    title: t('ai_trace_visuals_title'),
                                    description: t('ai_trace_visuals_desc'),
                                    open: t('ai_trace_visuals_open'),
                                    source: t('ai_trace_visuals_source'),
                                }}
                                accent="brand"
                                layout="stack"
                            />
                        </CardContent>
                    </Card>
                )}

                {!isCustomer && Boolean(ticket.hotinfoSnapshot) && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between border-cyan-900/50 bg-cyan-950/10 text-cyan-300 hover:bg-cyan-950/25 hover:text-cyan-100"
                            >
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
                                    <Cpu className="h-3.5 w-3.5" />
                                    {t('hotfix_data')}
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[88vh] p-0 overflow-hidden border-cyan-900/50 bg-background">
                            <DialogHeader className="bg-cyan-950/20 border-cyan-900/30 px-6 py-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1.5">
                                        <DialogTitle className="flex items-center gap-2 text-cyan-300">
                                            <Cpu className="h-4 w-4" />
                                            {t('hotfix_data')}
                                        </DialogTitle>
                                        <DialogDescription className="text-[12px] leading-5 text-slate-300 dark:text-cyan-100/75">
                                            {t('hotinfo_modal_desc')}
                                        </DialogDescription>
                                    </div>
                                    {ticket.creator?.id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadHotinfo}
                                            disabled={downloadingHotinfo}
                                            className="shrink-0 h-8 border-cyan-900/50 bg-cyan-950/20 text-[10px] uppercase tracking-[0.16em] text-cyan-200 hover:bg-cyan-950/35 hover:text-cyan-100"
                                        >
                                            {downloadingHotinfo ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                                            {t('download_hotinfo')}
                                        </Button>
                                    )}
                                </div>
                            </DialogHeader>
                            <ScrollArea className="max-h-[72vh] px-6 py-5">
                                <div className="space-y-5">
                                    {isRecord(ticket.hotinfoSnapshot) ? (
                                        <HotinfoGrid data={ticket.hotinfoSnapshot} />
                                    ) : (
                                        <div className="text-[11px] font-mono text-cyan-200/90 leading-relaxed whitespace-pre-wrap break-all border border-cyan-900/30 bg-cyan-950/10 p-3">
                                            {String(ticket.hotinfoSnapshot)}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                )}

                {/* System Notice */}
                <div className="bg-primary/5 border border-primary/20 p-3 space-y-2">
                    <h4 className="text-[9px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-[0.2em]">
                        <Shield className="h-3 w-3" /> {t('security_warning')}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-tight tracking-tight">
                        {t('security_warning_desc')}
                    </p>
                </div>
            </div>
        </div>
    );
}
