import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Article {
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
}

interface UserProfile {
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  learningGoals: string;
  topics: string[];
  dailyGoalMinutes: number;
  streakDays: number;
  totalXp: number;
}

interface AppState {
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  
  // Articles
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  currentArticle: Article | null;
  setCurrentArticle: (article: Article | null) => void;
  
  // Reading state
  isReading: boolean;
  setIsReading: (reading: boolean) => void;
  readingStartTime: number | null;
  setReadingStartTime: (time: number | null) => void;
  
  // Chrome AI availability
  translatorAvailable: boolean;
  setTranslatorAvailable: (available: boolean) => void;
  promptApiAvailable: boolean;
  setPromptApiAvailable: (available: boolean) => void;
  
  // UI state
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  timeFilter: 'today' | 'week' | 'all';
  setTimeFilter: (filter: 'today' | 'week' | 'all') => void;
  
  // TTS settings
  ttsRate: number;
  setTtsRate: (rate: number) => void;
  ttsVoice: string | null;
  setTtsVoice: (voice: string | null) => void;
  
  // Progress
  todayXp: number;
  setTodayXp: (xp: number) => void;
  todayMinutes: number;
  setTodayMinutes: (minutes: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User profile
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      // Articles
      articles: [],
      setArticles: (articles) => set({ articles }),
      currentArticle: null,
      setCurrentArticle: (article) => set({ currentArticle: article }),
      
      // Reading state
      isReading: false,
      setIsReading: (reading) => set({ isReading: reading }),
      readingStartTime: null,
      setReadingStartTime: (time) => set({ readingStartTime: time }),
      
      // Chrome AI availability
      translatorAvailable: false,
      setTranslatorAvailable: (available) => set({ translatorAvailable: available }),
      promptApiAvailable: false,
      setPromptApiAvailable: (available) => set({ promptApiAvailable: available }),
      
      // UI state
      selectedTopics: [],
      setSelectedTopics: (topics) => set({ selectedTopics: topics }),
      timeFilter: 'today',
      setTimeFilter: (filter) => set({ timeFilter: filter }),
      
      // TTS settings
      ttsRate: 1.0,
      setTtsRate: (rate) => set({ ttsRate: rate }),
      ttsVoice: null,
      setTtsVoice: (voice) => set({ ttsVoice: voice }),
      
      // Progress
      todayXp: 0,
      setTodayXp: (xp) => set({ todayXp: xp }),
      todayMinutes: 0,
      setTodayMinutes: (minutes) => set({ todayMinutes: minutes }),
    }),
    {
      name: 'mylingualearn-storage',
      partialize: (state) => ({
        userProfile: state.userProfile,
        selectedTopics: state.selectedTopics,
        timeFilter: state.timeFilter,
        ttsRate: state.ttsRate,
        ttsVoice: state.ttsVoice,
      }),
    }
  )
);

