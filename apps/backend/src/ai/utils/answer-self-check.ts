import { RAG_CONFIG } from '../../config/rag.config';

export interface SelfCheckResult {
  isReliable: boolean;
  confidence: number;
  concerns: string[];
  shouldEscalate: boolean;
}

export function checkAnswerConfidence(
  answer: string,
  similarityScore?: number,
  matchedKeywords: string[] = []
): SelfCheckResult {
  const concerns: string[] = [];
  let confidence = similarityScore ?? 0.5;

  if (!answer || answer.length < 20) {
    concerns.push('Answer too short');
    confidence -= 0.2;
  }

  const genericPhrases = [
    'anladım', 'merhaba', 'selam', 'teşekkürler', 'yardımcı olabilirim',
    'i understand', 'hello', 'thank you', 'i can help',
    'verstehe', 'hallo', 'danke', 'ich kann helfen'
  ];
  
  const lowerAnswer = answer.toLowerCase();
  if (genericPhrases.some(p => lowerAnswer.includes(p)) && answer.length < 100) {
    concerns.push('Generic placeholder answer detected');
    confidence -= 0.15;
  }

  const hasCodeBlocks = /```[\s\S]*?```/.test(answer);
  const hasListItems = /^\s*[-*•]\s/m.test(answer) || /^\s*\d+\.\s/m.test(answer);
  if (!hasCodeBlocks && !hasListItems && answer.length > 200) {
    concerns.push('Answer lacks structure (no code/list)');
    confidence -= 0.05;
  }

  if (matchedKeywords.length > 0) {
    const keywordMatches = matchedKeywords.filter(k => 
      lowerAnswer.includes(k.toLowerCase())
    ).length;
    const keywordRatio = keywordMatches / matchedKeywords.length;
    if (keywordRatio < 0.3) {
      concerns.push('Low keyword match in answer');
      confidence -= 0.1;
    }
  }

  confidence = Math.max(0, Math.min(1, confidence));

  const isReliable = confidence >= RAG_CONFIG.SIMILARITY.MEDIUM;
  const shouldEscalate = confidence < RAG_CONFIG.SIMILARITY.LOW;

  return {
    isReliable,
    confidence: Math.round(confidence * 100) / 100,
    concerns,
    shouldEscalate
  };
}