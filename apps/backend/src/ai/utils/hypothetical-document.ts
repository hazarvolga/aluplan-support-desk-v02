export interface HyDEOptions {
  maxLength?: number;
  language?: 'tr' | 'en' | 'de';
}

const HYDE_TEMPLATE_TR = `Allplan hakkında bir destek makalesi:

Başlık: {{query}}
İçerik: Kullanıcı Allplan'da {{query}} konusu hakkında yardım istiyor. Bu sorun genellikle şu nedenlerden kaynaklanır: 1) Ayarlar menüsünde ilgili konfigürasyonun doğru yapılandırılmaması, 2) Eklenti veya modül uyumsuzluğu, 3) Modelleme araçlarının yanlış kullanımı, 4) Lisans veya yetkilendirme sorunu. Çözüm adımları: Önce güncel sürümü kullandığınızdan emin olun, ardından ilgili modülün dokümantasyonunu kontrol edin.`;

const HYDE_TEMPLATE_EN = `Allplan support article:

Title: {{query}}
Content: User is asking about {{query}} in Allplan. This issue usually occurs due to: 1) Misconfiguration in settings, 2) Plugin or module incompatibility, 3) Incorrect use of modeling tools, 4) License or authorization issue. Solution steps: First ensure you are using the latest version, then check the relevant module documentation.`;

const HYDE_TEMPLATE_DE = `Allplan-Supportartikel:

Titel: {{query}}
Inhalt: Der Benutzer bittet um Hilfe bei {{query}} in Allplan. Dieses Problem tritt normalerweise auf wegen: 1) Fehlkonfiguration in den Einstellungen, 2) Plugin- oder Modulinkompatibilität, 3) Falsche Verwendung von Modellierungswerkzeugen, 4) Lizenz- oder Autorisierungsproblem. Lösungsschritte: Stellen Sie zuerst sicher, dass Sie die neueste Version verwenden, dann überprüfen Sie die Dokumentation des entsprechenden Moduls.`;

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