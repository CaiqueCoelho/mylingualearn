import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Volume2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import * as firebaseDb from '@/services/firebaseDatabase';
import { toast } from 'sonner';

export default function Vocabulary() {
  const { user } = useFirebaseAuth();
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVocabulary();
    }
  }, [user]);

  async function loadVocabulary() {
    if (!user) return;
    
    setLoading(true);
    try {
      const vocabulary = await firebaseDb.getVocabulary(user.uid);
      setWords(vocabulary);
    } catch (error) {
      console.error('[Vocabulary] Error loading:', error);
      toast.error('Erro ao carregar vocabulário');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(wordId: string) {
    if (!user) return;
    
    try {
      await firebaseDb.deleteWord(user.uid, wordId);
      setWords(prev => prev.filter(w => w.id !== wordId));
      toast.success('Palavra removida');
    } catch (error) {
      console.error('[Vocabulary] Error deleting:', error);
      toast.error('Erro ao remover palavra');
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Faça login para acessar seu vocabulário.</p>
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
      <nav className="border-b">
        <div className="container mx-auto py-4 px-4">
          <Link href="/">
            <Button variant="ghost">← Voltar</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meu Vocabulário ({words.length} palavras)</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : words.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4">Nenhuma palavra salva. Comece lendo artigos!</p>
              <Link href="/news">
                <Button>Ver Notícias</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {words.map(word => (
              <Card key={word.id}>
                <CardHeader>
                  <CardTitle>{word.lemma || word.word}</CardTitle>
                </CardHeader>
                <CardContent>
                  {word.ptDef && <p className="text-sm mb-2">{word.ptDef}</p>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(word.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
