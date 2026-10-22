export const clearBrowserSessionCookies = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    const response = await fetch('/api/auth/clear-session', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!response.ok) throw new Error('Browser session cookies could not be cleared.');
};
