import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from 'zod';
import { aiRouter } from "./routers/aiRouter";
import { fetchNewsDataArticles } from "./services/newsdataService";
import { scrapeMultipleArticles } from "./services/articleScraper";

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Server-side news operations (fetching and scraping)
  news: router({
    // Fetch news from NewsData.io API (server-side only, requires API key)
    fetch: protectedProcedure
      .input(z.object({
        topic: z.string(),
        limit: z.number().default(10),
      }))
      .mutation(async ({ input }) => {
        console.log(`[News API] Fetching ${input.limit} articles for topic: ${input.topic}`);
        
        try {
          const articles = await fetchNewsDataArticles(input.topic, input.limit);
          
          // Scrape full content for articles with short body
          const articlesToScrape = articles
            .filter((a: any) => a.sourceUrl && (!a.body || a.body.length < 300))
            .slice(0, 10);
          
          if (articlesToScrape.length > 0) {
            console.log(`[News API] Scraping ${articlesToScrape.length} articles...`);
            const scrapedContent = await scrapeMultipleArticles(articlesToScrape);
            
            scrapedContent.forEach(scraped => {
              const article = articles.find((a: any) => a.id === scraped.id);
              if (article) {
                article.body = scraped.body;
                article.isScraped = true;
              }
            });
          }
          
          return {
            success: true,
            articles: articles.slice(0, input.limit),
          };
        } catch (error: any) {
          console.error('[News API] Error:', error);
          return {
            success: false,
            articles: [],
            error: error.message,
          };
        }
      }),
    
    // Rescrape articles with short content
    rescrape: protectedProcedure
      .input(z.object({
        articles: z.array(z.object({
          id: z.string(),
          sourceUrl: z.string(),
          body: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const articlesToScrape = input.articles
          .filter(a => a.sourceUrl && a.body.length < 300)
          .slice(0, 20);
        
        if (articlesToScrape.length === 0) {
          return { success: true, count: 0, articles: [] };
        }
        
        console.log(`[Rescrape] Processing ${articlesToScrape.length} articles...`);
        const scrapedContent = await scrapeMultipleArticles(articlesToScrape);
        
        return {
          success: true,
          count: scrapedContent.length,
          articles: scrapedContent,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

