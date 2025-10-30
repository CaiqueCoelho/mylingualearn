import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Volume2, Languages } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import * as firebaseDb from '@/services/firebaseDatabase';
import { toast } from 'sonner';
import { WordTranslationModal } from '@/components/WordTranslationModal';
import QuizDialog from '@/components/QuizDialog';
import ChatCoachDialog from '@/components/ChatCoachDialog';
import { formatDate } from 'date-fns';

export default function ArticleView() {
  const [, params] = useRoute('/article/:id');
  const { user } = useFirebaseAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (params?.id) {
      loadArticle(params.id);
    }
  }, [params?.id]);

  async function loadArticle(id: string) {
    setLoading(true);
    try {
      const loadedArticle = await firebaseDb.getArticleById(id);
      if (loadedArticle) {
        setArticle(loadedArticle);
        
        // Save reading history
        if (user) {
          await firebaseDb.saveReadingHistory(user.uid, id, {
            title: loadedArticle.title,
            readAt: Date.now(),
          });
          
          // Log activity
          await firebaseDb.logActivity(user.uid, {
            type: 'article_read',
            articleId: id,
            title: loadedArticle.title,
          });
          
          // Update progress
          const progress = await firebaseDb.getProgress(user.uid);
          await firebaseDb.saveProgress(user.uid, {
            ...progress,
            xp: (progress.xp || 0) + 10,
            lastActivity: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error('[ArticleView] Error loading:', error);
      toast.error('Erro ao carregar artigo');
    } finally {
      setLoading(false);
    }
  }

  function handleSpeak() {
    if (!article) return;
    
    if ('speechSynthesis' in window) {
      const textToSpeak = `${article.title}. ${article.body}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      
      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices();
        
        // Try to find best voice in order of preference
        const preferredVoice = 
          voices.find(v => v.lang === 'en-US' && v.name.includes('Google US English')) ||
          voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Natural')) ||
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
          voices.find(v => v.lang.startsWith('en-US')) ||
          voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('[Voice] Using:', preferredVoice.name);
        } else {
          console.log('[Voice] No preferred voice found, using default');
        }
        
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      };
      
      // Check if voices are already loaded
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoiceAndSpeak();
      } else {
        // Wait for voices to load
        speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
      }
    }
  }

  function handleStop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }

  async function handleTranslate() {
    if (!article) return;
    
    setIsTranslating(true);
    try {
      // Try Chrome AI Translator first
      if ('translation' in window && (window as any).translation) {
        const translator = await (window as any).translation.createTranslator({
          sourceLanguage: 'en',
          targetLanguage: 'pt',
        });
        const translated = await translator.translate(article.body);
        setTranslatedText(translated);
        setShowTranslation(true);
        toast.success('Artigo traduzido!');
      } else {
        toast.error('Chrome AI Translator não disponível. Habilite as flags experimentais.');
      }
    } catch (error) {
      console.error('[Translate] Error:', error);
      toast.error('Erro ao traduzir');
    } finally {
      setIsTranslating(false);
    }
  }

  function handleWordClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'P' || target.closest('p')) {
      // First check if there's a selection
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText) {
        // User selected text
        const word = selectedText.replace(/[.,!?;:"']/g, '');
        if (word && word.length > 1) {
          setSelectedWord(word);
          return;
        }
      }
      
      // No selection - get word at click position
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent || '';
          const offset = range.startOffset;
          
          // Find word boundaries
          let start = offset;
          let end = offset;
          
          // Go backwards to find start of word
          while (start > 0 && /\S/.test(text[start - 1])) {
            start--;
          }
          
          // Go forwards to find end of word
          while (end < text.length && /\S/.test(text[end])) {
            end++;
          }
          
          const word = text.substring(start, end).replace(/[.,!?;:"']/g, '');
          if (word && word.length > 1) {
            setSelectedWord(word);
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="mb-4">Artigo não encontrado</p>
            <Link href="/news">
              <Button>Voltar para Notícias</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={isPlaying ? handleStop : handleSpeak}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isPlaying ? 'Parar' : 'Ouvir'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
              >
                <Languages className="w-4 h-4 mr-2" />
                {isTranslating ? 'Traduzindo...' : 'Traduzir'}
              </Button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-900">{article.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <span className="font-medium">{article.source}</span>
              <span>•</span>
              <time>{formatDate(article.publishedAt, 'dd/MM/yyyy')}</time>
            </div>
            {article.imageUrl && (
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-auto rounded-lg mt-4 max-h-96 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </CardHeader>
          <div className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* <div 
              className="prose prose-lg max-w-none cursor-pointer select-text"
              onClick={handleWordClick}
            >
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {translatedText || article.body}
              </p>
            </div> */}

            <article className="mt-8">
              <div className="text-gray-800 text-lg leading-8 space-y-6 cursor-pointer select-text" onClick={handleWordClick}>
                {article.body.split('\n\n').map((paragraph: string, index: number) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-6 first:mt-0 text-justify">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </article>
            
            <p className="text-xs text-muted-foreground mt-4 italic">
              💡 Dica: Clique em qualquer palavra para ver a tradução e salvar no vocabulário
            </p>

            <div className="mt-6 flex gap-3 flex-wrap">
              <Button 
                className="flex-1"
                onClick={() => setShowQuiz(true)}
              >
                Fazer Quiz
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setShowChat(true)}
              >
                Conversar sobre o artigo
              </Button>
            </div>
          </CardContent>
          </div>
        </Card>
      </main>

      {selectedWord && (
        <WordTranslationModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {showQuiz && article && (
        <QuizDialog
          open={showQuiz}
          onOpenChange={setShowQuiz}
          articleTitle={article.title}
          articleBody={article.body}
        />
      )}

      {showChat && article && (
        <ChatCoachDialog
          open={showChat}
          onOpenChange={setShowChat}
          articleTitle={article.title}
          articleBody={article.body}
        />
      )}

      {/* Translation Modal */}
      <Dialog open={showTranslation} onOpenChange={setShowTranslation}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">📖 Tradução do Artigo</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {article?.title}
            </p>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              {translatedText.split('\n\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-base leading-7 text-justify">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTranslation(false)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(translatedText);
                toast.success('Tradução copiada!');
              }}
            >
              Copiar Tradução
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

