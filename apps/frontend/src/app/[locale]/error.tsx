'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Record the error in Sentry for production tracking
        Sentry.captureException(error);
        console.error('Frontend Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background rounded-xl border border-border shadow-sm">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 text-3xl">
                ⚠️
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Something went wrong</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                We've encountered an unexpected error. Our team has been notified and is working to resolve it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                    onClick={() => reset()}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="px-6 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
            {error.digest && (
                <p className="mt-8 text-xs font-mono text-muted-foreground/60">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
