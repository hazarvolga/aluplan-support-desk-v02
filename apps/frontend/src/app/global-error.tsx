'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="antialiased">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100%',
                    backgroundColor: '#09090b',
                    color: '#fafafa',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '1.2rem', color: '#71717a', marginBottom: '1rem' }}>SYSTEM CRITICAL</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
                        Application Level Failure
                    </h1>
                    <p style={{ maxWidth: '32rem', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '2rem' }}>
                        A critical runtime error has occurred. The dashboard environment has been halted.
                        Please refresh the browser or contact structural support.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#fafafa',
                            color: '#09090b',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Hard Reset Dashboard
                    </button>
                    {error.digest && (
                        <div style={{ marginTop: '3rem', fontSize: '0.75rem', color: '#3f3f46', fontFamily: 'monospace' }}>
                            CORE_DIGEST: {error.digest}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
