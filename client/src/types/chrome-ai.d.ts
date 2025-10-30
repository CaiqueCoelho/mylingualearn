/**
 * Type definitions for Chrome AI APIs (Prompt API for Gemini Nano)
 * Updated for Chrome 131+ with global LanguageModel API
 * @see https://developer.chrome.com/docs/ai/get-started
 */

interface AILanguageModel {
  prompt(text: string): Promise<string>;
  promptStreaming(text: string): AsyncIterable<string>;
  destroy(): void;
}

type AIAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

declare global {
  // New global API (Chrome 131+)
  const LanguageModel: {
    create(options?: {
      systemPrompt?: string;
      temperature?: number;
      topK?: number;
    }): Promise<AILanguageModel>;
    availability(): Promise<AIAvailability>;
  } | undefined;
}

export {};

