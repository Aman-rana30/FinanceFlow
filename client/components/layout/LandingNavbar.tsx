import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingNavbar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="FinanceFlow landing">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600" />
          <span className="font-extrabold tracking-tight text-lg">FinanceFlow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-foreground/80">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#reviews" className="hover:text-foreground">Reviews</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#about" className="hover:text-foreground">About</a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-700" onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </div>
    </header>
  );
}


