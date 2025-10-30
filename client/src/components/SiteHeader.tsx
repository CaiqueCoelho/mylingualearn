import { APP_LOGO, APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export function SiteHeader() {
  const { user, signOut, loading } = useFirebaseAuth();

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-20 w-20 rounded-md object-cover" />
            <span className="font-semibold tracking-tight text-lg">{APP_TITLE}</span>
          </a>
        </Link>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Olá {user.displayName || user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sair
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm">Entrar</Button>
                </Link>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <Link href="/news"><DropdownMenuItem asChild>
                <a className="w-full">Notícias</a>
              </DropdownMenuItem></Link>
              <Link href="/vocabulary"><DropdownMenuItem asChild>
                <a className="w-full">Vocabulário</a>
              </DropdownMenuItem></Link>
              <Link href="/progress"><DropdownMenuItem asChild>
                <a className="w-full">Progresso</a>
              </DropdownMenuItem></Link>
              <Link href="/games"><DropdownMenuItem asChild>
                <a className="w-full">Jogos</a>
              </DropdownMenuItem></Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


