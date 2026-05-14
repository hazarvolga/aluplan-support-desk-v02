export interface HyDEOptions {
  maxLength?: number;
  language?: 'tr' | 'en' | 'de';
}

const HYDE_TEMPLATE_TR = `Allplan destek bilgi kaynağı:

Başlık: {{query}}
Kapsam: Bu kaynak yalnızca şu kullanıcı sorusunu yanıtlar: {{query}}.
Arama niyeti: {{query}} için doğrudan ilgili teknik açıklama, nedenler, kontrol adımları ve doğrulama bilgileri.`;

const HYDE_TEMPLATE_EN = `Allplan support knowledge source:

Title: {{query}}
Scope: This source directly answers the user question: {{query}}.
Search intent: Technical explanation, causes, checks, and validation steps specifically about {{query}}.`;

const HYDE_TEMPLATE_DE = `Allplan Support-Wissensquelle:

Titel: {{query}}
Umfang: Diese Quelle beantwortet direkt die Benutzerfrage: {{query}}.
Suchintention: Technische Erklärung, Ursachen, Prüfschritte und Validierung speziell zu {{query}}.`;

export function generateHypotheticalDocument(
  query: string,
  options: HyDEOptions = {}
): string {
  const { maxLength = 300, language = 'tr' } = options;

  let template: string;
  switch (language) {
    case 'en':
      template = HYDE_TEMPLATE_EN;
      break;
    case 'de':
      template = HYDE_TEMPLATE_DE;
      break;
    default:
      template = HYDE_TEMPLATE_TR;
  }

  const cleanedQuery = query
    .replace(/\[Bağlam:.*?\]/g, '')
    .replace(/\(ilgili:.*?\)/g, '')
    .trim();

  const hypothetical = template.replace('{{query}}', cleanedQuery);

  if (hypothetical.length > maxLength) {
    return hypothetical.slice(0, maxLength) + '...';
  }

  return hypothetical;
}

export function detectQueryLanguage(query: string): 'tr' | 'en' | 'de' {
  const hasTurkishSpecific = /[çğışÇĞİŞ]/.test(query);
  if (hasTurkishSpecific) return 'tr';

  const hasGermanOnly = /[äßÄ]/.test(query);
  if (hasGermanOnly) return 'de';

  // English: common function words not present in Turkish/German ASCII text
  const englishKeywords = /\b(what|how|why|when|where|who|is|are|can|does|do|the|a|an|it|in|on|at|to|for|of|with|this|that|have|has|i|you|we|they)\b/i;
  if (englishKeywords.test(query)) return 'en';

  return 'tr'; // default Turkish
}
