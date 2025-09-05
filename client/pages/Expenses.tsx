import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Receipt,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import ExpenseTracker from "@/components/expenses/ExpenseTracker";
import { toast } from "sonner";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  isRecurring: boolean;
  tags: string[];
  merchant?: string;
  location?: string;
  isEssential: boolean;
}

interface ExpenseSummary {
  totalExpenses: number;
  monthlyExpenses: number;
  weeklyExpenses: number;
  dailyAverage: number;
  monthlyBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  categorySummary: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  paymentMethodSummary: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    budget: number;
  }>;
  weeklyTrend: Array<{
    day: string;
    amount: number;
  }>;
}

const COLORS = ['#00FFD1', '#8B5CF6', '#06FFA5', '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#F97316'];

// Animated number counter for KPIs
function CountUpNumber({ value, prefix = "", className = "" }: { value: number; prefix?: string; className?: string }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const start = display;
    const end = Number.isFinite(value) ? value : 0;
    const duration = 600; // ms
    const startTime = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{prefix}{Math.round(display).toLocaleString()}</span>;
}

const paymentMethodIcons = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  bank_transfer: Building2
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'analytics' | 'budgets'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [showValues, setShowValues] = useState(true);

  const panic = useUIStore((s) => s.panic);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateSummary();
    }
  }, [expenses, timeRange]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // API returns { expenses, pagination, summary }
      setExpenses(Array.isArray(data?.expenses) ? data.expenses : Array.isArray(data) ? data : []);
      // We compute summary locally; ignore server summary for now to keep UI consistent
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter expenses based on time range
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      switch (timeRange) {
        case 'week':
          return expenseDate >= currentWeek;
        case 'month':
          return expenseDate >= currentMonth;
        case '3months':
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          return expenseDate >= threeMonthsAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          return expenseDate >= yearAgo;
        default:
          return true;
      }
    });

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyExpenses = expenses.filter(exp => new Date(exp.date) >= currentMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const weeklyExpenses = expenses.filter(exp => new Date(exp.date) >= currentWeek)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const monthlyBudget = 50000; // Mock budget
    const budgetUsed = (monthlyExpenses / monthlyBudget) * 100;
    const budgetRemaining = monthlyBudget - monthlyExpenses;

    // Category summary
    const categoryMap = new Map<string, { amount: number; count: number }>();
    filteredExpenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1
      });
    });

    const categorySummary = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: (data.amount / totalExpenses) * 100,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    // Payment method summary
    const paymentMap = new Map<string, number>();
    filteredExpenses.forEach(expense => {
      const existing = paymentMap.get(expense.paymentMethod) || 0;
      paymentMap.set(expense.paymentMethod, existing + expense.amount);
    });

    const paymentMethodSummary = Array.from(paymentMap.entries()).map(([method, amount]) => ({
      method,
      amount,
      percentage: (amount / totalExpenses) * 100
    }));

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= monthDate && expDate < nextMonth;
      }).reduce((sum, exp) => sum + exp.amount, 0);

      monthlyTrend.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthExpenses,
        budget: monthlyBudget
      });
    }

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDay = new Date(dayDate.getTime() + 24 * 60 * 60 * 1000);
      const dayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= dayDate && expDate < nextDay;
      }).reduce((sum, exp) => sum + exp.amount, 0);

      weeklyTrend.push({
        day: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayExpenses
      });
    }

    setSummary({
      totalExpenses,
      monthlyExpenses,
      weeklyExpenses,
      dailyAverage: weeklyExpenses / 7,
      monthlyBudget,
      budgetUsed,
      budgetRemaining,
      categorySummary,
      paymentMethodSummary,
      monthlyTrend,
      weeklyTrend
    });
  };

  const handleExpenseAdded = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleExpenseUpdated = (expense: Expense) => {
    setExpenses(prev => prev.map(exp => exp._id === expense._id ? expense : exp));
  };

  const handleExpenseDeleted = (expenseId: string) => {
    setExpenses(prev => prev.filter(exp => exp._id !== expenseId));
  };

  const getBudgetStatus = () => {
    if (!summary) return { status: 'unknown', color: 'text-gray-400' };
    
    if (summary.budgetUsed <= 70) {
      return { status: 'on-track', color: 'text-neon-lime', icon: CheckCircle };
    } else if (summary.budgetUsed <= 90) {
      return { status: 'warning', color: 'text-orange-400', icon: AlertTriangle };
    } else {
      return { status: 'over-budget', color: 'text-red-400', icon: AlertTriangle };
    }
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon || CheckCircle;

  if (loading && expenses.length === 0) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Parallax neon glows */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5, scale: [1, 1.05, 1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-neon-teal/20 to-neon-violet/20 blur-3xl" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45, scale: [1, 0.96, 1] }} transition={{ duration: 14, repeat: Infinity }} className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-neon-violet/20 to-fuchsia-500/20 blur-3xl" />
      </motion.div>

      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-neon-teal" />
            Expense Management
          </h1>
          <p className="text-muted-foreground mt-1">Track, analyze, and optimize your spending habits</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExpenses}
            disabled={loading}
            className="border-neon-teal/30 hover:bg-neon-teal/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <Receipt className="w-4 h-4 text-neon-teal" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">
              {showValues ? <CountUpNumber value={summary.monthlyExpenses} prefix="₹" /> : '••••••'}
            </div>
            <div className="text-sm text-muted-foreground">
              Budget: {showValues ? `₹${summary.monthlyBudget.toLocaleString()}` : '••••••'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Weekly Expenses</p>
              <Calendar className="w-4 h-4 text-neon-violet" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">
              {showValues ? <CountUpNumber value={summary.weeklyExpenses} prefix="₹" /> : '••••••'}
            </div>
            <div className="text-sm text-muted-foreground">
              Daily avg: {showValues ? `₹${summary.dailyAverage.toFixed(0)}` : '••••'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Budget Status</p>
              <StatusIcon className={`w-4 h-4 ${budgetStatus.color}`} />
            </div>
            <div className={`text-2xl font-bold ${budgetStatus.color}`}>
              {summary.budgetUsed.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {showValues ? `₹${summary.budgetRemaining.toFixed(0)} left` : '••••• left'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Categories</p>
              <PieChart className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight"><CountUpNumber value={summary.categorySummary.length} /></div>
            <div className="text-sm text-muted-foreground">Active categories</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <BarChart3 className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight"><CountUpNumber value={expenses.length} /></div>
            <div className="text-sm text-muted-foreground">This {timeRange}</div>
          </motion.div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 backdrop-blur-xl border border-white/10">
        {(['overview', 'tracker', 'analytics', 'budgets'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-neon-teal text-black' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && summary && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Time Range:</span>
              <div className="flex rounded-lg bg-white/5 p-1">
                {(['week', 'month', '3months', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      timeRange === range 
                        ? 'bg-neon-teal text-black' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {range === '3months' ? '3M' : range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neon-teal" />
                  Monthly Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={summary.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFD1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00FFD1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => showValues ? `₹${(value/1000).toFixed(0)}K` : '••••'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                      formatter={(value: any, name: string) => [showValues ? `₹${value.toLocaleString()}` : '••••••', name]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="budget" 
                      stroke="#00FFD1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBudget)"
                      name="Budget"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorExpenses)"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-neon-violet" />
                  Category Breakdown
                </h3>
                <div className="flex items-center justify-center mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={summary.categorySummary.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {summary.categorySummary.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [showValues ? `₹${value.toLocaleString()}` : '••••••', 'Amount']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {summary.categorySummary.slice(0, 6).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{category.category}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {showValues ? `₹${category.amount.toLocaleString()}` : '••••••'} ({category.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Weekly Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Weekly Spending Pattern
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => showValues ? `₹${value}` : '••••'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px'
                    }}
                    formatter={(value: any) => [showValues ? `₹${value.toLocaleString()}` : '••••••', 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-neon-lime" />
                Payment Methods
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summary.paymentMethodSummary.map((method, index) => {
                  const Icon = paymentMethodIcons[method.method as keyof typeof paymentMethodIcons] || CreditCard;
                  return (
                    <div key={method.method} className="text-center p-4 rounded-xl bg-white/5">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-neon-teal" />
                      <div className="text-lg font-bold">
                        {showValues ? `₹${method.amount.toLocaleString()}` : '••••••'}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {method.method.replace('_', ' ')} ({method.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'tracker' && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ExpenseTracker 
              onExpenseAdded={handleExpenseAdded}
              onExpenseUpdated={handleExpenseUpdated}
              onExpenseDeleted={handleExpenseDeleted}
            />
          </motion.div>
        )}

        {activeTab === 'analytics' && summary && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Detailed spending insights and predictive analytics coming soon
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'budgets' && (
          <motion.div
            key="budgets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Budget Management</h3>
              <p className="text-muted-foreground mb-4">
                Set and track budgets for different categories
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}