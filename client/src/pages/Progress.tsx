import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import * as firebaseDb from '@/services/firebaseDatabase';

export default function Progress() {
  const { user } = useFirebaseAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  async function loadProgress() {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await firebaseDb.getProgress(user.uid);
      setProgress(data);
    } catch (error) {
      console.error('[Progress] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4">Faça login para ver seu progresso</p>
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
        <h1 className="text-2xl font-bold mb-6">Meu Progresso</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>XP Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{progress?.xp || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nível</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{progress?.level || 1}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sequência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{progress?.streak || 0} dias</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
