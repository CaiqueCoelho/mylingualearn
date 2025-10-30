import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithGoogle, signInWithEmail, registerWithEmail, signInAsGuest } from "@/services/authService";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Chrome, Mail, UserCircle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      toast.success(`Bem-vindo, ${user.displayName}!`);
      setLocation('/onboarding');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login: ' + (error.message || 'Tente novamente'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      toast.success(`Bem-vindo de volta!`);
      setLocation('/');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login: ' + (error.message || 'Tente novamente'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const user = await registerWithEmail(email, password);
      toast.success('Conta criada com sucesso!');
      setLocation('/onboarding');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está cadastrado');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else {
        toast.error('Erro ao criar conta: ' + (error.message || 'Tente novamente'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
      toast.success('Entrando como visitante...');
      setLocation('/');
    } catch (error: any) {
      console.error('Guest login error:', error);
      toast.error('Erro ao entrar como visitante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="h-16 w-16 rounded-xl object-cover shadow-md"
            />
          </div>
          <CardTitle className="text-3xl mb-2">{APP_TITLE}</CardTitle>
          <CardDescription className="text-lg">
            Aprenda inglês com notícias diárias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? 'Entrando...' : 'Entrar com Email'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Entrar com Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Cadastrar com Google
              </Button>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4">
            <Button 
              onClick={handleGuestAccess}
              disabled={isLoading}
              variant="ghost"
              className="w-full"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Continuar como Visitante
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Como visitante você não poderá salvar progresso
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">O que você vai encontrar:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Notícias diárias em inglês</li>
              <li>✅ Tradução instantânea com IA</li>
              <li>✅ Quizzes automáticos</li>
              <li>✅ Vocabulário com repetição espaçada</li>
              <li>✅ Coach de conversação com IA</li>
              <li>✅ Acompanhamento de progresso</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

