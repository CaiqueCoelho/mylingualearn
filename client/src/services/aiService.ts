/**
 * AI Service - Fallback automático entre Chrome AI e Server LLM
 */

import * as chromeAi from './chromeAiService';

/**
 * Helper para chamar tRPC mutations via fetch
 * tRPC batch format: { "0": { "json": input } }
 */
async function callTRPC(procedure: string, input: any) {
  const response = await fetch('/api/trpc/' + procedure + '?batch=1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "0": {
        "json": input
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[aiService] tRPC error for ${procedure}:`, errorText);
    throw new Error(`tRPC call failed: ${response.status}`);
  }

  const data = await response.json();
  // tRPC batch response format: [{ "result": { "data": { "json": actualData } } }]
  const result = data[0]?.result?.data?.json || data[0]?.result?.data || data;
  return result;
}

/**
 * Traduz texto usando Chrome AI ou fallback para servidor
 */
export async function translateText(text: string): Promise<string> {
  const chromeAvailable = await chromeAi.isPromptApiAvailable();
  
  if (chromeAvailable) {
    try {
      return await chromeAi.translateText(text);
    } catch (error) {
      console.warn('[aiService] Chrome AI translation failed, using server fallback:', error);
    }
  }

  // Fallback: usar API do servidor
  try {
    const result = await callTRPC('ai.translate', { text });
    return result.translation;
  } catch (error) {
    console.error('[aiService] Server translation failed:', error);
    throw new Error('Tradução não disponível no momento');
  }
}

/**
 * Gera quiz usando Chrome AI ou fallback para servidor
 */
export async function generateQuiz(article: { title: string; body: string }): Promise<any[]> {
  const chromeAvailable = await chromeAi.isPromptApiAvailable();
  
  console.log('[aiService] Chrome AI available:', chromeAvailable);
  
  if (chromeAvailable) {
    try {
      console.log('[aiService] Trying Chrome AI quiz generation...');
      const questions = await chromeAi.generateQuestions(article);
      console.log('[aiService] Chrome AI questions:', questions);
      if (questions && questions.length > 0) {
        return questions;
      }
    } catch (error) {
      console.warn('[aiService] Chrome AI quiz generation failed, using server fallback:', error);
    }
  }

  // Fallback: usar API do servidor
  try {
    console.log('[aiService] Using server LLM fallback for quiz...');
    const result = await callTRPC('ai.generateQuiz', { article });
    console.log('[aiService] Server response:', result);
    
    const questions = result.questions || [];
    console.log('[aiService] Extracted questions:', questions);
    
    return questions;
  } catch (error) {
    console.error('[aiService] Server quiz generation failed:', error);
    throw new Error('Geração de quiz não disponível no momento');
  }
}

/**
 * Chat com coach usando Chrome AI ou fallback para servidor
 */
export async function chatWithCoach(
  messages: Array<{ role: 'user' | 'assistant'; text: string }>,
  articleContext?: string
): Promise<string> {
  const chromeAvailable = await chromeAi.isPromptApiAvailable();
  
  if (chromeAvailable) {
    try {
      return await chromeAi.chatWithCoach(messages, articleContext);
    } catch (error) {
      console.warn('[aiService] Chrome AI chat failed, using server fallback:', error);
    }
  }

  // Fallback: usar API do servidor
  try {
    const result = await callTRPC('ai.chat', { messages, articleContext });
    return result.response;
  } catch (error) {
    console.error('[aiService] Server chat failed:', error);
    throw new Error('Chat não disponível no momento');
  }
}

/**
 * Traduz uma palavra individual
 * 1. Tenta Chrome Translator API
 * 2. Fallback para APIs gratuitas (MyMemory, LibreTranslate)
 * 3. Retorna palavra original se tudo falhar
 */
export async function translateWord(word: string): Promise<{
  translation: string;
  phonetic?: string;
  examples?: string[];
}> {
  try {
    // Try Chrome Translator API first
    const chromeTranslator = await import('./chromeTranslatorService');
    const isAvailable = await chromeTranslator.isTranslatorAvailable();
    
    if (isAvailable) {
      try {
        console.log('[aiService] Using Chrome Translator API for word translation');
        const result = await chromeTranslator.translateWord(word);
        return result;
      } catch (error) {
        console.log('[aiService] Chrome Translator failed, trying free APIs...');
      }
    }
    
    // Fallback to free translation APIs
    console.log('[aiService] Chrome Translator not available, using free translation APIs');
    const freeTranslate = await import('./freeTranslateService');
    const result = await freeTranslate.translateWord(word);
    return result;
  } catch (error) {
    console.error('[aiService] All translation methods failed:', error);
    // Return word as-is
    return { 
      translation: word,
      examples: []
    };
  }
}

