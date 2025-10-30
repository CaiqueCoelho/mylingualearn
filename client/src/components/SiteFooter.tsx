import { APP_TITLE } from "@/const";

export function SiteFooter() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {APP_TITLE}. Contato: <a className="underline" href="mailto:caiquedpfc@gmail.com">caiquedpfc@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}


