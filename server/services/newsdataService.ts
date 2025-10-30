import axios from 'axios';
import { cleanHtmlContent, decodeHtmlEntities } from '../utils/htmlDecoder';

const NEWSDATA_API_KEY = 'pub_855fb746da0e4fc99115fd9551c3e0cb';
const NEWSDATA_BASE_URL = 'https://newsdata.io/api/1/news';

interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  source_id: string;
  source_name: string;
  source_url: string;
  image_url: string | null;
  category: string[];
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
}

/**
 * Map topic to NewsData.io category
 */
function mapTopicToCategory(topic: string): string {
  const mapping: Record<string, string> = {
    'technology': 'technology',
    'science': 'science',
    'business': 'business',
    'sports': 'sports',
    'entertainment': 'entertainment',
    'health': 'health',
    'world news': 'world',
    'environment': 'environment',
    'fashion': 'lifestyle',
    'politics': 'politics',
    'animals': 'science',
    'travel': 'tourism',
    'anime': 'entertainment',
    'movies': 'entertainment',
    'comedy': 'entertainment'
  };
  
  return mapping[topic.toLowerCase()] || 'top';
}

/**
 * Clean HTML entities and special characters
 */
function cleanText(text: string): string {
  return cleanHtmlContent(text);
}

/**
 * Fetch news from NewsData.io API
 */
export async function fetchNewsDataArticles(topic: string, limit: number = 10): Promise<any[]> {
  try {
    const category = mapTopicToCategory(topic);
    
    const response = await axios.get<NewsDataResponse>(NEWSDATA_BASE_URL, {
      params: {
        apikey: NEWSDATA_API_KEY,
        language: 'en',
        category: category,
        size: limit,
      },
      timeout: 10000,
    });

    if (response.data.status !== 'success' || !response.data.results) {
      console.error('[NewsData] API returned error:', response.data);
      return [];
    }

    return response.data.results.map((article) => {
      // Create article ID from source
      const id = article.article_id || 
                 Buffer.from(`${article.source_id}-${article.title}`).toString('base64').substring(0, 32);
      
      // Use description as main content (content field requires paid plan)
      let fullContent = '';
      if (article.description) {
        fullContent = cleanText(article.description);
      }
      
      // Ensure we have substantial content
      if (!fullContent || fullContent.length < 50) {
        fullContent = cleanText(article.title);
      }

      return {
        id,
        title: cleanText(article.title),
        summary: cleanText(article.title),
        body: fullContent,
        topics: [topic],
        publishedAt: new Date(article.pubDate),
        source: article.source_name || article.source_id,
        sourceUrl: article.link || article.source_url, // Use direct article link
        imageUrl: article.image_url,
      };
    });
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.error('[NewsData] Rate limit exceeded');
    } else if (error.response?.status === 401) {
      console.error('[NewsData] Invalid API key');
    } else {
      console.error('[NewsData] Error fetching news:', error.message);
    }
    return [];
  }
}

/**
 * Check if we should fetch fresh news for a topic today
 * Returns true if no articles exist for this topic from today
 */
export function shouldFetchNewsForTopic(lastFetchDate: Date | null): boolean {
  if (!lastFetchDate) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastFetch = new Date(lastFetchDate);
  lastFetch.setHours(0, 0, 0, 0);
  
  return today.getTime() > lastFetch.getTime();
}

/**
 * Get all topics that need fresh news today
 */
export function getTopicsToFetch(): string[] {
  return [
    'technology',
    'science',
    'business',
    'sports',
    'entertainment',
    'health',
    'world news',
    'environment',
    'fashion',
    'politics',
    'animals',
    'travel',
    'anime',
    'movies',
    'comedy'
  ];
}

