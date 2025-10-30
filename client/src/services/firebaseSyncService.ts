import { getDatabase, ref, set, get, push, update, remove } from 'firebase/database';
import { app } from './firebaseConfig';

const db = getDatabase(app);

/**
 * Firebase Realtime Database Sync Service
 * Syncs user data between local DB and Firebase
 */

export const firebaseSync = {
  // User Profile
  async saveUserProfile(userId: string, profile: any) {
    const userRef = ref(db, `users/${userId}/profile`);
    await set(userRef, {
      ...profile,
      updatedAt: Date.now(),
    });
  },

  async getUserProfile(userId: string) {
    const userRef = ref(db, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  },

  // Saved Words (Vocabulary)
  async saveWord(userId: string, word: any) {
    const wordsRef = ref(db, `users/${userId}/vocabulary`);
    const newWordRef = push(wordsRef);
    await set(newWordRef, {
      ...word,
      createdAt: Date.now(),
    });
    return newWordRef.key;
  },

  async getVocabulary(userId: string) {
    const wordsRef = ref(db, `users/${userId}/vocabulary`);
    const snapshot = await get(wordsRef);
    if (!snapshot.exists()) return [];
    
    const words = snapshot.val();
    return Object.entries(words).map(([id, data]: [string, any]) => ({
      id,
      ...data,
    }));
  },

  async updateWord(userId: string, wordId: string, updates: any) {
    const wordRef = ref(db, `users/${userId}/vocabulary/${wordId}`);
    await update(wordRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async deleteWord(userId: string, wordId: string) {
    const wordRef = ref(db, `users/${userId}/vocabulary/${wordId}`);
    await remove(wordRef);
  },

  // Reading History
  async saveReadingHistory(userId: string, articleId: string, data: any) {
    const historyRef = ref(db, `users/${userId}/readingHistory/${articleId}`);
    await set(historyRef, {
      ...data,
      timestamp: Date.now(),
    });
  },

  async getReadingHistory(userId: string) {
    const historyRef = ref(db, `users/${userId}/readingHistory`);
    const snapshot = await get(historyRef);
    if (!snapshot.exists()) return [];
    
    const history = snapshot.val();
    return Object.entries(history).map(([articleId, data]: [string, any]) => ({
      articleId,
      ...data,
    }));
  },

  // Progress & Activity
  async saveProgress(userId: string, progress: any) {
    const progressRef = ref(db, `users/${userId}/progress`);
    await update(progressRef, {
      ...progress,
      lastUpdated: Date.now(),
    });
  },

  async getProgress(userId: string) {
    const progressRef = ref(db, `users/${userId}/progress`);
    const snapshot = await get(progressRef);
    return snapshot.exists() ? snapshot.val() : null;
  },

  async logActivity(userId: string, activity: any) {
    const activitiesRef = ref(db, `users/${userId}/activities`);
    const newActivityRef = push(activitiesRef);
    await set(newActivityRef, {
      ...activity,
      timestamp: Date.now(),
    });
  },

  async getActivities(userId: string, limit: number = 50) {
    const activitiesRef = ref(db, `users/${userId}/activities`);
    const snapshot = await get(activitiesRef);
    if (!snapshot.exists()) return [];
    
    const activities = snapshot.val();
    return Object.entries(activities)
      .map(([id, data]: [string, any]) => ({ id, ...data }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  // Quiz Results
  async saveQuizResult(userId: string, result: any) {
    const quizzesRef = ref(db, `users/${userId}/quizResults`);
    const newQuizRef = push(quizzesRef);
    await set(newQuizRef, {
      ...result,
      completedAt: Date.now(),
    });
    return newQuizRef.key;
  },

  async getQuizResults(userId: string) {
    const quizzesRef = ref(db, `users/${userId}/quizResults`);
    const snapshot = await get(quizzesRef);
    if (!snapshot.exists()) return [];
    
    const quizzes = snapshot.val();
    return Object.entries(quizzes)
      .map(([id, data]: [string, any]) => ({ id, ...data }))
      .sort((a, b) => b.completedAt - a.completedAt);
  },

  // Saved Articles (for offline access)
  async saveArticle(userId: string, article: any) {
    const articlesRef = ref(db, `users/${userId}/savedArticles/${article.id}`);
    await set(articlesRef, {
      ...article,
      savedAt: Date.now(),
    });
  },

  async getSavedArticles(userId: string) {
    const articlesRef = ref(db, `users/${userId}/savedArticles`);
    const snapshot = await get(articlesRef);
    if (!snapshot.exists()) return [];
    
    const articles = snapshot.val();
    return Object.values(articles);
  },

  async removeArticle(userId: string, articleId: string) {
    const articleRef = ref(db, `users/${userId}/savedArticles/${articleId}`);
    await remove(articleRef);
  },
};

