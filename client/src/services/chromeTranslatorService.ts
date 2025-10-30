/**
 * Chrome Translator API Service
 * https://developer.chrome.com/docs/ai/translator-api
 * 
 * Supported languages: Use BCP 47 language codes (e.g., 'en', 'pt', 'es', 'fr')
 */

/**
 * Check if Chrome Translator API is available
 */
export async function isTranslatorAvailable(): Promise<boolean> {
  try {
    // Check for Translator API (Chrome 131+)
    if ('Translator' in self) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[chromeTranslator] Error checking availability:', error);
    return false;
  }
}

/**
 * Check if a specific language pair is available
 * Returns: 'available', 'downloadable', or 'no'
 */
export async function canTranslate(
  sourceLanguage: string,
  targetLanguage: string
): Promise<'available' | 'downloadable' | 'no'> {
  try {
    if (!('Translator' in self)) {
      return 'no';
    }

    // @ts-ignore - Translator API types
    const availability = await Translator.availability({
      sourceLanguage,
      targetLanguage,
    });
    
    return availability as 'available' | 'downloadable' | 'no';
  } catch (error) {
    console.error('[chromeTranslator] Error checking language pair:', error);
    return 'no';
  }
}

/**
 * Translate text using Chrome Translator API
 */
export async function translateText(
  text: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'pt'
): Promise<string> {
  try {
    if (!('Translator' in self)) {
      throw new Error('Translator API not available');
    }

    // Check if language pair is available
    const availability = await canTranslate(sourceLanguage, targetLanguage);
    
    if (availability === 'no') {
      throw new Error(`Translation not available for ${sourceLanguage} -> ${targetLanguage}`);
    }

    // @ts-ignore - Translator API types
    const translator = await Translator.create({
      sourceLanguage,
      targetLanguage,
    });

    // Translate text
    const result = await translator.translate(text);
    
    // Clean up
    if (translator.destroy) {
      translator.destroy();
    }
    
    return result;
  } catch (error: any) {
    console.error('[chromeTranslator] Translation error:', error);
    throw error;
  }
}

/**
 * Translate a single word with context
 * Portuguese (pt) is supported!
 */
export async function translateWord(word: string): Promise<{
  translation: string;
  phonetic?: string;
  examples?: string[];
}> {
  try {
    // Translate from English to Portuguese
    const translation = await translateText(word, 'en', 'pt');
    
    return {
      translation,
      examples: [],
    };
  } catch (error: any) {
    console.error('[chromeTranslator] Word translation error:', error);
    throw error;
  }
}
