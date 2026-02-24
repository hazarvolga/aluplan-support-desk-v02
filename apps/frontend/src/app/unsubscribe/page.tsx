'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailX, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [message, setMessage] = useState('');

    const handleUnsubscribe = async () => {
        if (!token) {
            setStatus('error');
            setMessage('Geçersiz veya eksik abonelik anahtarı.');
            return;
        }

        try {
            setStatus('loading');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setMessage(data.message || 'Bir hata oluştu.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Sistem bağlantısı kurulamadı.');
        }
    };

    return (
        <CardContent className="pt-6 text-center space-y-6">
            {status === 'idle' && (
                <>
                    <p className="text-slate-600">
                        Tüm bilgilendirme e-postalarından çıkmak istediğinize emin misiniz?
                    </p>
                    <Button
                        onClick={handleUnsubscribe}
                        className="w-full h-12 text-lg"
                    >
                        Abonelikten Çık
                    </Button>
                </>
            )}

            {status === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium text-center">
                        Talebiniz işleniyor...
                    </p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">Başarıyla Çıkış Yapıldı</h3>
                    <p className="text-slate-600">
                        Artık bizden bilgilendirme e-postası almayacaksınız. İstediğiniz zaman profil ayarlarınızdan tekrar açabilirsiniz.
                    </p>
                    <div className="pt-4 border-t">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-destructive">Hata Oluştu</h3>
                    <p className="text-slate-600">{message}</p>
                    <div className="pt-4 border-t">
                        <Link href="/" className="text-primary hover:underline font-medium">
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            )}
        </CardContent>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-slate-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <MailX className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">E-Posta Aboneliği</CardTitle>
                    <CardDescription>Bilgilendirme e-postalarını yönetin.</CardDescription>
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
