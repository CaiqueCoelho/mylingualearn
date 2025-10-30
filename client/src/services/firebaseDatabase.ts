import { getDatabase, ref, set, get, push, update, remove, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import { app } from './firebaseConfig';

const db = getDatabase(app);

/**
 * Firebase Realtime Database Service
 * Main database for all app data
 */

// ============= ARTICLES =============

export async function saveArticle(article: any) {
  const articleRef = ref(db, `articles/${article.id}`);
  await set(articleRef, {
    ...article,
    createdAt: article.createdAt || Date.now(),
  });
}

export async function saveArticles(articles: any[]) {
  const updates: any = {};
  articles.forEach(article => {
    updates[`articles/${article.id}`] = {
      ...article,
      createdAt: article.createdAt || Date.now(),
    };
  });
  await update(ref(db), updates);
}

export async function getArticles(limit: number = 20) {
  const articlesRef = ref(db, 'articles');
  const articlesQuery = query(articlesRef, orderByChild('publishedAt'), limitToLast(limit));
  const snapshot = await get(articlesQuery);
  
  if (!snapshot.exists()) return [];
  
  const articles = snapshot.val();
  return Object.entries(articles)
    .map(([id, data]: [string, any]) => ({ id, ...data }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticleById(id: string) {
  const articleRef = ref(db, `articles/${id}`);
  const snapshot = await get(articleRef);
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
}

// ============= USER VOCABULARY =============

export async function saveWord(userId: string, word: any) {
  const wordsRef = ref(db, `users/${userId}/vocabulary`);
  const newWordRef = push(wordsRef);
  await set(newWordRef, {
    ...word,
    createdAt: Date.now(),
  });
  return newWordRef.key;
}

export async function getVocabulary(userId: string) {
  const wordsRef = ref(db, `users/${userId}/vocabulary`);
  const snapshot = await get(wordsRef);
  
  if (!snapshot.exists()) return [];
  
  const words = snapshot.val();
  return Object.entries(words).map(([id, data]: [string, any]) => ({
    id,
    ...data,
  }));
}

export async function updateWord(userId: string, wordId: string, updates: any) {
  const wordRef = ref(db, `users/${userId}/vocabulary/${wordId}`);
  await update(wordRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteWord(userId: string, wordId: string) {
  const wordRef = ref(db, `users/${userId}/vocabulary/${wordId}`);
  await remove(wordRef);
}

// ============= USER PROFILE =============

export async function saveUserProfile(userId: string, profile: any) {
  const profileRef = ref(db, `users/${userId}/profile`);
  await set(profileRef, {
    ...profile,
    updatedAt: Date.now(),
  });
}

export async function getUserProfile(userId: string) {
  const profileRef = ref(db, `users/${userId}/profile`);
  const snapshot = await get(profileRef);
  return snapshot.exists() ? snapshot.val() : null;
}

// ============= READING HISTORY =============

export async function saveReadingHistory(userId: string, articleId: string, data: any) {
  const historyRef = ref(db, `users/${userId}/readingHistory/${articleId}`);
  await set(historyRef, {
    ...data,
    timestamp: Date.now(),
  });
}

export async function getReadingHistory(userId: string) {
  const historyRef = ref(db, `users/${userId}/readingHistory`);
  const snapshot = await get(historyRef);
  
  if (!snapshot.exists()) return [];
  
  const history = snapshot.val();
  return Object.entries(history).map(([articleId, data]: [string, any]) => ({
    articleId,
    ...data,
  }));
}

// ============= PROGRESS =============

export async function saveProgress(userId: string, progress: any) {
  const progressRef = ref(db, `users/${userId}/progress`);
  await update(progressRef, {
    ...progress,
    lastUpdated: Date.now(),
  });
}

export async function getProgress(userId: string) {
  const progressRef = ref(db, `users/${userId}/progress`);
  const snapshot = await get(progressRef);
  return snapshot.exists() ? snapshot.val() : {
    xp: 0,
    level: 1,
    streak: 0,
    lastActivity: null,
  };
}

// ============= ACTIVITIES =============

export async function logActivity(userId: string, activity: any) {
  const activitiesRef = ref(db, `users/${userId}/activities`);
  const newActivityRef = push(activitiesRef);
  await set(newActivityRef, {
    ...activity,
    timestamp: Date.now(),
  });
}

export async function getActivities(userId: string, limit: number = 50) {
  const activitiesRef = ref(db, `users/${userId}/activities`);
  const activitiesQuery = query(activitiesRef, orderByChild('timestamp'), limitToLast(limit));
  const snapshot = await get(activitiesQuery);
  
  if (!snapshot.exists()) return [];
  
  const activities = snapshot.val();
  return Object.entries(activities)
    .map(([id, data]: [string, any]) => ({ id, ...data }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

// ============= QUIZ RESULTS =============

export async function saveQuizResult(userId: string, result: any) {
  const quizzesRef = ref(db, `users/${userId}/quizResults`);
  const newQuizRef = push(quizzesRef);
  await set(newQuizRef, {
    ...result,
    completedAt: Date.now(),
  });
  return newQuizRef.key;
}

export async function getQuizResults(userId: string) {
  const quizzesRef = ref(db, `users/${userId}/quizResults`);
  const snapshot = await get(quizzesRef);
  
  if (!snapshot.exists()) return [];
  
  const quizzes = snapshot.val();
  return Object.entries(quizzes)
    .map(([id, data]: [string, any]) => ({ id, ...data }))
    .sort((a, b) => b.completedAt - a.completedAt);
}

// ============= NEWS FETCH CACHE =============

export async function getNewsFetchCache(topic: string) {
  const cacheRef = ref(db, `newsCache/${topic}`);
  const snapshot = await get(cacheRef);
  
  if (!snapshot.exists()) return null;
  
  const cache = snapshot.val();
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Check if cache is still valid (less than 24 hours old)
  if (cache.fetchedAt < oneDayAgo) {
    return null;
  }
  
  return cache;
}

export async function saveNewsFetchCache(topic: string, articles: any[]) {
  const cacheRef = ref(db, `newsCache/${topic}`);
  await set(cacheRef, {
    topic,
    articles,
    fetchedAt: Date.now(),
  });
}

