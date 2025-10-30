/**
 * Type definitions for Chrome Translator API
 * https://developer.chrome.com/docs/ai/translator-api
 */

interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: TranslatorMonitor) => void;
}

interface TranslatorMonitor {
  addEventListener(type: 'downloadprogress', listener: (event: DownloadProgressEvent) => void): void;
}

interface DownloadProgressEvent {
  loaded: number;
  total: number;
}

interface TranslatorInstance {
  translate(text: string): Promise<string>;
  translateStreaming(text: string): AsyncIterable<string>;
  destroy(): void;
}

interface TranslatorConstructor {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<'available' | 'downloadable' | 'no'>;
  create(options: TranslatorOptions): Promise<TranslatorInstance>;
}

declare global {
  const Translator: TranslatorConstructor;
}

export {};
