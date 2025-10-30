import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Mic, Zap, Puzzle } from "lucide-react";

export default function Games() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Button variant="ghost">← Voltar</Button>
            </Link>
            <h1 className="text-2xl font-bold">Mini-Jogos</h1>
            <div />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-muted-foreground mb-8 text-center">
          Pratique inglês de forma divertida com nossos jogos interativos
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mic className="w-8 h-8 text-primary" />
                <CardTitle>Karaokê de Repetição</CardTitle>
              </div>
              <CardDescription>
                Ouça e repita frases em inglês. Pratique sua pronúncia e ganhe pontos pela precisão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em Breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-primary" />
                <CardTitle>Vocabulário Rápido</CardTitle>
              </div>
              <CardDescription>
                Combine palavras com suas traduções o mais rápido possível. Dificuldade adaptativa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em Breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Puzzle className="w-8 h-8 text-primary" />
                <CardTitle>Construtor de Frases</CardTitle>
              </div>
              <CardDescription>
                Arraste e solte palavras para formar frases corretas em inglês.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em Breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-8 h-8 text-primary" />
                <CardTitle>Mais Jogos</CardTitle>
              </div>
              <CardDescription>
                Novos jogos serão adicionados em breve. Continue praticando!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em Breve
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-muted">
          <CardHeader>
            <CardTitle>💡 Dica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Enquanto os jogos estão em desenvolvimento, continue praticando lendo notícias, 
              revisando vocabulário e fazendo quizzes de compreensão!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

