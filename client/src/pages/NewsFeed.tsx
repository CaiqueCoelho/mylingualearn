import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { trpc } from '@/lib/trpc';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import * as firebaseDb from '@/services/firebaseDatabase';
import { toast } from 'sonner';

export default function NewsFeed() {
  const { user } = useFirebaseAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['technology']);
  
  const fetchNewsMutation = trpc.news.fetch.useMutation();
  const rescrapeNewsMutation = trpc.news.rescrape.useMutation();

  const topics = [
    'technology', 'science', 'business', 'health', 'sports',
    'entertainment', 'fashion', 'politics', 'animals', 'travel',
    'anime', 'movies', 'comedy'
  ];

  // Load articles from Firebase
  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    try {
      const loadedArticles = await firebaseDb.getArticles(50);
      setArticles(loadedArticles);
    } catch (error) {
      console.error('[NewsFeed] Error loading articles:', error);
      toast.error('Erro ao carregar artigos');
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchNews() {
    if (!user) {
      toast.error('Faça login para buscar notícias');
      return;
    }
    
    setLoading(true);
    try {
      // Fetch news for each selected topic
      for (const topic of selectedTopics) {
        const result = await fetchNewsMutation.mutateAsync({
          topic,
          limit: 10,
        });
        
        if (result.success && result.articles) {
          // Save articles to Firebase
          await firebaseDb.saveArticles(result.articles);
        }
      }
      
      // Reload articles from Firebase
      await loadArticles();
      toast.success('Notícias atualizadas!');
    } catch (error) {
      console.error('[NewsFeed] Error fetching news:', error);
      toast.error('Erro ao buscar notícias');
    } finally {
      setLoading(false);
    }
  }

  async function handleRescrape() {
    if (!user || articles.length === 0) return;
    
    setLoading(true);
    try {
      const articlesToRescrape = articles
        .filter(a => a.sourceUrl && a.body && a.body.length < 300)
        .slice(0, 20);
      
      if (articlesToRescrape.length === 0) {
        toast.info('Todos os artigos já têm conteúdo completo!');
        setLoading(false);
        return;
      }
      
      const result = await rescrapeNewsMutation.mutateAsync({
        articles: articlesToRescrape,
      });
      
      if (result.success && result.articles) {
        // Update articles in Firebase with scraped content
        for (const scrapedArticle of result.articles) {
          const original = articles.find(a => a.id === scrapedArticle.id);
          if (original) {
            await firebaseDb.saveArticle({
              ...original,
              body: scrapedArticle.body,
              isScraped: true,
            });
          }
        }
        
        // Reload articles
        await loadArticles();
        toast.success(`${result.count} artigos atualizados!`);
      }
    } catch (error) {
      console.error('[NewsFeed] Error rescraping:', error);
      toast.error('Erro ao buscar conteúdo completo');
    } finally {
      setLoading(false);
    }
  }

  function toggleTopic(topic: string) {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  }

  const filteredArticles = selectedTopics.length > 0
    ? articles.filter(a => a.topics?.some((t: string) => selectedTopics.includes(t)))
    : articles;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Faça login para acessar as notícias diárias.</p>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Topic filters */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Filtrar por tópico:</h2>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <Badge
                key={topic}
                variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTopic(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Articles list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum artigo encontrado. Clique em "Atualizar" para buscar notícias.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(article => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={article.imageUrl || "/logo.png"}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {article.topics?.map((topic: string) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.summary || article.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {article.source} • {format(new Date(article.publishedAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

