'use client';

import { use, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Survey = { ticketNumber: string };

export default function PublicFeedbackPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const t = useTranslations('public_feedback');
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [unavailable, setUnavailable] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(false);

    useEffect(() => {
        let active = true;
        api.tickets.getCsatSurvey(token)
            .then((result) => { if (active) setSurvey(result); })
            .catch(() => { if (active) setUnavailable(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [token]);

    const submit = async () => {
        if (rating === null || submitting || submitted) return;
        setSubmitting(true);
        setSubmitError(false);
        try {
            await api.tickets.submitCsatFeedback(token, rating, comment.trim() || undefined);
            setSubmitted(true);
        } catch {
            setSubmitError(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <Card className="w-full max-w-lg overflow-hidden border-border/70 shadow-xl">
                <header className="border-b border-border/60 px-6 py-5 text-center">
                    <p className="font-semibold tracking-[0.28em] text-foreground">ALUPLAN</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Allplan Teknik Destek</p>
                </header>
                {loading ? (
                    <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                        <p role="status" className="text-sm text-muted-foreground">{t('loading')}</p>
                    </CardContent>
                ) : unavailable || !survey ? (
                    <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 px-8 text-center">
                        <h1 className="text-xl font-semibold">{t('invalid_title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('invalid_description')}</p>
                    </CardContent>
                ) : submitted ? (
                    <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 px-8 text-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden="true" />
                        <h1 className="text-xl font-semibold">{t('success_title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('success_description')}</p>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="items-center border-0 bg-transparent px-6 pb-1 pt-8 text-center">
                            <CardTitle className="text-xl font-semibold tracking-normal text-foreground">{t('title')}</CardTitle>
                            <p className="pt-2 text-sm text-muted-foreground">{t('description')}</p>
                            <p className="pt-3 text-xs font-medium text-muted-foreground">{t('ticket_reference')} {survey.ticketNumber}</p>
                        </CardHeader>
                        <CardContent className="space-y-6 px-6 pb-8 pt-5">
                            <fieldset className="space-y-3 text-center">
                                <legend className="w-full text-sm font-medium">{t('rating_label')}</legend>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <div key={score}>
                                            <input
                                                id={`rating-${score}`}
                                                className="peer sr-only"
                                                type="radio"
                                                name="feedback-rating"
                                                value={score}
                                                checked={rating === score}
                                                onChange={() => setRating(score)}
                                            />
                                            <label
                                                htmlFor={`rating-${score}`}
                                                className="flex cursor-pointer rounded-md p-2 text-amber-500 transition-colors hover:bg-muted peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                                            >
                                                <span className="sr-only">{t('rating_option', { score })}</span>
                                                <Star className={`h-7 w-7 ${rating !== null && score <= rating ? 'fill-current' : ''}`} aria-hidden="true" />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="space-y-2">
                                <label htmlFor="feedback-comment" className="text-sm font-medium">{t('comment_label')}</label>
                                <Textarea
                                    id="feedback-comment"
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value.slice(0, 2000))}
                                    maxLength={2000}
                                    placeholder={t('comment_placeholder')}
                                    className="min-h-24 resize-y"
                                />
                            </div>
                            {submitError && <p role="alert" className="text-sm text-destructive">{t('submit_error')}</p>}
                            <Button type="button" className="w-full" disabled={rating === null || submitting} onClick={submit}>
                                {submitting ? t('submitting') : t('submit')}
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </main>
    );
}
