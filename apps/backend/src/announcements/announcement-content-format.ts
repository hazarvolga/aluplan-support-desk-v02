/**
 * GAP report GAP-08: `Announcement.contentMjml` is a legacy-named column
 * that today almost always holds plain rich-text HTML from the announcement
 * editor, not MJML. The distinction still matters (broadcast() wraps HTML
 * in an <mj-section> before compiling, but passes MJML through untouched),
 * so it can't just be ignored — it needs an honest name instead of being
 * re-guessed inline wherever it's needed.
 *
 * This does not rename the DB column or the DTO field (no migration) — it
 * gives the existing prefix-detection a single, named, tested home, and lets
 * API responses expose the result explicitly instead of making every
 * consumer re-implement the same guess.
 */
export type AnnouncementContentFormat = 'MJML' | 'RICH_HTML';

export function detectAnnouncementContentFormat(content: string): AnnouncementContentFormat {
    const normalized = content.trim().toLowerCase();
    const isMjml = normalized.startsWith('<mjml>') || normalized.startsWith('<mj-');
    return isMjml ? 'MJML' : 'RICH_HTML';
}
