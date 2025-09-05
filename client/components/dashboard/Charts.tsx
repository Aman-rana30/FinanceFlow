import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart, PieChart, Pie, Cell } from "recharts";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const genData = () => months.map((m, i) => ({
  name: m,
  income: 3000 + Math.round(400 * Math.sin(i/2) + Math.random()*200),
  expense: 1800 + Math.round(300 * Math.cos(i/3) + Math.random()*150),
  savings: 1200 + Math.round(200 * Math.sin(i/2.5) + Math.random()*100),
  investment: 800 + Math.round(150 * Math.sin(i/1.8) + Math.random()*80),
}));

const data = genData();

// Custom tooltip component for better interactivity
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground capitalize">{entry.dataKey}</span>
            </div>
            <span className="text-sm font-semibold">₹{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SavingsChart() {
  const panic = useUIStore((s) => s.panic);
  const [timeRange, setTimeRange] = useState<'6M' | '1Y'>('1Y');
  
  const filteredData = useMemo(() => {
    return timeRange === '6M' ? data.slice(-6) : data;
  }, [timeRange]);

  const totalSavings = filteredData.reduce((sum, item) => sum + item.savings, 0);
  const avgSavings = Math.round(totalSavings / filteredData.length);
  const trend = filteredData[filteredData.length - 1]?.savings > filteredData[0]?.savings;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Monthly Savings Progress</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Avg: ₹{avgSavings.toLocaleString()}</span>
            <div className={cn("flex items-center gap-1", trend ? "text-neon-lime" : "text-destructive")}>
              {trend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs">{trend ? '+' : '-'}12%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant={timeRange === '6M' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('6M')}
            className="h-7 px-2 text-xs"
          >
            6M
          </Button>
          <Button
            variant={timeRange === '1Y' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('1Y')}
            className="h-7 px-2 text-xs"
          >
            1Y
          </Button>
        </div>
      </div>
      <div className={panic ? "blur-sm select-none" : ""}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={filteredData} margin={{ left: -20, right: 10 }}>
            <defs>
              <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--neon-teal))" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(var(--neon-teal))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="savings" 
              stroke="hsl(var(--neon-teal))" 
              fill="url(#teal)" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--neon-teal))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--neon-teal))", strokeWidth: 2, fill: "hsl(var(--background))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CashflowChart() {
  const panic = useUIStore((s) => s.panic);
  const [viewType, setViewType] = useState<'stacked' | 'grouped'>('grouped');
  
  const netCashflow = data.map(item => ({
    ...item,
    net: item.income - item.expense
  }));

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Cashflow Analysis</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-muted-foreground">Net: ₹{netFlow.toLocaleString()}</span>
            <div className={cn("flex items-center gap-1", netFlow > 0 ? "text-neon-lime" : "text-destructive")}>
              {netFlow > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs">{((netFlow / totalIncome) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewType === 'grouped' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewType('grouped')}
            className="h-7 px-2 text-xs"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Grouped
          </Button>
          <Button
            variant={viewType === 'stacked' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewType('stacked')}
            className="h-7 px-2 text-xs"
          >
            Stacked
          </Button>
        </div>
      </div>
      <div className={panic ? "blur-sm select-none" : ""}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={netCashflow} margin={{ left: -20, right: 10 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--neon-violet))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--neon-violet))" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--neon-lime))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--neon-lime))" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="income" 
              fill="url(#incomeGradient)" 
              radius={[6,6,0,0]} 
              stackId={viewType === 'stacked' ? 'stack' : undefined}
            />
            <Bar 
              dataKey="expense" 
              fill="url(#expenseGradient)" 
              radius={[6,6,0,0]} 
              stackId={viewType === 'stacked' ? 'stack' : undefined}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Spending breakdown by category
export function SpendingBreakdownChart() {
  const panic = useUIStore((s) => s.panic);
  
  const spendingData = [
    { name: 'Food & Dining', value: 1200, color: 'hsl(var(--neon-violet))' },
    { name: 'Transportation', value: 800, color: 'hsl(var(--neon-teal))' },
    { name: 'Shopping', value: 600, color: 'hsl(var(--neon-lime))' },
    { name: 'Entertainment', value: 400, color: '#FF6B6B' },
    { name: 'Bills & Utilities', value: 950, color: '#4ECDC4' },
    { name: 'Healthcare', value: 300, color: '#45B7D1' },
  ];

  const total = spendingData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Spending Breakdown</h3>
          <p className="text-xs text-muted-foreground mt-1">Total: ₹{total.toLocaleString()}</p>
        </div>
      </div>
      <div className={panic ? "blur-sm select-none" : ""}>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {spendingData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">₹{item.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((item.value / total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced default Charts component with multiple chart types
const Charts = () => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  
  const enhancedData = [
    { name: "Jan", Expenses: 2400, Savings: 1240, Income: 4200 },
    { name: "Feb", Expenses: 1800, Savings: 1639, Income: 4100 },
    { name: "Mar", Expenses: 2200, Savings: 1980, Income: 4500 },
    { name: "Apr", Expenses: 2100, Savings: 1420, Income: 4200 },
    { name: "May", Expenses: 2300, Savings: 1680, Income: 4400 },
    { name: "Jun", Expenses: 1900, Savings: 1890, Income: 4300 },
  ];

  const renderChart = () => {
    const commonProps = {
      data: enhancedData,
      margin: { left: -20, right: 10, top: 5, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--neon-violet))" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(var(--neon-violet))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--neon-lime))" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(var(--neon-lime))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Expenses" stackId="1" stroke="hsl(var(--neon-violet))" fill="url(#expenseGradient)" />
            <Area type="monotone" dataKey="Savings" stackId="1" stroke="hsl(var(--neon-lime))" fill="url(#savingsGradient)" />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Expenses" fill="hsl(var(--neon-violet))" radius={[4,4,0,0]} />
            <Bar dataKey="Savings" fill="hsl(var(--neon-lime))" radius={[4,4,0,0]} />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#93a4b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="Expenses" 
              stroke="hsl(var(--neon-violet))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--neon-violet))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--neon-violet))", strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="Savings" 
              stroke="hsl(var(--neon-lime))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--neon-lime))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--neon-lime))", strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Financial Overview</h3>
        <div className="flex gap-1">
          {(['line', 'area', 'bar'] as const).map((type) => (
            <Button
              key={type}
              variant={chartType === type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType(type)}
              className="h-7 px-2 text-xs capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
