import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanHtmlContent } from '../utils/htmlDecoder';

/**
 * Extract article content from a webpage
 * Uses common article selectors and heuristics
 */
export async function scrapeArticleContent(url: string): Promise<string | null> {
  try {
    // Skip Google News redirect URLs - they don't work well for scraping
    if (url.includes('news.google.com/rss/articles')) {
      console.log(`[Scraper] Skipping Google News redirect URL`);
      return null;
    }
    
    // Set timeout and user agent
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      maxRedirects: 10,
      validateStatus: (status) => status < 400,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ad, .social-share, .comments').remove();

    // Try common article content selectors in order of specificity
    const selectors = [
      'article[role="main"]',
      'article.article-content',
      'article .article-body',
      'div.article-content',
      'div.post-content',
      'div.entry-content',
      'div.content-body',
      'main article',
      'article',
      '[itemprop="articleBody"]',
      '.story-body',
      '.article-text',
    ];

    let content = '';

    // Try each selector
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        if (content.length > 200) {
          break;
        }
      }
    }

    // Fallback: extract all paragraphs from main content area
    if (!content || content.length < 200) {
      const paragraphs: string[] = [];
      $('main p, article p, .content p, .post p').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 50) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join('\n\n');
    }

    // Clean and normalize
    content = cleanHtmlContent(content);

    // Return null if content is too short (likely failed to extract)
    if (content.length < 100) {
      console.log(`[Scraper] Content too short for ${url}`);
      return null;
    }

    // Limit content length to avoid huge articles
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }

    return content;
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log(`[Scraper] ${url} blocked scraping (${error.response.status})`);
    } else if (error.code === 'ECONNABORTED') {
      console.log(`[Scraper] ${url} timeout`);
    } else {
      console.error(`[Scraper] Error scraping ${url}:`, error.message);
    }
    return null;
  }
}

/**
 * Scrape multiple articles with rate limiting
 */
export async function scrapeMultipleArticles(
  articles: Array<{ id: string; sourceUrl: string; body: string }>
): Promise<Array<{ id: string; body: string }>> {
  const results: Array<{ id: string; body: string }> = [];
  
  for (const article of articles) {
    // Skip if already has substantial content
    if (article.body && article.body.length > 300) {
      console.log(`[Scraper] Skipping ${article.id} - already has ${article.body.length} chars`);
      continue;
    }

    console.log(`[Scraper] Scraping ${article.sourceUrl}...`);
    // Try to scrape
    const scrapedContent = await scrapeArticleContent(article.sourceUrl);
    
    if (scrapedContent) {
      console.log(`[Scraper] Success! Got ${scrapedContent.length} chars for ${article.id}`);
      results.push({
        id: article.id,
        body: scrapedContent,
      });
    } else {
      console.log(`[Scraper] Failed to scrape ${article.id}`);
    }

    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

