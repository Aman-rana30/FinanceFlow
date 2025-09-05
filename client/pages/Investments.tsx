import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  PieChart, 
  BarChart3,
  DollarSign,
  Target,
  Calendar,
  AlertTriangle,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Settings,
  Download,
  Share2,
  Zap,
  Shield,
  Award
  
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StockSearch from "@/components/investments/StockSearch";
import PortfolioPerformance from "@/components/investments/PortfolioPerformance";
import { toast } from "sonner";

interface Investment {
  _id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  sector?: string;
  lastUpdated: string;
  dayChange?: number;
  dayChangePercent?: number;
  volume?: number;
  marketCap?: number;
  pe?: number;
  dividend?: number;
}

interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  totalHoldings: number;
  dayChange: number;
  dayChangePercent: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  pe?: number;
  dividend?: number;
  isWatchlisted?: boolean;
}

interface WatchlistItem extends Stock {
  addedDate: string;
  alertPrice?: number;
}

const COLORS = ['#00FFD1', '#8B5CF6', '#06FFA5', '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#F97316'];

// Animated number counter for bold, dynamic KPIs
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

const mockInvestments: Investment[] = [
  {
    _id: '1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    type: 'stock',
    quantity: 50,
    avgPrice: 2800,
    currentPrice: 2875.50,
    totalInvested: 140000,
    currentValue: 143775,
    gainLoss: 3775,
    gainLossPercent: 2.7,
    sector: 'Energy',
    lastUpdated: new Date().toISOString(),
    dayChange: 45.25,
    dayChangePercent: 1.6,
    volume: 2450000,
    marketCap: 1945000000000,
    pe: 24.5,
    dividend: 2.1
  },
  {
    _id: '2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    type: 'stock',
    quantity: 25,
    avgPrice: 3900,
    currentPrice: 3980.25,
    totalInvested: 97500,
    currentValue: 99506.25,
    gainLoss: 2006.25,
    gainLossPercent: 2.06,
    sector: 'Information Technology',
    lastUpdated: new Date().toISOString(),
    dayChange: -25.75,
    dayChangePercent: -0.64,
    volume: 1850000,
    marketCap: 1456000000000,
    pe: 28.3,
    dividend: 1.8
  },
  {
    _id: '3',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    type: 'stock',
    quantity: 75,
    avgPrice: 1650,
    currentPrice: 1678.90,
    totalInvested: 123750,
    currentValue: 125917.50,
    gainLoss: 2167.50,
    gainLossPercent: 1.75,
    sector: 'Financial Services',
    lastUpdated: new Date().toISOString(),
    dayChange: 12.40,
    dayChangePercent: 0.74,
    volume: 3200000,
    marketCap: 1234000000000,
    pe: 18.7,
    dividend: 1.5
  }
];

const mockWatchlist: WatchlistItem[] = [
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    price: 1845.60,
    change: -18.30,
    changePercent: -0.98,
    volume: 2100000,
    marketCap: 765000000000,
    sector: 'Information Technology',
    pe: 26.1,
    dividend: 2.3,
    addedDate: '2024-01-15',
    alertPrice: 1800
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    price: 1156.75,
    change: 8.90,
    changePercent: 0.78,
    volume: 4500000,
    marketCap: 812000000000,
    sector: 'Financial Services',
    pe: 16.4,
    dividend: 1.2,
    addedDate: '2024-01-20'
  }
];

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist' | 'search' | 'performance'>('portfolio');
  const [sortBy, setSortBy] = useState<'symbol' | 'gainLoss' | 'gainLossPercent' | 'currentValue'>('gainLossPercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [showValues, setShowValues] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const panic = useUIStore((s) => s.panic);

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    if (investments.length > 0) {
      calculatePortfolioSummary();
    }
  }, [investments]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/investments');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInvestments(Array.isArray(data.investments) ? data.investments : []);
      // Prefer server-calculated summary if available; otherwise compute locally
      if (data.summary) {
        setPortfolioSummary({
          totalInvested: data.summary.totalInvested || 0,
          totalCurrentValue: data.summary.totalCurrentValue || 0,
          totalGainLoss: data.summary.totalGainLoss || 0,
          totalGainLossPercent: data.summary.totalGainLossPercent || 0,
          totalHoldings: data.summary.totalHoldings || 0,
          dayChange: 0,
          dayChangePercent: 0,
        });
      } else {
        calculatePortfolioSummary();
      }
      // Keep existing watchlist until we implement server-side watchlist
      setWatchlist(mockWatchlist);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioSummary = () => {
    const summary = investments.reduce((acc, investment) => {
      acc.totalInvested += investment.totalInvested;
      acc.totalCurrentValue += investment.currentValue;
      acc.totalGainLoss += investment.gainLoss;
      acc.totalHoldings += 1;
      acc.dayChange += (investment.dayChange || 0) * investment.quantity;
      return acc;
    }, {
      totalInvested: 0,
      totalCurrentValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      totalHoldings: 0,
      dayChange: 0,
      dayChangePercent: 0
    });

    summary.totalGainLossPercent = (summary.totalGainLoss / summary.totalInvested) * 100;
    summary.dayChangePercent = (summary.dayChange / (summary.totalCurrentValue - summary.dayChange)) * 100;

    setPortfolioSummary(summary);
  };

  const addToPortfolio = (stock: Stock) => {
    setSelectedInvestment({
      _id: Date.now().toString(),
      symbol: stock.symbol,
      name: stock.name,
      type: 'stock',
      quantity: 0,
      avgPrice: stock.price,
      currentPrice: stock.price,
      totalInvested: 0,
      currentValue: 0,
      gainLoss: 0,
      gainLossPercent: 0,
      sector: stock.sector,
      lastUpdated: new Date().toISOString(),
      dayChange: stock.change,
      dayChangePercent: stock.changePercent,
      volume: stock.volume,
      marketCap: stock.marketCap,
      pe: stock.pe,
      dividend: stock.dividend
    });
    setShowAddDialog(true);
  };

  const addToWatchlist = (stock: Stock) => {
    const newWatchlistItem: WatchlistItem = {
      ...stock,
      addedDate: new Date().toISOString().split('T')[0]
    };
    setWatchlist(prev => [...prev, newWatchlistItem]);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  const refreshPrices = async () => {
    setLoading(true);
    // Simulate price updates
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setInvestments(prev => prev.map(investment => ({
      ...investment,
      currentPrice: investment.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
      dayChange: (Math.random() - 0.5) * 50,
      dayChangePercent: (Math.random() - 0.5) * 3,
      lastUpdated: new Date().toISOString()
    })));
    
    setLoading(false);
    toast.success('Prices updated successfully');
  };

  const getSortedInvestments = () => {
    const filtered = filterSector === 'all' 
      ? investments 
      : investments.filter(inv => inv.sector === filterSector);
    
    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier;
      }
      
      return ((aValue as number) - (bValue as number)) * multiplier;
    });
  };

  const sectors = [...new Set(investments.map(inv => inv.sector).filter(Boolean))];
  const sectorData = sectors.map(sector => {
    const sectorInvestments = investments.filter(inv => inv.sector === sector);
    const totalValue = sectorInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    return {
      sector,
      value: totalValue,
      percentage: ((totalValue / (portfolioSummary?.totalCurrentValue || 1)) * 100).toFixed(1)
    };
  });

  if (loading && investments.length === 0) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${panic ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
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
            <BarChart3 className="w-8 h-8 text-neon-teal" />
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage your investment portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Panic mode toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => useUIStore.getState().togglePanic()}
            className={`${panic ? 'border-red-500/50 text-red-400' : ''}`}
            title="Panic mode: immediately blur sensitive numbers"
          >
            <Shield className={`w-4 h-4 mr-2 ${panic ? 'animate-pulse' : ''}`} />
            {panic ? 'Panic On' : 'Panic Off'}
          </Button>
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
            onClick={refreshPrices}
            disabled={loading}
            className="border-neon-teal/30 hover:bg-neon-teal/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setActiveTab('search')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <BarChart3 className="w-4 h-4 text-neon-teal" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">
              {showValues ? <CountUpNumber value={portfolioSummary.totalCurrentValue} prefix="₹" /> : '••••••'}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              portfolioSummary.dayChange >= 0 ? 'text-neon-lime' : 'text-red-400'
            }`}>
              {portfolioSummary.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {showValues ? `₹${Math.abs(portfolioSummary.dayChange).toFixed(0)}` : '••••'} ({portfolioSummary.dayChangePercent.toFixed(2)}%)
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
              <DollarSign className="w-4 h-4 text-neon-violet" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">
              {showValues ? <CountUpNumber value={portfolioSummary.totalInvested} prefix="₹" /> : '••••••'}
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
              {portfolioSummary.totalGainLoss >= 0 ? 
                <TrendingUp className="w-4 h-4 text-neon-lime" /> : 
                <TrendingDown className="w-4 h-4 text-red-400" />
              }
            </div>
            <div className={`text-2xl font-bold ${
              portfolioSummary.totalGainLoss >= 0 ? 'text-neon-lime' : 'text-red-400'
            }`}>
              {showValues ? (
                `${portfolioSummary.totalGainLoss >= 0 ? '+₹' : '-₹'}${Math.abs(portfolioSummary.totalGainLoss).toFixed(0)}`
              ) : '••••••'}
            </div>
            <div className={`text-sm ${
              portfolioSummary.totalGainLoss >= 0 ? 'text-neon-lime' : 'text-red-400'
            }`}>
              {portfolioSummary.totalGainLossPercent >= 0 ? '+' : ''}{portfolioSummary.totalGainLossPercent.toFixed(2)}%
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
              <Target className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight"><CountUpNumber value={portfolioSummary.totalHoldings} /></div>
            <div className="text-sm text-muted-foreground">Active positions</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Watchlist</p>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight"><CountUpNumber value={watchlist.length} /></div>
            <div className="text-sm text-muted-foreground">Tracked stocks</div>
          </motion.div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 backdrop-blur-xl border border-white/10">
        {(['portfolio', 'performance', 'watchlist', 'search'] as const).map((tab) => (
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
        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={filterSector} onValueChange={setFilterSector}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="symbol">Symbol</SelectItem>
                    <SelectItem value="gainLossPercent">Gain/Loss %</SelectItem>
                    <SelectItem value="gainLoss">Gain/Loss Amount</SelectItem>
                    <SelectItem value="currentValue">Current Value</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {/* Holdings Grid */}
            <div className="grid gap-4">
              {getSortedInvestments().map((investment, index) => (
                <motion.div
                  key={investment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/8 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-teal/20 to-neon-violet/20 flex items-center justify-center">
                        <span className="font-bold text-sm">{investment.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{investment.symbol}</div>
                        <div className="text-sm text-muted-foreground">{investment.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-neon-teal/20 text-neon-teal text-xs font-medium">
                            {investment.sector}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {investment.quantity} shares @ ₹{investment.avgPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-8 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="font-semibold">
                          {showValues ? `₹${investment.currentPrice.toFixed(2)}` : '••••••'}
                        </div>
                        <div className={`text-xs flex items-center gap-1 justify-end ${
                          (investment.dayChange || 0) >= 0 ? 'text-neon-lime' : 'text-red-400'
                        }`}>
                          {(investment.dayChange || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {investment.dayChangePercent?.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className="font-semibold">
                          {showValues ? `₹${investment.currentValue.toFixed(0)}` : '••••••'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Invested: {showValues ? `₹${investment.totalInvested.toFixed(0)}` : '••••••'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Gain/Loss</div>
                        <div className={`font-semibold ${
                          investment.gainLoss >= 0 ? 'text-neon-lime' : 'text-red-400'
                        }`}>
                          {showValues ? (
                            `${investment.gainLoss >= 0 ? '+₹' : '-₹'}${Math.abs(investment.gainLoss).toFixed(0)}`
                          ) : '••••••'}
                        </div>
                        <div className={`text-xs ${
                          investment.gainLoss >= 0 ? 'text-neon-lime' : 'text-red-400'
                        }`}>
                          {investment.gainLossPercent >= 0 ? '+' : ''}{investment.gainLossPercent.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sector Allocation */}
            {sectorData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex items-center justify-center">
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [showValues ? `₹${value.toLocaleString()}` : '••••••', 'Value']}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {sectorData.map((sector, index) => (
                      <div key={sector.sector} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{sector.sector}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {showValues ? `₹${sector.value.toLocaleString()}` : '••••••'} ({sector.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PortfolioPerformance />
          </motion.div>
        )}

        {activeTab === 'watchlist' && (
          <motion.div
            key="watchlist"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Watchlist ({watchlist.length})</h3>
              <Button variant="outline" size="sm" onClick={refreshPrices} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Prices
              </Button>
            </div>
            
            {watchlist.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No stocks in watchlist</h3>
                <p className="text-muted-foreground mb-4">Add stocks to your watchlist to track their performance</p>
                <Button onClick={() => setActiveTab('search')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stocks
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {watchlist.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/8 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">{stock.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-neon-teal/20 text-neon-teal text-xs font-medium">
                              {stock.sector}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Added: {new Date(stock.addedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8 text-right">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Price</div>
                          <div className="font-semibold">
                            {showValues ? `₹${stock.price.toFixed(2)}` : '••••••'}
                          </div>
                          <div className={`text-xs flex items-center gap-1 justify-end ${
                            stock.change >= 0 ? 'text-neon-lime' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground">Market Cap</div>
                          <div className="font-semibold">
                            ₹{(stock.marketCap / 1e9).toFixed(1)}B
                          </div>
                          <div className="text-xs text-muted-foreground">
                            P/E: {stock.pe?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => addToPortfolio(stock)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromWatchlist(stock.symbol)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <StarOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-4">Search & Add Stocks</h3>
              <StockSearch 
                onAddToPortfolio={addToPortfolio}
                onAddToWatchlist={addToWatchlist}
                onRemoveFromWatchlist={removeFromWatchlist}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Investment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Add Investment</DialogTitle>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <h3 className="font-semibold text-lg mb-2">{selectedInvestment.symbol}</h3>
                <p className="text-sm text-muted-foreground mb-3">{selectedInvestment.name}</p>
                <div className="text-2xl font-extrabold tracking-tight">
                  ₹{Number(selectedInvestment.currentPrice).toFixed(2)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input 
                    type="number" 
                    placeholder="Enter quantity"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price per share</label>
                  <Input 
                    type="number" 
                    value={selectedInvestment.currentPrice.toFixed(2)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowAddDialog(false);
                    toast.success(`${selectedInvestment.symbol} added to portfolio`);
                  }}
                >
                  Add to Portfolio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
