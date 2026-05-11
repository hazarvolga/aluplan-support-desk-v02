const TURKISH_STOPWORDS = new Set([
  've', 'veya', 'ile', 'için', 'bu', 'şu', 'o', 'bir', 'iki', 'üç', 'dört', 'beş',
  'var', 'yok', 'ne', 'nasıl', 'neden', 'niye', 'hangisi', 'hangi', 'kim', 'kimin',
  'ama', 'fakat', 'lakin', 'ancak', 'oysa', 'de', 'da', 'mi', 'mu', 'mı', 'mü',
  'sen', 'siz', 'o', 'biz', 'onlar', 'ben', 'sizin', 'bizim', 'onların',
  'benim', 'senin', 'onun', 'bizimki', 'sizinki', 'onunki',
  'ol', 'oldu', 'olacak', 'olur', 'oluyor', 'olmuş', 'olan',
  'yap', 'yaptı', 'yapacak', 'yapar', 'yapıyor', 'yapmış', 'yapan',
  'gel', 'geldi', 'gelecek', 'gelir', 'geliyor', 'gelmiş', 'gelen',
  'git', 'gitti', 'gidecek', 'gider', 'gidiyor', 'gitmiş', 'giden',
  'ver', 'verdi', 'verecek', 'verir', 'veriyor', 'vermiş', 'veren',
  'al', 'aldı', 'alacak', 'alır', 'alıyor', 'almış', 'alan',
  'düşün', 'düşündü', 'düşünecek', 'düşünür', 'düşünüyor', 'düşünmüş', 'düşünen',
  'bil', 'bildi', 'bilecek', 'bilir', 'biliyor', 'bilmiş', 'bilen',
  'gör', 'gördü', 'görecek', 'görür', 'görüyor', 'görmüş', 'gören',
  'söyle', 'söyledi', 'söyleyecek', 'söyler', 'söylüyor', 'söylemiş', 'söyleyen',
  'getir', 'getirdi', 'getirecek', 'getirir', 'getiriyor', 'getirmiş', 'getiren',
  'gönder', 'gönderdi', 'gönderecek', 'gönderir', 'gönderiyor', 'göndermiş', 'gönderen',
  'koy', 'koydu', 'koyacak', 'koyar', 'koyuyor', 'koymuş', 'koyan',
  'dur', 'durdu', 'duracak', 'durur', 'duruyor', 'durmuş', 'duran',
  'başla', 'başladı', 'başlayacak', 'başlar', 'başlıyor', 'başlamış', 'başlayan',
  'bitir', 'bitirdi', 'bitirecek', 'bitirir', 'bitiriyor', 'bitirmiş', 'bitiren',
  'öyle', 'böyle', 'şöyle', 'nasıl', 'niçin', 'nerede', 'neyi', 'nereye',
]);

const ENGLISH_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
  'at', 'from', 'by', 'on', 'off', 'for', 'in', 'out', 'over', 'to',
  'into', 'with', 'about', 'against', 'between', 'through', 'during',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'why',
  'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once',
]);

const GERMAN_STOPWORDS = new Set([
  'und', 'oder', 'aber', 'sondern', 'denn', 'weil', 'da', 'wenn', 'ob',
  'für', 'gegen', 'von', 'mit', 'ohne', 'an', 'auf', 'aus', 'bei', 'in',
  'nach', 'zu', 'zur', 'zum', 'über', 'unter', 'vor', 'hinter', 'zwischen',
  'sein', 'hat', 'hatte', 'werden', 'wird', 'wurde', 'kann', 'konnte',
  'muss', 'musste', 'mag', 'mochte', 'soll', 'sollte', 'will', 'wollte',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'was', 'wer', 'wie', 'wo',
  'wann', 'warum', 'welcher', 'welche', 'welches', 'dieser', 'jener',
  'alle', 'ein', 'eine', 'einer', 'einem', 'einen', 'kein', 'keine',
  'nicht', 'auch', 'noch', 'schon', 'sehr', 'mehr', 'nur', 'aber',
]);

const ALL_STOPWORDS = new Set([...TURKISH_STOPWORDS, ...ENGLISH_STOPWORDS, ...GERMAN_STOPWORDS]);

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\sçğıöşüÇĞİÖŞÜäöüÄÖÜß]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !ALL_STOPWORDS.has(w));

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

export function rewriteQueryWithHistory(
  currentQuery: string,
  history: HistoryMessage[] | undefined
): string {
  if (!history || history.length === 0) {
    return currentQuery;
  }

  const recentHistory = history.slice(-3);
  const allContent = recentHistory.map(h => h.content).join(' ');

  const historyKeywords = extractKeywords(allContent);
  const currentKeywords = extractKeywords(currentQuery);

  const newContext = historyKeywords.filter(k => !currentKeywords.includes(k));

  if (newContext.length === 0) {
    return currentQuery;
  }

  return `${currentQuery} [Bağlam: ${newContext.slice(0, 5).join(', ')}]`;
}