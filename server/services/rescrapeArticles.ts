import { getDb } from '../db';
import { articles } from '../../drizzle/schema';
import { scrapeArticleContent } from './articleScraper';
import { eq } from 'drizzle-orm';

/**
 * Re-scrape articles that have short content
 */
export async function rescrapeShortArticles(limit: number = 20): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Get articles with short content
  const shortArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.isScraped, false))
    .limit(limit);

  console.log(`[Rescrape] Found ${shortArticles.length} articles to rescrape`);

  let successCount = 0;

  for (const article of shortArticles) {
    if (!article.sourceUrl) continue;

    console.log(`[Rescrape] Scraping ${article.id}...`);
    
    try {
      const scrapedContent = await scrapeArticleContent(article.sourceUrl);
      
      if (scrapedContent && scrapedContent.length > 300) {
        // Update article with scraped content
        await db
          .update(articles)
          .set({
            body: scrapedContent,
            isScraped: true,
          })
          .where(eq(articles.id, article.id));
        
        console.log(`[Rescrape] Updated ${article.id} with ${scrapedContent.length} chars`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`[Rescrape] Error scraping ${article.id}:`, error.message);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`[Rescrape] Successfully rescraped ${successCount}/${shortArticles.length} articles`);
  return successCount;
}

