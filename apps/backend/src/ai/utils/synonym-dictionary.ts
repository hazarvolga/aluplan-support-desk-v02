/**
 * Multilingual Synonym Dictionary for Query Expansion
 * ====================================================
 * Maps domain-specific terms across TR, EN, DE for RAG query preprocessing.
 * When a user searches in one language, synonyms from all languages are injected
 * to improve recall on multi-language knowledge bases.
 */

export interface SynonymEntry {
    canonical: string;       // Primary term for logging/analytics
    variants: string[];      // All equivalent terms across languages
}

/**
 * Domain-specific synonym groups for Allplan technical support.
 * Each group contains semantically equivalent terms across TR/EN/DE.
 */
export const SYNONYM_GROUPS: SynonymEntry[] = [
    // --- License & Activation ---
    { canonical: 'license_transfer', variants: ['lisans transfer', 'lisans transferi', 'license transfer', 'lizenz übertragen', 'lizenz transfer', 'lisans taşıma', 'lisansımı başka bilgisayarda kullanmak'] },
    { canonical: 'license_activation', variants: ['lisans aktivasyon', 'lisans etkinleştirme', 'license activation', 'lizenzaktivierung', 'lisans anahtar', 'license key', 'lizenzschlüssel'] },
    { canonical: 'license_server', variants: ['lisans sunucu', 'lisans server', 'license server', 'lizenzserver', 'wibu', 'codemeter'] },
    { canonical: 'license_borrow', variants: ['lisans ödünç', 'lisans ausleihen', 'license borrow', 'lizenz ausleihen', 'offline lisans', 'çevrimdışı lisans'] },

    // --- Installation & Setup ---
    { canonical: 'installation', variants: ['kurulum', 'yükleme', 'installation', 'install', 'setup', 'installieren', 'einrichten'] },
    { canonical: 'uninstall', variants: ['kaldırma', 'silme', 'uninstall', 'deinstallieren', 'remove'] },
    { canonical: 'update', variants: ['güncelleme', 'güncelleme yapmak', 'update', 'aktualisieren', 'hotfix', 'service release'] },

    // --- Errors & Issues ---
    { canonical: 'error', variants: ['hata', 'sorun', 'problem', 'error', 'bug', 'fehler', 'issue', 'arıza', 'çalışmıyor', 'açılmıyor'] },
    { canonical: 'crash', variants: ['çökme', 'donma', 'crash', 'absturz', 'takılma', 'kapanıyor', 'yanıt vermiyor', 'not responding', 'freeze'] },
    { canonical: 'performance', variants: ['performans', 'yavaş', 'slow', 'langsam', 'performance', 'leistung', 'gecikme', 'lag'] },

    // --- Allplan Features ---
    { canonical: 'export', variants: ['dışa aktarma', 'export', 'exportieren', 'çıktı alma', 'dxf', 'dwg', 'ifc', 'pdf export'] },
    { canonical: 'import', variants: ['içe aktarma', 'import', 'importieren', 'dosya yükleme', 'veri aktarma'] },
    { canonical: 'printing', variants: ['yazdırma', 'çıktı', 'print', 'drucken', 'plan çıktısı', 'baskı'] },
    { canonical: 'reinforcement', variants: ['donatı', 'betonarme', 'reinforcement', 'bewehrung', 'demir'] },
    { canonical: 'modeling', variants: ['modelleme', '3d modelleme', 'modeling', 'modellierung', 'çizim', 'drawing', 'zeichnung'] },

    // --- System & Hardware ---
    { canonical: 'graphics_card', variants: ['ekran kartı', 'gpu', 'graphics card', 'grafikkarte', 'nvidia', 'amd', 'display adapter'] },
    { canonical: 'driver', variants: ['sürücü', 'driver', 'treiber', 'ekran kartı sürücüsü', 'gpu driver'] },
    { canonical: 'memory', variants: ['bellek', 'ram', 'memory', 'arbeitsspeicher', 'speicher'] },
    { canonical: 'network', variants: ['ağ', 'network', 'netzwerk', 'internet', 'bağlantı', 'connection', 'verbindung'] },

    // --- Project & Data ---
    { canonical: 'project', variants: ['proje', 'project', 'projekt', 'dosya', 'file', 'datei'] },
    { canonical: 'backup', variants: ['yedek', 'yedekleme', 'backup', 'sicherung', 'datensicherung'] },
    { canonical: 'data_loss', variants: ['veri kaybı', 'dosya kayboldu', 'data loss', 'datenverlust', 'kayıp'] },
];

/**
 * Expand a query with synonyms from all language variants.
 * Returns the original query + semantically equivalent expansions.
 */
export function expandQueryWithSynonyms(query: string): { original: string; expanded: string; matchedGroups: string[] } {
    const lowerQuery = query.toLowerCase();
    const matchedGroups: string[] = [];
    const expansions: string[] = [];

    for (const group of SYNONYM_GROUPS) {
        const matched = group.variants.some(v => lowerQuery.includes(v.toLowerCase()));
        if (matched) {
            matchedGroups.push(group.canonical);
            // Add all variants that are NOT already in the query
            for (const variant of group.variants) {
                if (!lowerQuery.includes(variant.toLowerCase())) {
                    expansions.push(variant);
                }
            }
        }
    }

    // Build expanded query: original + top 3 most relevant expansions
    const topExpansions = expansions.slice(0, 5).join(', ');
    const expanded = topExpansions ? `${query} (ilgili: ${topExpansions})` : query;

    return { original: query, expanded, matchedGroups };
}

/**
 * Detect the probable language of a query based on character patterns.
 */
export function detectQueryLanguage(query: string): 'tr' | 'en' | 'de' | 'unknown' {
    // Turkish-specific characters
    if (/[çğıöşüÇĞİÖŞÜ]/.test(query)) return 'tr';
    // German-specific characters
    if (/[äöüßÄÖÜ]/.test(query)) return 'de';
    // Default to Turkish for this domain, or English if it looks like ASCII
    if (/^[a-zA-Z0-9\s.,!?'"()-]+$/.test(query)) return 'en';
    return 'tr';
}
