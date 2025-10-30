import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { APP_LOGO, getLoginUrl } from "@/const";
import { BookOpen, Trophy, Gamepad2, TrendingUp } from "lucide-react";

export default function Home() {
  const { user, loading, signOut } = useFirebaseAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Aprenda Inglês Lendo Notícias</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Melhore seu inglês com artigos reais, tradução inteligente e gamificação
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          <Link href="/news">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BookOpen className="w-12 h-12 mb-2 text-blue-600" />
                <CardTitle>Notícias Diárias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leia artigos em inglês sobre seus tópicos favoritos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vocabulary">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mb-2 text-green-600" />
                <CardTitle>Vocabulário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Salve e revise palavras com sistema de repetição espaçada
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Trophy className="w-12 h-12 mb-2 text-yellow-600" />
                <CardTitle>Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu XP, nível e sequência de estudos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/games">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Gamepad2 className="w-12 h-12 mb-2 text-purple-600" />
                <CardTitle>Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pratique com quizzes e atividades interativas
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Video Section */}
        <div className="mt-12 mb-12 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/-St2ymDNkEQ"
                title="MyLinguaLearn Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center mt-12">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Começar Agora
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
