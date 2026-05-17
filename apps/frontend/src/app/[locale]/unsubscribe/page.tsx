'use client';

export const dynamic = "force-dynamic";

import { useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MailX, Loader2 } from 'lucide-react';
import Link from 'next/link';

const copy = {
    tr: {
        invalidToken: 'Geçersiz veya eksik abonelik anahtarı.',
        genericError: 'Bir hata oluştu.',
        connectionError: 'Sistem bağlantısı kurulamadı.',
        confirm: 'Tüm bilgilendirme e-postalarından çıkmak istediğinize emin misiniz?',
        reasonLabel: 'Neden ayrılıyorsunuz? (isteğe bağlı)',
        reasonPlaceholder: 'Bir neden seçin',
        commentLabel: 'Eklemek istediğiniz bir not var mı? (isteğe bağlı)',
        commentPlaceholder: 'Kısa bir not bırakabilirsiniz.',
        button: 'Abonelikten Çık',
        loading: 'Talebiniz işleniyor...',
        successTitle: 'Başarıyla Çıkış Yapıldı',
        successBody: 'Artık bizden bilgilendirme e-postası almayacaksınız. İstediğiniz zaman profil ayarlarınızdan tekrar açabilirsiniz.',
        errorTitle: 'Hata Oluştu',
        home: 'Ana Sayfaya Dön',
        title: 'E-Posta Aboneliği',
        description: 'Bilgilendirme e-postalarını yönetin.',
        reasons: {
            too_many: 'Çok sık e-posta geliyor',
            not_relevant: 'İçerik ilgimi çekmiyor',
            wrong_person: 'Yanlış kişiye geliyor',
            no_longer_using: 'Artık hizmeti kullanmıyorum',
            other: 'Diğer',
        },
    },
    en: {
        invalidToken: 'Invalid or missing unsubscribe token.',
        genericError: 'Something went wrong.',
        connectionError: 'Could not connect to the system.',
        confirm: 'Are you sure you want to unsubscribe from all informational emails?',
        reasonLabel: 'Why are you unsubscribing? (optional)',
        reasonPlaceholder: 'Select a reason',
        commentLabel: 'Anything else you want to add? (optional)',
        commentPlaceholder: 'You can leave a short note.',
        button: 'Unsubscribe',
        loading: 'Processing your request...',
        successTitle: 'Successfully Unsubscribed',
        successBody: 'You will no longer receive informational emails from us. You can turn them back on from your profile settings at any time.',
        errorTitle: 'Something Went Wrong',
        home: 'Back to Home',
        title: 'Email Subscription',
        description: 'Manage informational emails.',
        reasons: {
            too_many: 'I receive too many emails',
            not_relevant: 'The content is not relevant',
            wrong_person: 'Emails are going to the wrong person',
            no_longer_using: 'I no longer use the service',
            other: 'Other',
        },
    },
    de: {
        invalidToken: 'Ungültiger oder fehlender Abmeldeschlüssel.',
        genericError: 'Es ist ein Fehler aufgetreten.',
        connectionError: 'Verbindung zum System konnte nicht hergestellt werden.',
        confirm: 'Möchten Sie sich wirklich von allen Informations-E-Mails abmelden?',
        reasonLabel: 'Warum melden Sie sich ab? (optional)',
        reasonPlaceholder: 'Grund auswählen',
        commentLabel: 'Möchten Sie noch etwas ergänzen? (optional)',
        commentPlaceholder: 'Sie können eine kurze Notiz hinterlassen.',
        button: 'Abmelden',
        loading: 'Ihre Anfrage wird verarbeitet...',
        successTitle: 'Erfolgreich abgemeldet',
        successBody: 'Sie erhalten keine Informations-E-Mails mehr von uns. Sie können diese jederzeit in Ihren Profileinstellungen wieder aktivieren.',
        errorTitle: 'Fehler aufgetreten',
        home: 'Zur Startseite',
        title: 'E-Mail-Abonnement',
        description: 'Informations-E-Mails verwalten.',
        reasons: {
            too_many: 'Ich erhalte zu viele E-Mails',
            not_relevant: 'Die Inhalte sind für mich nicht relevant',
            wrong_person: 'E-Mails gehen an die falsche Person',
            no_longer_using: 'Ich nutze den Dienst nicht mehr',
            other: 'Sonstiges',
        },
    },
} as const;

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const params = useParams<{ locale?: string }>();
    const locale = params.locale === 'en' || params.locale === 'de' ? params.locale : 'tr';
    const t = copy[locale];
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [message, setMessage] = useState('');
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');

    const handleUnsubscribe = async () => {
        if (!token) {
            setStatus('error');
            setMessage(t.invalidToken);
            return;
        }

        try {
            setStatus('loading');
            const apiUrl = typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:4000/api/v1';
            const response = await fetch(`${apiUrl}/email/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    reason: reason || undefined,
                    comment: comment.trim() || undefined,
                }),
            });
            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setMessage(data.message || t.genericError);
            }
        } catch (error) {
            setStatus('error');
            setMessage(t.connectionError);
        }
    };

    return (
        <CardContent className="pt-6 text-center space-y-6">
            {status === 'idle' && (
                <>
                    <p className="text-slate-600">
                        {t.confirm}
                    </p>
                    <div className="space-y-3 text-left">
                        <div className="space-y-2">
                            <Label htmlFor="unsubscribe-reason">{t.reasonLabel}</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger id="unsubscribe-reason">
                                    <SelectValue placeholder={t.reasonPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(t.reasons).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unsubscribe-comment">{t.commentLabel}</Label>
                            <Textarea
                                id="unsubscribe-comment"
                                value={comment}
                                maxLength={1000}
                                onChange={(event) => setComment(event.target.value)}
                                placeholder={t.commentPlaceholder}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleUnsubscribe}
                        className="w-full h-12 text-lg"
                    >
                        {t.button}
                    </Button>
                </>
            )}

            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium text-center">
                        {t.loading}
                    </p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">{t.successTitle}</h3>
                    <p className="text-slate-600">
                        {t.successBody}
                    </p>
                    <div className="pt-4 border-t">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            {t.home}
                        </Link>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-destructive">{t.errorTitle}</h3>
                    <p className="text-slate-600">{message}</p>
                    <div className="pt-4 border-t">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            {t.home}
                        </Link>
                    </div>
                </div>
            )}
        </CardContent>
    );
}

export default function UnsubscribePage() {
    const params = useParams<{ locale?: string }>();
    const locale = params.locale === 'en' || params.locale === 'de' ? params.locale : 'tr';
    const t = copy[locale];

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-slate-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <MailX className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>

                <Suspense fallback={
                    <CardContent className="flex flex-col items-center gap-4 py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                    </CardContent>
                }>
                    <UnsubscribeContent />
                </Suspense>
            </Card>
        </div>
    );
}
