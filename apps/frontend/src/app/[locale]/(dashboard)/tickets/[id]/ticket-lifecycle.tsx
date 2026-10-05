'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Identity = { id?: string; role?: string | { name?: string }; permissions?: string[] };
type LifecycleTicket = {
    id: string; status: string; userId?: string; creator?: { id?: string }; closedAt?: string | null;
    satisfactionScore?: number | null; satisfactionComment?: string | null;
    messages?: Array<{ isInternal?: boolean; createdAt?: string; metadata?: { action?: string; previousClosedAt?: string | null } | null }>;
};
type Action = 'CONTINUE' | 'CLOSE' | 'REQUEST';
const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPERUSER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'AGENT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER'];
const ACTIVE_STATUSES = ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_CUSTOMER_REVIEW', 'RESOLVED'];

export function TicketLifecycle({ ticket, user, onUpdated }: {
    ticket: LifecycleTicket; user: Identity | null; onUpdated: (ticket: Partial<LifecycleTicket>) => void;
}) {
    const t = useTranslations('tickets.detail.lifecycle');
    const rawRole = typeof user?.role === 'string' ? user.role : user?.role?.name;
    const role = rawRole?.trim().toUpperCase().replace(/-/g, '_');
    const isOwner = Boolean(user?.id) && role === 'CUSTOMER' && user?.id === (ticket.userId ?? ticket.creator?.id);
    const isStaff = Boolean(user?.id) && STAFF_ROLES.includes(role ?? '');
    const permitted = (permission: string) => Boolean(user?.permissions?.some(value => [permission, '*', 'admin'].includes(value)));
    const reviewing = ['PENDING_CUSTOMER_REVIEW', 'RESOLVED'].includes(ticket.status);
    const hasRating = ticket.satisfactionScore !== null && ticket.satisfactionScore !== undefined;
    const pendingRequest = ticket.status === 'CLOSED' && ticket.messages?.some(message =>
        message.isInternal === false && message.metadata?.action === 'TICKET_REOPEN_REQUESTED'
        && (message.metadata.previousClosedAt === ticket.closedAt || (Boolean(ticket.closedAt) && Boolean(message.createdAt)
            && new Date(message.createdAt!).getTime() >= new Date(ticket.closedAt!).getTime())));
    const [action, setAction] = useState<Action | null>(null);
    const [comment, setComment] = useState('');
    const [score, setScore] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [pending, setPending] = useState(false);
    const operation = useRef(false);
    const active = useRef(true);
    useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);

    async function run(operationFn: () => Promise<Partial<LifecycleTicket>>, successKey: string) {
        if (operation.current) return;
        operation.current = true;
        setPending(true);
        try {
            const updated = await operationFn();
            if (!active.current) return;
            onUpdated(updated);
            setAction(null);
            setComment('');
            toast.success(t(successKey));
        } catch {
            if (active.current) toast.error(t('action_error'));
        } finally {
            operation.current = false;
            if (active.current) setPending(false);
        }
    }

    function submitAction() {
        const text = comment.trim();
        if (!text || !action) return;
        if (action === 'CONTINUE' && isOwner && reviewing) {
            void run(() => api.tickets.resolution(ticket.id, 'CONTINUE', text), 'continued');
        } else if (action === 'CLOSE' && isStaff && permitted('ticket:close') && ticket.status !== 'CLOSED') {
            void run(() => api.tickets.close(ticket.id, text), 'closed');
        } else if (action === 'REQUEST' && isOwner && ticket.status === 'CLOSED' && !pendingRequest) {
            void run(() => api.tickets.requestReopen(ticket.id, text), 'request_sent');
        }
    }

    const openAction = (next: Action) => { setComment(''); setAction(next); };
    const actionTitle = action === 'CLOSE' ? 'staff_close' : action === 'CONTINUE' ? 'continue_support' : 'request_reopen';
    const showRating = isOwner && !hasRating && (reviewing || ticket.status === 'CLOSED');
    return (
        <section aria-label={t('section_label')} className="mt-3 space-y-3 border-t border-border/50 pt-3">
            <div className="flex flex-wrap items-center gap-2 [&>button]:h-auto [&>button]:min-h-8 [&>button]:max-w-full [&>button]:whitespace-normal [&>button]:text-left [&>button>svg]:shrink-0">
                {isOwner && ACTIVE_STATUSES.includes(ticket.status) && (
                    <Button disabled={pending} onClick={() => void run(() => api.tickets.resolution(ticket.id, 'CONFIRM'), 'closed')} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />{t('confirm_resolution')}
                    </Button>
                )}
                {isOwner && reviewing && <Button variant="outline" disabled={pending} onClick={() => openAction('CONTINUE')}>{t('continue_support')}</Button>}
                {isOwner && ticket.status === 'CLOSED' && !pendingRequest && <Button variant="outline" disabled={pending} onClick={() => openAction('REQUEST')}>{t('request_reopen')}</Button>}
                {isStaff && permitted('ticket:update') && ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER'].includes(ticket.status) && (
                    <Button variant="outline" disabled={pending} onClick={() => void run(() => api.tickets.updateStatus(ticket.id, 'PENDING_CUSTOMER_REVIEW'), 'review_sent')}>{t('send_resolution')}</Button>
                )}
                {isStaff && permitted('ticket:close') && ticket.status !== 'CLOSED' && (
                    <Button variant="outline" disabled={pending} onClick={() => openAction('CLOSE')}>{t('staff_close')}</Button>
                )}
            </div>
            {reviewing && <p className="text-sm text-muted-foreground">{t(isOwner ? 'review_owner' : 'review_staff')}</p>}
            {pendingRequest && (isOwner || isStaff) && <p role="status" className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">{t('reopen_request_pending')}</p>}
            {hasRating && (isOwner || isStaff) && (
                <div className="rounded-md border border-border p-3 text-sm">
                    <p>{t('previous_rating', { score: ticket.satisfactionScore! })}</p>
                    {ticket.satisfactionComment && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{ticket.satisfactionComment}</p>}
                </div>
            )}
            {showRating && (
                <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
                    <h3 className="text-sm font-semibold">{t('rating_title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('rating_description')}</p>
                    <fieldset disabled={pending}>
                        <legend className="sr-only">{t('rating_label')}</legend>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(value => (
                                <label key={value} className="cursor-pointer">
                                    <input type="radio" className="peer sr-only" name={`ticket-rating-${ticket.id}`} checked={score === value} onChange={() => setScore(value)} aria-label={t('rating_option', { score: value })} />
                                    <span className="flex rounded-md p-2 text-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"><Star className={`h-6 w-6 ${score >= value ? 'fill-current' : ''}`} aria-hidden="true" /></span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <label htmlFor="ticket-rating-comment" className="block text-sm">{t('rating_comment')}</label>
                    <Textarea id="ticket-rating-comment" maxLength={2000} value={ratingComment} disabled={pending} onChange={event => setRatingComment(event.target.value)} />
                    <Button variant="outline" disabled={pending || score === 0} onClick={() => void run(() => api.tickets.feedback(ticket.id, score, ratingComment.trim() || undefined), 'rating_saved')}>{t('submit_rating')}</Button>
                </div>
            )}
            <Dialog open={action !== null} onOpenChange={open => { if (!open && !pending) setAction(null); }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{t(actionTitle)}</DialogTitle><DialogDescription>{t(action === 'CLOSE' ? 'close_description' : action === 'CONTINUE' ? 'continue_description' : 'request_description')}</DialogDescription></DialogHeader>
                    <label htmlFor="ticket-action-comment" className="text-sm font-medium">{t('action_comment')}</label>
                    <Textarea id="ticket-action-comment" maxLength={2000} value={comment} onChange={event => setComment(event.target.value)} disabled={pending} />
                    <Button disabled={pending || !comment.trim()} onClick={submitAction}>{t(pending ? 'saving' : 'submit_action')}</Button>
                </DialogContent>
            </Dialog>
        </section>
    );
}
