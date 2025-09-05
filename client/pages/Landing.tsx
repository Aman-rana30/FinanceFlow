import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, CheckCircle2, ArrowRight, Shield, LineChart, Rocket, TrendingUp, TrendingDown } from "lucide-react";
import LandingNavbar from "@/components/layout/LandingNavbar";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Landing() {
  const navigate = useNavigate();

  // Count-up stats for a lively hero
  const [users, setUsers] = useState(0);
  const [assets, setAssets] = useState(0);
  useEffect(() => {
    const usersTarget = 15000;
    const assetsTarget = 2500000000; // 2.5B
    const start = Date.now();
    const duration = 1200;
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setUsers(Math.floor(usersTarget * easeOutCubic(t)));
      setAssets(Math.floor(assetsTarget * easeOutCubic(t)));
      if (t >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const testimonials = useMemo(
    () => [
      { name: "Priya", role: "Engineer", quote: "Cut my monthly burn by 22% in 6 weeks." },
      { name: "Aman", role: "Founder", quote: "Scenario planning is chef’s kiss for cashflow." },
      { name: "Sara", role: "Designer", quote: "Finally a finance app that feels friendly." },
    ],
    []
  );

  // Market data from server API (no backend changes)
  const [market, setMarket] = useState<{
    trending?: any[];
    topGainers?: any[];
    topLosers?: any[];
  } | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingMarket(true);
        const res = await fetch('/api/market');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (mounted) setMarket(data);
      } catch (_) {
        // ignore
      } finally {
        if (mounted) setLoadingMarket(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Simple stock search using /api/stocks/search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  async function onSearchStocks(q: string) {
    setSearchQuery(q);
    if (!q) { setSearchResults([]); return; }
    try {
      const r = await fetch(`/api/stocks/search?query=${encodeURIComponent(q)}`);
      if (r.ok) setSearchResults(await r.json());
    } catch (_) {}
  }

  const logos = ["Stripe", "Plaid", "Visa", "RBI", "AWS", "Azure"];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Soft grid + glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.08]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, scale: [1, 1.04, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 blur-3xl"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45, scale: [1, 0.96, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-600/30 to-fuchsia-500/30 blur-3xl"
        />
      </div>

      <LandingNavbar />

      {/* HERO */}
      <section className="container py-16 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-muted-foreground mb-6">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Financial Coach
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-600 bg-clip-text text-transparent">
            Transform Your
          </span>
          <br className="hidden md:block" />
          Financial Future
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          A modern money OS for ambitious people. Plan, budget, and invest with clarity.
          Simple, fast, and designed for outcomes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
            onClick={() => navigate("/auth")}
          >
            Start Free Trial
          </Button>
        </div>

        {/* Animated stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <StatCard label="Active users" value={`${formatNumber(users)}+`} />
          <StatCard label="Companies trust" value="500+" />
          <StatCard label="Assets managed" value={`₹${formatNumber(assets)}`} />
        </div>

        {/* Market highlights using /api/market */}
        <div className="mt-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Market Highlights</div>
              <div className="text-xs text-muted-foreground">Live or fallback data</div>
            </div>
            {loadingMarket ? (
              <div className="text-sm text-muted-foreground">Loading market data…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Top Gainers */}
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-2">Top Gainers</div>
                  <div className="grid gap-2">
                    {(market?.topGainers || market?.trending || []).slice(0,3).map((s:any) => (
                      <div key={s.symbol} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-sm font-medium">{s.symbol}</div>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs">
                          <TrendingUp className="w-3.5 h-3.5" /> {typeof s.change === 'number' ? `${s.change.toFixed(2)}%` : s.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Top Losers */}
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-2">Top Losers</div>
                  <div className="grid gap-2">
                    {(market?.topLosers || []).slice(0,3).map((s:any) => (
                      <div key={s.symbol} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-sm font-medium">{s.symbol}</div>
                        <div className="flex items-center gap-1 text-rose-400 text-xs">
                          <TrendingDown className="w-3.5 h-3.5" /> {typeof s.change === 'number' ? `${s.change.toFixed(2)}%` : s.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quick Search */}
                <div>
                  <div className="text-xs uppercase text-muted-foreground mb-2">Quick Search</div>
                  <input
                    value={searchQuery}
                    onChange={(e)=>onSearchStocks(e.target.value)}
                    placeholder="Search stocks (e.g. TCS, INFY)"
                    className="h-9 w-full px-3 rounded-md bg-background border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {searchResults.slice(0,4).map((r:any)=> (
                        <div key={r.symbol} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <div className="text-sm">{r.symbol}</div>
                          <div className="text-xs text-muted-foreground">{r.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust logos (static, no transition) */}
        <div className="mt-10 opacity-90">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 items-center justify-center max-w-4xl mx-auto">
            {logos.map((name) => (
              <div
                key={name}
                className="text-xs md:text-sm text-muted-foreground border border-white/5 rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Powered by {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - hover highlight cards (no tabs) */}
      <section id="features" className="container py-16 md:py-24 text-center">
        <SectionHeading title="Features" subtitle="Built for clarity, speed, and outcomes." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Sparkles className="w-6 h-6" />, title: 'Insight Engine', desc: 'Personalized, actionable insights from your spending patterns.' },
            { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Smart Budgets', desc: 'Budgets that auto-adjust and keep you on track with nudges.' },
            { icon: <Star className="w-6 h-6" />, title: 'Simulations', desc: 'Play out loans, savings rates, and investments instantly.' },
            { icon: <Shield className="w-6 h-6" />, title: 'Bank‑grade Security', desc: 'Modern encryption and privacy by default.' },
            { icon: <LineChart className="w-6 h-6" />, title: 'Visual Analytics', desc: 'Understand trends at a glance with rich charts.' },
            { icon: <Rocket className="w-6 h-6" />, title: 'Goal Acceleration', desc: 'Automations to reach your targets faster.' }
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
            >
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 w-fit mb-4 group-hover:scale-110 transition-transform">
                <div className="text-indigo-300">{f.icon}</div>
              </div>
              <div className="font-semibold mb-1">{f.title}</div>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-16 md:py-20">
        <SectionHeading title="How it works" subtitle="Three simple steps to clarity." />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard step="01" title="Connect securely" icon={<Shield className="w-5 h-5" />}>Safely connect accounts with bank-grade security.</StepCard>
          <StepCard step="02" title="See insights" icon={<LineChart className="w-5 h-5" />}>We analyze your patterns and surface actions.</StepCard>
          <StepCard step="03" title="Grow faster" icon={<Rocket className="w-5 h-5" />}>Automate savings and track goals effortlessly.</StepCard>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="container py-14 text-center">
        <SectionHeading title="What customers say" subtitle="Real stories, real outcomes." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">“{t.quote}”</p>
              <div className="mt-3 text-xs opacity-80">
                {t.name} — {t.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container py-12 text-center">
        <SectionHeading title="Pricing" subtitle="Simple, transparent plans." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
          {[
            { name: "Free", price: "₹0", features: ["Basic budgets", "Insights weekly", "1 goal"], cta: "Get Started" },
            {
              name: "Pro",
              price: "₹499/mo",
              features: ["Auto budgets", "Daily insights", "Unlimited goals"],
              cta: "Start Trial",
              highlight: true,
            },
            {
              name: "Family",
              price: "₹799/mo",
              features: ["Up to 4 members", "Shared goals", "Insights for all"],
              cta: "Choose Family",
            },
          ].map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${p.highlight ? "border-indigo-400/40 bg-white/10 shadow-lg shadow-indigo-900/10" : "border-white/10 bg-white/5"} p-6 transition-transform hover:-translate-y-1`}
            >
              <div className="flex items-baseline justify-between">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xl font-extrabold">{p.price}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full bg-gradient-to-r from-indigo-600 to-purple-700" onClick={() => navigate("/auth")}>
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT / FAQ */}
      <section id="about" className="container py-12 text-center">
        <SectionHeading title="About" subtitle="We help you master money with AI." />
        <div className="mx-auto max-w-3xl text-left">
          <Accordion type="single" collapsible>
            <AccordionItem value="a1">
              <AccordionTrigger>How does the AI insight engine work?</AccordionTrigger>
              <AccordionContent>
                We analyze anonymized spending patterns to surface trends, guardrails, and suggestions you can act on.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="a2">
              <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
              <AccordionContent>Yes. Plans are month-to-month with one-click cancellation in settings.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl p-12 md:p-16"
        >
          <Shield className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to take control of your <span className="text-indigo-400">financial future?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands who’ve already taken control. Start your journey today and see the difference AI-powered insights make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 border-white/20 hover:bg-white/10"
              onClick={() => navigate("/dashboard")}
            >
              Explore Features
            </Button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 mt-8">
        <div className="container py-8 text-sm text-muted-foreground flex items-center justify-between">
          <div>© {new Date().getFullYear()} FinanceFlow</div>
          <div className="flex gap-4">
            <a className="hover:text-foreground" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-foreground" href="#about">
              About
            </a>
            <button className="hover:text-foreground" onClick={() => navigate("/auth")}>
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function FeatureCopy({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="text-left"
    >
      <div className="mb-3 p-2 rounded-lg bg-white/5 w-fit">{icon}</div>
      <div className="font-semibold mb-1">{title}</div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </motion.div>
  );
}

function WindowMock({ variant }: { variant: "insights" | "budgets" | "simulate" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-3 shadow-xl"
    >
      <div className="rounded-xl border border-white/10 bg-black/20">
        <div className="flex items-center gap-2 p-2 border-b border-white/10">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <div className="ml-auto h-4 w-28 rounded bg-white/10" />
        </div>
        <div className="p-4 grid gap-3">
          {variant === "insights" && (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="h-24 rounded bg-gradient-to-tr from-indigo-500/30 to-purple-500/30" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="h-24 rounded bg-gradient-to-tr from-indigo-500/30 to-purple-500/30" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="h-24 rounded bg-gradient-to-tr from-indigo-500/30 to-purple-500/30" />
              </div>
            </div>
          )}
          {variant === "budgets" && (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="h-3 w-full rounded bg-indigo-500/40" />
                <div className="h-3 w-4/5 rounded bg-indigo-400/40 mt-1" />
                <div className="h-3 w-2/3 rounded bg-indigo-300/40 mt-1" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="h-28 rounded bg-gradient-to-br from-emerald-400/20 to-indigo-400/20" />
              </div>
            </div>
          )}
          {variant === "simulate" && (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="h-24 rounded bg-gradient-to-br from-purple-400/25 to-fuchsia-400/25" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-24 rounded bg-white/10 mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-14 rounded bg-white/10" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Marquee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function StepCard({ step, title, icon, children }: { step: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/10 font-semibold">
          {step}
        </span>
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{children}</p>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-3xl md:text-4xl font-extrabold mb-2">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

