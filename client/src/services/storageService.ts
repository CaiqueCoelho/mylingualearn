import Dexie, { Table } from 'dexie';

export interface LocalArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  topics: string[];
  publishedAt: Date;
  readingLevel: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  cachedAt: Date;
}

export interface LocalWord {
  id?: number;
  lemma: string;
  pos?: string;
  ipa?: string;
  enDef?: string;
  ptDef?: string;
  example?: string;
  sourceArticleId?: string;
  easiness: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  createdAt: Date;
}

export interface LocalSettings {
  key: string;
  value: any;
}

export interface LocalProgress {
  id?: number;
  date: string; // YYYY-MM-DD
  xp: number;
  activitiesCompleted: number;
  timeSpentMinutes: number;
}

class MyLinguaLearnDB extends Dexie {
  articles!: Table<LocalArticle, string>;
  words!: Table<LocalWord, number>;
  settings!: Table<LocalSettings, string>;
  progress!: Table<LocalProgress, number>;

  constructor() {
    super('MyLinguaLearnDB');
    
    this.version(1).stores({
      articles: 'id, publishedAt, readingLevel, cachedAt',
      words: '++id, lemma, nextReview, createdAt',
      settings: 'key',
      progress: '++id, date'
    });
  }
}

export const db = new MyLinguaLearnDB();

// Article operations
export async function cacheArticles(articles: LocalArticle[]): Promise<void> {
  await db.articles.bulkPut(articles);
}

export async function getCachedArticles(limit: number = 10): Promise<LocalArticle[]> {
  return await db.articles
    .orderBy('publishedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getArticleById(id: string): Promise<LocalArticle | undefined> {
  return await db.articles.get(id);
}

export async function clearOldArticles(daysToKeep: number = 7): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  await db.articles
    .where('cachedAt')
    .below(cutoffDate)
    .delete();
}

// Word operations
export async function saveWord(word: Omit<LocalWord, 'id'>): Promise<number> {
  return await db.words.add(word as LocalWord);
}

export async function getWords(): Promise<LocalWord[]> {
  return await db.words.orderBy('createdAt').reverse().toArray();
}

export async function getWordsForReview(): Promise<LocalWord[]> {
  const now = new Date();
  return await db.words
    .where('nextReview')
    .belowOrEqual(now)
    .toArray();
}

export async function updateWord(id: number, updates: Partial<LocalWord>): Promise<void> {
  await db.words.update(id, updates);
}

export async function deleteWord(id: number): Promise<void> {
  await db.words.delete(id);
}

// Settings operations
export async function getSetting(key: string, defaultValue?: any): Promise<any> {
  const setting = await db.settings.get(key);
  return setting ? setting.value : defaultValue;
}

export async function setSetting(key: string, value: any): Promise<void> {
  await db.settings.put({ key, value });
}

// Progress operations
export async function saveProgress(date: string, data: Omit<LocalProgress, 'id' | 'date'>): Promise<void> {
  const existing = await db.progress.where('date').equals(date).first();
  
  if (existing) {
    await db.progress.update(existing.id!, {
      xp: existing.xp + data.xp,
      activitiesCompleted: existing.activitiesCompleted + data.activitiesCompleted,
      timeSpentMinutes: existing.timeSpentMinutes + data.timeSpentMinutes
    });
  } else {
    await db.progress.add({ date, ...data });
  }
}

export async function getProgressByDateRange(startDate: string, endDate: string): Promise<LocalProgress[]> {
  return await db.progress
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function getTodayProgress(): Promise<LocalProgress | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return await db.progress.where('date').equals(today).first();
}

// Spaced Repetition (SM-2 Algorithm)
export interface SRSResult {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export function calculateSRS(
  quality: number, // 0-5 (0=complete blackout, 5=perfect response)
  easiness: number,
  interval: number,
  repetitions: number
): SRSResult {
  let newEasiness = easiness;
  let newInterval = interval;
  let newRepetitions = repetitions;

  // Update easiness factor
  newEasiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Update repetitions and interval
  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEasiness);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easiness: newEasiness,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview
  };
}

