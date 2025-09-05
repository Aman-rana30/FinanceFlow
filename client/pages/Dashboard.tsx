import React, { useEffect, useState } from "react";
import { MaskedNumber, KpiCard } from "@/components/dashboard/KpiCard";
import { SavingsChart, CashflowChart, SpendingBreakdownChart } from "@/components/dashboard/Charts";
import { QuickAddExpense } from "@/components/dashboard/QuickAddExpense";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Calendar, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui";

const kpis = {
  netWorth: 84250,
  income: 5200,
  expense: 3150,
  savingsRate: 38,
  runway: 9.5,
};

export default function Dashboard() {
  const toggleMasked = useUIStore((s) => s.toggleMasked);
  const togglePanic = useUIStore((s) => s.togglePanic);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") toggleMasked();
      if (e.key.toLowerCase() === "h") togglePanic();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("open-quick-expense"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMasked, togglePanic]);

  const userName = "Taranjit"; // Replace with dynamic user data
  const lastLogin = "2 days ago"; // Replace with dynamic data

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(1000px_600px_at_10%_-20%,rgba(79,70,229,0.2),transparent),radial-gradient(800px_500px_at_90%_10%,rgba(147,51,234,0.2),transparent)]">
      <section className="container py-8 md:py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-500 to-purple-700 bg-clip-text text-transparent">{userName}</span>!
            </h1>
            <p className="text-muted-foreground mt-1">
              Your AI money coach is ready with fresh insights.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                document.dispatchEvent(new CustomEvent("open-quick-expense"))
              }
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Quick Add Expense
            </Button>
            <Button
              variant="secondary"
              className="bg-gradient-to-r from-indigo-600/20 to-purple-700/20 hover:from-indigo-600/30 hover:to-purple-700/30 text-indigo-200"
              onClick={() => {
                const coachSection = document.getElementById('coach-section');
                if (coachSection) {
                  coachSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Sparkles className="mr-2 text-indigo-400" /> Ask Coach
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            <motion.div
              key="kpi-networth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <KpiCard
                title="Net Worth"
                value={
                  <MaskedNumber
                    value={kpis.netWorth.toLocaleString()}
                    prefix="₹"
                    className="text-3xl"
                  />
                }
                delta={"+2.1%"}
                trend="up"
                description="Total assets minus liabilities. This includes your savings, investments, and property value."
                onClick={() => console.log('Navigate to net worth details')}
              />
            </motion.div>
            <motion.div
              key="kpi-income-expense"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <KpiCard
                title="Monthly Cashflow"
                value={
                  <div className="flex flex-col">
                    <div className="text-lg text-neon-lime">
                      <MaskedNumber value={kpis.income} prefix="₹" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      - <MaskedNumber value={kpis.expense} prefix="₹" />
                    </div>
                  </div>
                }
                delta={"+₹220"}
                trend="up"
                description="Your monthly income minus expenses. A positive number means you're saving money."
                onClick={() => console.log('Navigate to cashflow details')}
              />
            </motion.div>
            <motion.div
              key="kpi-savings-rate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <KpiCard
                title="Savings Rate"
                value={<span className="text-3xl">{kpis.savingsRate}%</span>}
                delta={"+3%"}
                trend="up"
                description="Percentage of your income that you save each month. Aim for at least 20%."
                onClick={() => console.log('Navigate to savings details')}
              />
            </motion.div>
            <motion.div
              key="kpi-runway"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <KpiCard
                title="Financial Runway"
                value={<span className="text-3xl">{kpis.runway} mo</span>}
                delta={"+0.3 mo"}
                trend="up"
                description="How many months you can survive on your current savings if income stops."
                onClick={() => console.log('Navigate to runway details')}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SavingsChart />
          <CashflowChart />
        </div>

        <div className="mt-6">
          <SpendingBreakdownChart />
        </div>

        {/* Quick Insights Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <TrendingUp className="w-4 h-4 text-indigo-300" />
              </div>
              <h3 className="text-sm font-medium">This Month's Trend</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Your savings increased by 12% compared to last month. Keep up the great work!
            </p>
            <div className="text-lg font-bold text-indigo-300">+₹2,400</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-700/20">
                <Target className="w-4 h-4 text-purple-300" />
              </div>
              <h3 className="text-sm font-medium">Goal Progress</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              You're 68% towards your emergency fund goal of ₹50,000.
            </p>
            <div className="text-lg font-bold text-purple-300">₹34,000</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <Calendar className="w-4 h-4 text-indigo-300" />
              </div>
              <h3 className="text-sm font-medium">Upcoming Bills</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              3 bills due in the next 7 days totaling ₹1,850.
            </p>
            <div className="text-lg font-bold text-orange-400">₹1,850</div>
          </motion.div>
        </div>
      </section>

      <QuickAddExpense />
      
      {/* AI Coach Section */}
      <section className="container py-8 md:py-12" id="coach-section">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-700/20">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-700 bg-clip-text text-transparent">
              Ask Your AI Financial Coach
            </h2>
          </div>
          
          <AskCoach />
        </div>
      </section>
    </div>
  );
}

// AI Coach Component
function AskCoach() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setAnswer(data.message || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          className="flex-1 rounded-xl bg-background/60 border border-white/20 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/60 text-white" 
          placeholder="Ask: How can I improve my savings rate?" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
        />
        <Button 
          onClick={ask} 
          disabled={loading || !prompt.trim()} 
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Thinking...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span>Ask Coach</span>
              <Sparkles className="ml-2 w-4 h-4 text-indigo-200" />
            </div>
          )}
        </Button>
      </div>
      
      {answer && (
        <div className="rounded-xl border border-white/10 bg-gradient-to-r from-indigo-600/10 to-purple-700/10 p-4 md:p-6 whitespace-pre-wrap">
          {answer}
        </div>
      )}
      
      {!answer && !loading && (
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Example questions you can ask:</p>
          <ul className="grid gap-1.5 list-disc pl-5">
            <li>How can I save more money each month?</li>
            <li>What's a good savings rate for my income level?</li>
            <li>Should I pay off debt or invest first?</li>
            <li>How much should I be saving for retirement?</li>
          </ul>
        </div>
      )}
    </div>
  );
}
