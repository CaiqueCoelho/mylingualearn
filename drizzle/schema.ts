import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profile and learning preferences
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1"]).default("A2").notNull(),
  learningGoals: text("learningGoals"),
  topics: text("topics"), // JSON array of topics
  dailyGoalMinutes: int("dailyGoalMinutes").default(15).notNull(),
  streakDays: int("streakDays").default(0).notNull(),
  lastActiveDate: timestamp("lastActiveDate"),
  totalXp: int("totalXp").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Articles fetched from news sources
 */
export const articles = mysqlTable("articles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body").notNull(),
  topics: text("topics"), // JSON array
  publishedAt: timestamp("publishedAt").notNull(),
  readingLevel: mysqlEnum("readingLevel", ["A2", "B1", "B2", "C1"]).default("B1").notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: text("sourceUrl"),
  imageUrl: text("imageUrl"),
  isScraped: boolean("isScraped").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * User's saved vocabulary words with SRS data
 */
export const savedWords = mysqlTable("saved_words", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lemma: varchar("lemma", { length: 255 }).notNull(),
  pos: varchar("pos", { length: 50}), // part of speech
  ipa: varchar("ipa", { length: 255 }), // pronunciation
  enDef: text("enDef"), // English definition
  ptDef: text("ptDef"), // Portuguese translation
  example: text("example"),
  sourceArticleId: varchar("sourceArticleId", { length: 255 }),
  easiness: float("easiness").default(2.5).notNull(), // SM-2 algorithm
  interval: int("interval").default(1).notNull(), // days
  repetitions: int("repetitions").default(0).notNull(),
  nextReview: timestamp("nextReview").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedWord = typeof savedWords.$inferSelect;
export type InsertSavedWord = typeof savedWords.$inferInsert;

/**
 * User's reading history
 */
export const readingHistory = mysqlTable("reading_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  articleId: varchar("articleId", { length: 255 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  timeSpentSeconds: int("timeSpentSeconds").default(0).notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = typeof readingHistory.$inferInsert;

/**
 * Quiz results
 */
export const quizResults = mysqlTable("quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  articleId: varchar("articleId", { length: 255 }).notNull(),
  score: int("score").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  answers: text("answers"), // JSON array of user answers
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

/**
 * User activity log for streak and XP tracking
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: mysqlEnum("activityType", ["read", "quiz", "vocab", "game", "chat"]).notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * News fetch cache to track daily API calls
 */
export const newsFetchCache = mysqlTable("news_fetch_cache", {
  id: int("id").autoincrement().primaryKey(),
  topic: varchar("topic", { length: 100 }).notNull(),
  fetchDate: timestamp("fetchDate").notNull(),
  articleCount: int("articleCount").default(0).notNull(),
  source: varchar("source", { length: 50 }).default("newsdata").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsFetchCache = typeof newsFetchCache.$inferSelect;
export type InsertNewsFetchCache = typeof newsFetchCache.$inferInsert;

