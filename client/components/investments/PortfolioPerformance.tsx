import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, RefreshCw, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PerformanceData {
  date: string;
  value: number;
  invested: number;
  gainLoss: number;
}

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

interface TopPerformer {
  symbol: string;
  name: string;
  gainLossPercent: number;
  gainLoss: number;
  value: number;
}

const COLORS = ['#00FFD1', '#8B5CF6', '#06FFA5', '#3B82F6', '#F59E0B', '#EF4444', '#10B981'];

const mockPortfolioData: PortfolioData = {
  totalValue: 485750,
  totalInvested: 425000,
  totalGainLoss: 60750,
  totalGainLossPercent: 14.29,
  dayChange: 8450,
  dayChangePercent: 1.77
};

const generatePerformanceData = (): PerformanceData[] => {
  const data: PerformanceData[] = [];
  let invested = 400000;
  let value = 400000;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate market movements
    const change = (Math.random() - 0.45) * 0.02; // Slight upward bias
    value = value * (1 + change);
    
    // Simulate additional investments
    if (Math.random() > 0.8) {
      invested += Math.random() * 10000;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      invested: Math.round(invested),
      gainLoss: Math.round(value - invested)
    });
  }
  
  return data;
};

const mockSectorData: SectorAllocation[] = [
  { sector: 'Information Technology', value: 185000, percentage: 38.1, color: COLORS[0] },
  { sector: 'Financial Services', value: 145000, percentage: 29.8, color: COLORS[1] },
  { sector: 'Energy', value: 95000, percentage: 19.6, color: COLORS[2] },
  { sector: 'Healthcare', value: 35000, percentage: 7.2, color: COLORS[3] },
  { sector: 'Consumer Goods', value: 25750, percentage: 5.3, color: COLORS[4] }
];

const mockTopPerformers: TopPerformer[] = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', gainLossPercent: 18.5, gainLoss: 15420, value: 98920 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', gainLossPercent: 12.3, gainLoss: 12850, value: 117350 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', gainLossPercent: 8.7, gainLoss: 8950, value: 111950 },
  { symbol: 'INFY', name: 'Infosys', gainLossPercent: -2.1, gainLoss: -1850, value: 86150 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', gainLossPercent: 15.2, gainLoss: 9580, value: 72580 }
];

interface PortfolioPerformanceProps {
  className?: string;
}

export default function PortfolioPerformance({ className }: PortfolioPerformanceProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(mockPortfolioData);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [sectorData, setSectorData] = useState<SectorAllocation[]>(mockSectorData);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(mockTopPerformers);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [loading, setLoading] = useState(false);
  const [showValues, setShowValues] = useState(true);

  useEffect(() => {
    setPerformanceData(generatePerformanceData());
  }, [timeRange]);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with new mock data
    setPortfolioData({
      ...mockPortfolioData,
      dayChange: mockPortfolioData.dayChange + (Math.random() - 0.5) * 2000,
      dayChangePercent: mockPortfolioData.dayChangePercent + (Math.random() - 0.5) * 0.5
    });
    
    setPerformanceData(generatePerformanceData());
    setLoading(false);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Portfolio Value,Invested,Gain/Loss\n" +
      performanceData.map(row => `${row.date},${row.value},${row.invested},${row.gainLoss}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio_performance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {showValues ? `₹${entry.value.toLocaleString()}` : '••••••'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Performance</h2>
          <p className="text-muted-foreground">Track your investment performance over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={exportData}>
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <BarChart3 className="w-4 h-4 text-neon-teal" />
          </div>
          <div className="text-2xl font-bold">
            {showValues ? <MaskedNumber value={portfolioData.totalValue.toLocaleString()} prefix="₹" /> : '••••••'}
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            portfolioData.dayChange >= 0 ? 'text-neon-lime' : 'text-red-400'
          }`}>
            {portfolioData.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {showValues ? `₹${Math.abs(portfolioData.dayChange).toLocaleString()}` : '••••'} ({portfolioData.dayChangePercent.toFixed(2)}%)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <Calendar className="w-4 h-4 text-neon-violet" />
          </div>
          <div className="text-2xl font-bold">
            {showValues ? <MaskedNumber value={portfolioData.totalInvested.toLocaleString()} prefix="₹" /> : '••••••'}
          </div>
          <div className="text-sm text-muted-foreground">Principal amount</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
            {portfolioData.totalGainLoss >= 0 ? 
              <TrendingUp className="w-4 h-4 text-neon-lime" /> : 
              <TrendingDown className="w-4 h-4 text-red-400" />
            }
          </div>
          <div className={`text-2xl font-bold ${
            portfolioData.totalGainLoss >= 0 ? 'text-neon-lime' : 'text-red-400'
          }`}>
            {showValues ? (
              <MaskedNumber 
                value={Math.abs(portfolioData.totalGainLoss).toLocaleString()} 
                prefix={portfolioData.totalGainLoss >= 0 ? '+₹' : '-₹'} 
              />
            ) : '••••••'}
          </div>
          <div className={`text-sm ${
            portfolioData.totalGainLoss >= 0 ? 'text-neon-lime' : 'text-red-400'
          }`}>
            {portfolioData.totalGainLossPercent >= 0 ? '+' : ''}{portfolioData.totalGainLossPercent.toFixed(2)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Holdings</p>
            <PieChart className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Active positions</div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Performance Chart</h3>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-white/5 p-1">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    timeRange === range 
                      ? 'bg-neon-teal text-black' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg bg-white/5 p-1">
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded transition-all ${
                  chartType === 'area' ? 'bg-neon-teal text-black' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded transition-all ${
                  chartType === 'line' ? 'bg-neon-teal text-black' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'area' ? (
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FFD1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FFD1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)" 
                tickFormatter={(value) => showValues ? `₹${(value/1000).toFixed(0)}K` : '••••'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00FFD1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)"
                name="Portfolio Value"
              />
              <Area 
                type="monotone" 
                dataKey="invested" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorInvested)"
                name="Total Invested"
              />
            </AreaChart>
          ) : (
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)" 
                tickFormatter={(value) => showValues ? `₹${(value/1000).toFixed(0)}K` : '••••'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00FFD1" 
                strokeWidth={3}
                dot={false}
                name="Portfolio Value"
              />
              <Line 
                type="monotone" 
                dataKey="invested" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={false}
                name="Total Invested"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Sector Allocation & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
          <div className="flex items-center justify-center mb-4">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [showValues ? `₹${value.toLocaleString()}` : '••••••', 'Value']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sectorData.map((sector, index) => (
              <div key={sector.sector} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sector.color }}
                  />
                  <span className="text-sm">{sector.sector}</span>
                </div>
                <div className="text-sm font-medium">
                  {showValues ? `₹${sector.value.toLocaleString()}` : '••••••'} ({sector.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-teal/20 to-neon-violet/20 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {showValues ? <MaskedNumber value={stock.value.toLocaleString()} prefix="₹" /> : '••••••'}
                  </div>
                  <div className={`text-sm flex items-center gap-1 justify-end ${
                    stock.gainLossPercent >= 0 ? 'text-neon-lime' : 'text-red-400'
                  }`}>
                    {stock.gainLossPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stock.gainLossPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}