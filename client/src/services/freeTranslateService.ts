/**
 * Free Translation Service - Fallback quando Chrome Translator não está disponível
 * Usa LibreTranslate API (gratuita e open-source)
 */

const LIBRE_TRANSLATE_API = 'https://libretranslate.com/translate';

interface TranslateResponse {
  translatedText: string;
}

/**
 * Traduz texto usando LibreTranslate API (gratuita)
 */
export async function translateWithLibre(
  text: string,
  sourceLang: string = 'en',
  targetLang: string = 'pt'
): Promise<string> {
  try {
    const response = await fetch(LIBRE_TRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data: TranslateResponse = await response.json();
    return data.translatedText;
  } catch (error: any) {
    console.error('[freeTranslate] LibreTranslate error:', error);
    throw error;
  }
}

/**
 * Fallback usando MyMemory API (gratuita, sem API key)
 */
export async function translateWithMyMemory(
  text: string,
  sourceLang: string = 'en',
  targetLang: string = 'pt'
): Promise<string> {
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }

    throw new Error('MyMemory translation failed');
  } catch (error: any) {
    console.error('[freeTranslate] MyMemory error:', error);
    throw error;
  }
}

/**
 * Traduz palavra usando APIs gratuitas (tenta várias em ordem)
 */
export async function translateWord(word: string): Promise<{
  translation: string;
  phonetic?: string;
  examples?: string[];
}> {
  try {
    // Try MyMemory first (faster, no rate limit)
    try {
      const translation = await translateWithMyMemory(word, 'en', 'pt');
      console.log('[freeTranslate] MyMemory translation successful');
      return {
        translation,
        examples: [],
      };
    } catch (error) {
      console.log('[freeTranslate] MyMemory failed, trying LibreTranslate...');
    }

    // Fallback to LibreTranslate
    try {
      const translation = await translateWithLibre(word, 'en', 'pt');
      console.log('[freeTranslate] LibreTranslate translation successful');
      return {
        translation,
        examples: [],
      };
    } catch (error) {
      console.log('[freeTranslate] LibreTranslate failed');
    }

    // Last resort: return word as-is
    console.log('[freeTranslate] All translation services failed, returning word as-is');
    return {
      translation: word,
      examples: [],
    };
  } catch (error: any) {
    console.error('[freeTranslate] Translation error:', error);
    return {
      translation: word,
      examples: [],
    };
  }
}
