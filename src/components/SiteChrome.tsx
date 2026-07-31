import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/CartDrawer";

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-xl tracking-tight">
          Karité<span className="text-primary">.</span>
        </Link>
        <nav className="text-muted-foreground hidden gap-8 text-sm sm:flex">
          <a href="/#shop" className="hover:text-foreground transition-colors">
            Butik
          </a>
          <a href="/#about" className="hover:text-foreground transition-colors">
            Om oss
          </a>
          <a href="/#ritual" className="hover:text-foreground transition-colors">
            Ritual
          </a>
        </nav>
        <CartDrawer />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-border/60 mt-24 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-foreground text-base">Karité</p>
        <p>Oraffinerat, vildskördat sheasmör. Inget annat.</p>
      </div>
    </footer>
  );
}
