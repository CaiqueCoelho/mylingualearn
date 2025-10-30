import Parser from 'rss-parser';
import { createHash } from 'crypto';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'content:encoded', 'description']
  }
});

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  topics: string[];
  publishedAt: Date;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
}

/**
 * Fetch articles from Google News RSS
 */
export async function fetchGoogleNews(topic: string = 'world', language: string = 'en'): Promise<NewsArticle[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=${language}&gl=US&ceid=US:${language}`;
    const feed = await parser.parseURL(url);
    
    return feed.items.map(item => {
      const id = createHash('md5').update(item.link || item.guid || '').digest('hex');
      const summary = item.contentSnippet || item.content || item.description || '';
      const body = item['content:encoded'] || item.content || item.description || summary;
      
      return {
        id,
        title: item.title || 'Untitled',
        summary: summary.substring(0, 500),
        body: cleanHtml(body),
        topics: [topic],
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: extractSource(item.title || ''),
        sourceUrl: item.link || '',
        imageUrl: extractImageUrl(item)
      };
    });
  } catch (error) {
    console.error('[NewsService] Error fetching Google News:', error);
    return [];
  }
}

/**
 * Fetch articles from multiple topics
 */
export async function fetchMultipleTopics(topics: string[]): Promise<NewsArticle[]> {
  const promises = topics.map(topic => fetchGoogleNews(topic));
  const results = await Promise.all(promises);
  return results.flat();
}

/**
 * Extract source name from Google News title (usually in format "Title - Source")
 */
function extractSource(title: string): string {
  const parts = title.split(' - ');
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return 'Google News';
}

/**
 * Extract image URL from RSS item
 */
function extractImageUrl(item: any): string | undefined {
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  
  // Try to extract from content
  const content = item['content:encoded'] || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return undefined;
}

import { cleanHtmlContent } from '../utils/htmlDecoder';

/**
 * Clean HTML tags and entities from content
 */
function cleanHtml(html: string): string {
  return cleanHtmlContent(html);
}

/**
 * Get popular topics for English learning
 */
export function getPopularTopics(): string[] {
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

