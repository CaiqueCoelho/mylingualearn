import { eq, desc, and, lte, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userProfiles,
  InsertUserProfile,
  UserProfile,
  articles,
  Article,
  InsertArticle,
  savedWords,
  SavedWord,
  InsertSavedWord,
  readingHistory,
  InsertReadingHistory,
  quizResults,
  InsertQuizResult,
  activityLog,
  InsertActivityLog,
  newsFetchCache,
  InsertNewsFetchCache
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// User Profile helpers
export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserProfile(profile: InsertUserProfile): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(userProfiles).values(profile);
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, userId));
}

// Article helpers
export async function getArticles(limit: number = 20, offset: number = 0): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(limit).offset(offset);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createArticle(article: InsertArticle): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(articles).values(article).onDuplicateKeyUpdate({ set: article });
}

export async function createArticles(articleList: InsertArticle[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (articleList.length === 0) return;
  
  // Insert articles one by one to handle duplicates properly
  for (const article of articleList) {
    try {
      await db.insert(articles).values(article).onDuplicateKeyUpdate({ 
        set: {
          title: article.title,
          summary: article.summary,
          body: article.body,
          topics: article.topics,
          publishedAt: article.publishedAt,
          readingLevel: article.readingLevel,
          source: article.source,
          sourceUrl: article.sourceUrl,
          imageUrl: article.imageUrl,
          isScraped: article.isScraped,
        } 
      });
    } catch (error) {
      console.error('[Database] Error inserting article:', article.id, error);
    }
  }
}

// Saved Words helpers
export async function getUserWords(userId: number): Promise<SavedWord[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(savedWords).where(eq(savedWords.userId, userId)).orderBy(desc(savedWords.createdAt));
}

export async function getWordsForReview(userId: number): Promise<SavedWord[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return await db.select().from(savedWords)
    .where(and(eq(savedWords.userId, userId), lt(savedWords.nextReview, now)))
    .orderBy(savedWords.nextReview);
}

export async function createWord(word: InsertSavedWord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(savedWords).values(word);
}

export async function updateWord(id: number, updates: Partial<InsertSavedWord>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(savedWords).set(updates).where(eq(savedWords.id, id));
}

export async function deleteWord(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(savedWords).where(eq(savedWords.id, id));
}

// Reading History helpers
export async function getUserReadingHistory(userId: number, limit: number = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(readingHistory).where(eq(readingHistory.userId, userId)).orderBy(desc(readingHistory.readAt)).limit(limit);
}

export async function createReadingHistory(history: InsertReadingHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(readingHistory).values(history);
}

export async function updateReadingHistory(id: number, updates: Partial<InsertReadingHistory>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(readingHistory).set(updates).where(eq(readingHistory.id, id));
}

// Quiz Results helpers
export async function getUserQuizResults(userId: number, limit: number = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quizResults).where(eq(quizResults.userId, userId)).orderBy(desc(quizResults.completedAt)).limit(limit);
}

export async function createQuizResult(result: InsertQuizResult): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(quizResults).values(result);
}

// Activity Log helpers
export async function getUserActivityLog(userId: number, limit: number = 100): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(activityLog).where(eq(activityLog.userId, userId)).orderBy(desc(activityLog.createdAt)).limit(limit);
}

export async function createActivityLog(activity: InsertActivityLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(activityLog).values(activity);
}

export async function getTodayActivity(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await db.select().from(activityLog)
    .where(and(eq(activityLog.userId, userId), gte(activityLog.createdAt, today)));
}



// News Fetch Cache helpers
export async function getLastFetchForTopic(topic: string): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await db
    .select()
    .from(newsFetchCache)
    .where(
      and(
        eq(newsFetchCache.topic, topic),
        gte(newsFetchCache.fetchDate, today)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0].fetchDate : null;
}

export async function recordNewsFetch(topic: string, articleCount: number, source: string = 'newsdata'): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(newsFetchCache).values({
    topic,
    fetchDate: new Date(),
    articleCount,
    source,
  });
}

