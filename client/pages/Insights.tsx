import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Lightbulb,
  Zap,
  Shield,
  Award,
  RefreshCw,
  Eye,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

interface ExpenseInsight {
  monthlyComparison: {
    current: number;
    previous: number;
    change: number;
    changeDirection: string;
  };
  weeklyPattern: Record<string, number>;
  topMerchants: Array<{ name: string; amount: number }>;
  spendingVelocity: {
    dailyAverage: number;
    projectedMonthly: number;
    daysRemaining: number;
  };
  recommendations: Array<{
    type: string;
    message: string;
    action: string;
    priority: string;
  }>;
}

interface GoalInsight {
  goalInsights: Array<{
    goalId: string;
    title: string;
    progress: number;
    daysRemaining: number;
    monthsRemaining: number;
    requiredMonthlySaving: number;
    status: string;
    recommendation: string;
    priority: string;
  }>;
  summary: {
    totalMonthlySavingsNeeded: number;
    goalsAtRisk: number;
    goalsOnTrack: number;
    totalActiveGoals: number;
  };
  recommendations: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
}

const COLORS = ['#00FFD1', '#8B5CF6', '#06FFA5', '#3B82F6', '#F59E0B', '#EF4444', '#10B981'];

const priorityColors = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444'
};

const statusColors = {
  on_track: '#10B981',
  ahead: '#00FFD1',
  behind: '#F59E0B',
  overdue: '#EF4444'
};

export default function Insights() {
  const [expenseInsights, setExpenseInsights] = useState<ExpenseInsight | null>(null);
  const [goalInsights, setGoalInsights] = useState<GoalInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'goals' | 'recommendations'>('overview');

  const panic = useUIStore((s) => s.panic);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [expenseResponse, goalResponse] = await Promise.all([
        fetch('/api/expenses/insights'),
        fetch('/api/goals/insights')
      ]);
      
      const expenseData = await expenseResponse.json();
      const goalData = await goalResponse.json();
      
      setExpenseInsights(expenseData);
      setGoalInsights(goalData);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
    toast.success('Insights refreshed');
  };

  // Generate mock portfolio performance data
  const generatePortfolioData = () => {
    const data = [];
    let value = 100000;
    for (let i = 0; i < 12; i++) {
      const change = (Math.random() - 0.4) * 0.1; // Slight upward bias
      value = value * (1 + change);
      data.push({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(value),
        growth: ((value - 100000) / 100000) * 100
      });
    }
    return data;
  };

  const portfolioData = generatePortfolioData();

  // Transform weekly pattern data for chart
  const weeklyPatternData = expenseInsights ? Object.entries(expenseInsights.weeklyPattern).map(([day, amount]) => ({
    day: day.slice(0, 3),
    amount
  })) : [];

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-neon-teal" />
            AI Financial Insights
          </h1>
          <p className="text-muted-foreground mt-1">Personalized analysis and recommendations for your financial health</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInsights}
            disabled={refreshing}
            className="border-neon-teal/30 hover:bg-neon-teal/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 backdrop-blur-xl border border-white/10">
        {(['overview', 'expenses', 'goals', 'recommendations'] as const).map((tab) => (
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
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Financial Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10 backdrop-blur-xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">Financial Health Score</h3>
                    <p className="text-muted-foreground">Based on your spending, saving, and investment patterns</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-extrabold text-neon-teal">78</div>
                    <div className="text-sm text-muted-foreground">out of 100</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold text-neon-lime">85</div>
                    <div className="text-sm text-muted-foreground">Saving Rate</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold text-neon-violet">72</div>
                    <div className="text-sm text-muted-foreground">Investment</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-bold text-orange-400">76</div>
                    <div className="text-sm text-muted-foreground">Budgeting</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-neon-lime" />
                    <h4 className="font-semibold">Achievement</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    You've maintained a positive savings rate for 6 consecutive months!
                  </p>
                  <div className="text-xs text-neon-lime">+50 points earned</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-neon-teal" />
                    <h4 className="font-semibold">Next Goal</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Increase emergency fund to 6 months of expenses
                  </p>
                  <div className="text-xs text-muted-foreground">₹15,000 remaining</div>
                </div>
              </motion.div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <TrendingUp className="w-4 h-4 text-neon-lime" />
                </div>
                <div className="text-2xl font-bold">
                  <MaskedNumber value="12,450" prefix="₹" />
                </div>
                <div className="text-sm text-neon-lime">+8.5% from last month</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Investment Growth</p>
                  <BarChart3 className="w-4 h-4 text-neon-violet" />
                </div>
                <div className="text-2xl font-bold">
                  <MaskedNumber value="8,750" prefix="₹" />
                </div>
                <div className="text-sm text-neon-violet">+12.3% this month</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Expense Ratio</p>
                  <PieChart className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-sm text-orange-400">-3% from target</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Goal Progress</p>
                  <Target className="w-4 h-4 text-neon-teal" />
                </div>
                <div className="text-2xl font-bold">73%</div>
                <div className="text-sm text-neon-teal">On track</div>
              </motion.div>
            </div>

            {/* Portfolio Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-teal" />
                Portfolio Performance (12 Months)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FFD1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00FFD1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px'
                    }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00FFD1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGrowth)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'expenses' && expenseInsights && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Monthly Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <Calendar className="w-4 h-4 text-neon-teal" />
                </div>
                <div className="text-2xl font-bold">
                  <MaskedNumber value={expenseInsights.monthlyComparison.current.toLocaleString()} prefix="₹" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Last Month</p>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">
                  <MaskedNumber value={expenseInsights.monthlyComparison.previous.toLocaleString()} prefix="₹" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Change</p>
                  {expenseInsights.monthlyComparison.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-neon-lime" />
                  )}
                </div>
                <div className={`text-2xl font-bold ${expenseInsights.monthlyComparison.change >= 0 ? 'text-red-400' : 'text-neon-lime'}`}>
                  {expenseInsights.monthlyComparison.change >= 0 ? '+' : ''}{expenseInsights.monthlyComparison.change.toFixed(1)}%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <BarChart3 className="w-4 h-4 text-neon-violet" />
                </div>
                <div className="text-2xl font-bold">
                  <MaskedNumber value={expenseInsights.spendingVelocity.dailyAverage.toFixed(0)} prefix="₹" />
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Pattern */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neon-teal" />
                  Weekly Spending Pattern
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyPatternData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Top Merchants */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-neon-violet" />
                  Top Merchants
                </h3>
                <div className="space-y-3">
                  {expenseInsights.topMerchants.slice(0, 8).map((merchant, index) => (
                    <div key={merchant.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-teal/20 to-neon-violet/20 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{merchant.name}</span>
                      </div>
                      <div className="font-semibold">
                        <MaskedNumber value={merchant.amount.toLocaleString()} prefix="₹" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Spending Velocity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-lime" />
                Spending Velocity Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-neon-teal">
                    <MaskedNumber value={expenseInsights.spendingVelocity.dailyAverage.toFixed(0)} prefix="₹" />
                  </div>
                  <div className="text-sm text-muted-foreground">Daily Average</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-neon-violet">
                    <MaskedNumber value={expenseInsights.spendingVelocity.projectedMonthly.toFixed(0)} prefix="₹" />
                  </div>
                  <div className="text-sm text-muted-foreground">Projected Monthly</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-orange-400">
                    {expenseInsights.spendingVelocity.daysRemaining}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Remaining</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'goals' && goalInsights && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Goal Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                  <Target className="w-4 h-4 text-neon-teal" />
                </div>
                <div className="text-2xl font-bold">{goalInsights.summary.totalActiveGoals}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">On Track</p>
                  <CheckCircle className="w-4 h-4 text-neon-lime" />
                </div>
                <div className="text-2xl font-bold text-neon-lime">{goalInsights.summary.goalsOnTrack}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-400">{goalInsights.summary.goalsAtRisk}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Monthly Needed</p>
                  <DollarSign className="w-4 h-4 text-neon-violet" />
                </div>
                <div className="text-2xl font-bold">
                  <MaskedNumber value={goalInsights.summary.totalMonthlySavingsNeeded.toFixed(0)} prefix="₹" />
                </div>
              </motion.div>
            </div>

            {/* Goal Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-teal" />
                Goal Progress Analysis
              </h3>
              <div className="space-y-4">
                {goalInsights.goalInsights.map((goal, index) => (
                  <motion.div
                    key={goal.goalId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusColors[goal.status as keyof typeof statusColors] }}
                      />
                      <div>
                        <div className="font-semibold">{goal.title}</div>
                        <div className="text-sm text-muted-foreground">{goal.recommendation}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{goal.progress.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{goal.requiredMonthlySaving.toFixed(0)}/month needed
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-neon-teal" />
                <h3 className="text-xl font-bold">AI-Powered Recommendations</h3>
              </div>
              
              <div className="grid gap-4">
                {expenseInsights?.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2"
                      style={{ backgroundColor: priorityColors[rec.priority as keyof typeof priorityColors] }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{rec.message}</div>
                      <div className="text-sm text-muted-foreground mb-2">{rec.action}</div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${priorityColors[rec.priority as keyof typeof priorityColors]}20`,
                            color: priorityColors[rec.priority as keyof typeof priorityColors]
                          }}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">{rec.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}

                {goalInsights?.recommendations.map((rec, index) => (
                  <motion.div
                    key={`goal-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (expenseInsights?.recommendations.length || 0) * 0.1 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2"
                      style={{ backgroundColor: priorityColors[rec.priority as keyof typeof priorityColors] }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{rec.message}</div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${priorityColors[rec.priority as keyof typeof priorityColors]}20`,
                            color: priorityColors[rec.priority as keyof typeof priorityColors]
                          }}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">{rec.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-neon-lime" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-semibold">Set Budget Alert</div>
                    <div className="text-sm text-muted-foreground">Get notified when spending exceeds limits</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-semibold">Optimize Subscriptions</div>
                    <div className="text-sm text-muted-foreground">Review and cancel unused services</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-semibold">Increase SIP</div>
                    <div className="text-sm text-muted-foreground">Boost your investment contributions</div>
                  </div>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}