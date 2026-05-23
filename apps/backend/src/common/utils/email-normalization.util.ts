export function normalizeEmailAddress(email: string | null | undefined): string {
    return String(email || '').trim().toLowerCase();
}
