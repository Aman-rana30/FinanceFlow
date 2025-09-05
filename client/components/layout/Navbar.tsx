import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { Shield, Eye, EyeOff, PlusCircle, Command, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/investments", label: "Investments" },
  { to: "/stocks", label: "Stocks" },
  { to: "/expenses", label: "Expenses" },
  { to: "/goals", label: "Goals" },
  { to: "/insights", label: "Insights" },
  { to: "/challenges", label: "Challenges" },
  { to: "/coach", label: "Coach" },
];

function Navbar() {
  const masked = useUIStore((s) => s.masked);
  const toggleMasked = useUIStore((s) => s.toggleMasked);
  const panic = useUIStore((s) => s.panic);
  const togglePanic = useUIStore((s) => s.togglePanic);
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const { user, token, hydrate, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            onClick={(e) => {
              // When authenticated, do nothing on brand click
              if (token) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className={cn("flex items-center gap-2", token ? "cursor-default" : "")}
            aria-label="FinanceFlow home"
            aria-disabled={Boolean(token)}
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-neon-teal to-neon-violet shadow-[0_0_24px_hsl(var(--neon-teal))]" />
            <span className="font-extrabold tracking-tight text-lg">FinanceFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2 ml-6">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive ? "text-neon-teal bg-neon-teal/10" : "text-foreground/70 hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCommandOpen(true)} title="Command palette (⌘K / Ctrl+K)">
            <Command className="opacity-80" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => document.dispatchEvent(new CustomEvent("open-quick-expense"))}>
            <PlusCircle className="opacity-80" />
            <span className="hidden sm:inline">Add</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleMasked} title="Toggle masked amounts (M)">
            {masked ? <Eye className="opacity-80" /> : <EyeOff className="opacity-80" />}
            <span className="hidden sm:inline">Mask</span>
          </Button>
          <Button variant={panic ? "destructive" : "secondary"} size="sm" onClick={togglePanic} title="Panic hide numbers (H)">
            <Shield className="opacity-80" />
            <span className="hidden sm:inline">Panic</span>
          </Button>
          {/* Removed contrast label */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Profile menu" className="ml-2 rounded-full border border-white/10 p-[2px] hover:border-white/20 focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.email ? (
                  <div className="text-xs">
                    <div className="font-medium">Signed in</div>
                    <div className="opacity-80 truncate">{user.email}</div>
                  </div>
                ) : (
                  <div className="text-xs">Not signed in</div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); navigate("/auth"); }}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export { Navbar };
export default Navbar;
