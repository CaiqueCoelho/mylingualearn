/**
 * Chrome AI Service
 * Integrates with Chrome's built-in AI APIs (LanguageModel API for Gemini Nano)
 * Chrome 131+ only - uses global LanguageModel API
 * @see https://developer.chrome.com/docs/ai/get-started
 */

// Type definitions for Chrome AI APIs
interface AILanguageModel {
  prompt(text: string): Promise<string>;
  promptStreaming(text: string): AsyncIterable<string>;
  destroy(): void;
}

type AIAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

/**
 * Check if Chrome AI Prompt API is available
 * Only checks for LanguageModel global (Chrome 131+)
 */
export async function isPromptApiAvailable(): Promise<boolean> {
  try {
    if (typeof LanguageModel === 'undefined' || !LanguageModel.availability) {
      return false;
    }
    
    const status = await LanguageModel.availability();
    return status === 'available';
  } catch {
    return false;
  }
}

/**
 * Get current availability status
 */
export async function getAvailabilityStatus(): Promise<AIAvailability | null> {
  try {
    if (typeof LanguageModel === 'undefined' || !LanguageModel.availability) {
      return null;
    }
    
    return await LanguageModel.availability();
  } catch {
    return null;
  }
}

/**
 * Create a language model session
 */
async function createSession(systemPrompt?: string): Promise<AILanguageModel> {
  if (typeof LanguageModel === 'undefined') {
    throw new Error('Chrome AI not available - requires Chrome 131+');
  }
  
  return await LanguageModel.create({
    systemPrompt,
  });
}

/**
 * Translate text from English to Portuguese
 */
export async function translateText(text: string): Promise<string> {
  try {
    const session = await createSession(
      'You are a translator. Translate English text to Brazilian Portuguese. Return ONLY the translation, no explanations.'
    );
    
    const response = await session.prompt(text);
    session.destroy();
    
    return response;
  } catch (error) {
    console.error('[ChromeAI] Translation error:', error);
    throw error;
  }
}

/**
 * Generate comprehension questions from article
 */
export async function generateQuestions(article: { title: string; body: string }): Promise<any[]> {
  try {
    const systemPrompt = `You MUST generate quiz questions in JSON format. Do NOT summarize.
Return ONLY a JSON array of 5 multiple-choice questions.
Format: [{"type":"mcq","question":"...","choices":["A","B","C","D"],"answerKey":0,"rationale":"..."}]`;


    const session = await createSession(systemPrompt);
    
    const prompt = `Create 5 multiple-choice questions about this article.
    Title: ${article.title}
    Body: ${article.body.substring(0, 2000)}

    Return ONLY the JSON array, nothing else.`;
    
    const response = await session.prompt(prompt);
    session.destroy();
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('[ChromeAI] Question generation error:', error);
    return [];
  }
}

/**
 * Simplify article text for lower CEFR levels
 */
export async function simplifyText(text: string, level: string = 'A2'): Promise<string> {
  try {
    const systemPrompt = `Rewrite English text to be appropriate for CEFR ${level} level learners.
Use simpler vocabulary and shorter sentences while keeping the main ideas.`;

    const session = await createSession(systemPrompt);
    
    const response = await session.prompt(`Original text:\n${text.substring(0, 1500)}\n\nSimplified version:`);
    session.destroy();
    
    return response;
  } catch (error) {
    console.error('[ChromeAI] Simplification error:', error);
    return text;
  }
}

/**
 * Chat with AI coach about article
 */
export async function chatWithCoach(
  messages: Array<{ role: 'user' | 'assistant'; text: string }>,
  articleContext?: string
): Promise<string> {
  try {
    const systemPrompt = `You are a friendly English conversation coach for Brazilian learners.
Speak in simple English (A2–B1). Correct gently, add pt-BR hints only when requested ('em português'), and always end with a follow-up question.`;

    const session = await createSession(systemPrompt);
    
    let conversationContext = '';
    
    if (articleContext) {
      conversationContext += `Article context: ${articleContext.substring(0, 500)}\n\n`;
    }
    
    conversationContext += messages.map(m => `${m.role}: ${m.text}`).join('\n');
    conversationContext += '\n\nRespond as the assistant:';
    
    const response = await session.prompt(conversationContext);
    session.destroy();
    
    return response;
  } catch (error) {
    console.error('[ChromeAI] Chat error:', error);
    throw error;
  }
}

/**
 * Score reading difficulty using Prompt API
 */
export async function scoreReadingLevel(text: string): Promise<string> {
  try {
    const systemPrompt = `Analyze English text and determine the CEFR reading level (A2, B1, B2, or C1).
Consider vocabulary complexity, sentence structure, and topic difficulty.
Return ONLY the level code (A2, B1, B2, or C1), nothing else.`;

    const session = await createSession(systemPrompt);
    
    const response = await session.prompt(`Text:\n${text.substring(0, 1000)}\n\nLevel:`);
    session.destroy();
    
    const level = response.trim().toUpperCase();
    
    if (['A2', 'B1', 'B2', 'C1'].includes(level)) {
      return level;
    }
    
    return 'B1';
  } catch (error) {
    console.error('[ChromeAI] Reading level scoring error:', error);
    return 'B1';
  }
}

/**
 * Translate a single word with context
 */
export async function translateWord(word: string): Promise<{
  translation: string;
  phonetic?: string;
  examples?: string[];
}> {
  try {
    const systemPrompt = `You are a language learning assistant. For the given English word, provide:
1. Brazilian Portuguese translation
2. IPA phonetic transcription (if applicable)
3. 2-3 example sentences in English

Return as JSON: { "translation": "...", "phonetic": "...", "examples": ["...", "..."] }`;

    const session = await createSession(systemPrompt);
    
    const response = await session.prompt(word);
    session.destroy();
    
    try {
      const parsed = JSON.parse(response);
      return {
        translation: parsed.translation || word,
        phonetic: parsed.phonetic,
        examples: parsed.examples || [],
      };
    } catch {
      // Fallback if not JSON
      return {
        translation: response.trim(),
        examples: [],
      };
    }
  } catch (error) {
    console.error('[ChromeAI] Word translation error:', error);
    throw error;
  }
}

