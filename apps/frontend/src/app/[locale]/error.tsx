'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Bir şeyler ters gitti!</h2>
            <p className="text-muted-foreground mb-8">Uygulama çalışırken beklenmeyen bir hata oluştu.</p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Tekrar Dene
                </button>
                <Link
                    href="/"
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
