import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  RefreshCw, 
  Star,
  Plus,
  BarChart3,
  Activity,
  Clock,
  Globe,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { toast } from "sonner";

interface MarketData {
  indices: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    volume: string;
  }>;
  trending: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    sector: string;
  }>;
  topGainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    sector: string;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    sector: string;
  }>;
  marketStatus: {
    isOpen: boolean;
    nextSession: string;
    timezone: string;
  };
}

interface StockSearchResult {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

export default function Stocks() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'trending' | 'gainers' | 'losers'>('trending');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  const panic = useUIStore((s) => s.panic);

  // Mock historical data for charts
  const generateMockData = (basePrice: number, days: number = 30) => {
    const data = [];
    let price = basePrice;
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
      price = price * (1 + change);
      data.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    return data;
  };

  useEffect(() => {
    fetchMarketData();
    // Auto-refresh every 30 seconds during market hours
    const interval = setInterval(() => {
      if (marketData?.marketStatus.isOpen) {
        fetchMarketData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const id = setTimeout(() => { searchStocks(); }, 300);
      return () => clearTimeout(id);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/market');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async () => {
    try {
      // If user types likely a symbol, try live quotes first
      const likelySymbol = /[^a-z]*[A-Z.]{2,}[^a-z]*/.test(searchQuery) || !/\s/.test(searchQuery);
      if (likelySymbol) {
        const qres = await fetch(`/api/quotes?symbols=${encodeURIComponent(searchQuery.trim())}`);
        if (qres.ok) {
          const quotes = await qres.json();
          if (Array.isArray(quotes) && quotes.length > 0) {
            setSearchResults(quotes.map((q: any) => ({ symbol: q.symbol, name: q.name, sector: q.sector || '-', exchange: q.exchange || '-' })));
            return;
          }
        }
      }
      const response = await fetch(`/api/stocks/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching stocks:', error);
      toast.error('Search failed');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchMarketData();
    setRefreshing(false);
    toast.success('Market data refreshed');
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
    toast.success(
      watchlist.includes(symbol) 
        ? `${symbol} removed from watchlist` 
        : `${symbol} added to watchlist`
    );
  };

  const getActiveStocks = () => {
    if (!marketData) return [];
    switch (activeTab) {
      case 'gainers': return marketData.topGainers;
      case 'losers': return marketData.topLosers;
      default: return marketData.trending;
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Stock Market</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${marketData?.marketStatus.isOpen ? 'bg-purple-accent' : 'bg-red-400'}`}></div>
            <p className="text-muted-foreground">
              Market {marketData?.marketStatus.isOpen ? 'Open' : 'Closed'} • Next session: {marketData?.marketStatus.nextSession}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
            className="border-purple-primary/30 hover:bg-purple-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stocks, ETFs, mutual funds..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl outline-none focus:ring-2 focus:ring-purple-primary/60"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-50"
            >
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{stock.sector}</div>
                    <div className="text-xs text-muted-foreground">{stock.exchange}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketData?.indices.map((index, i) => (
          <motion.div
            key={index.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">{index.symbol}</h3>
                <p className="text-sm text-muted-foreground">{index.name}</p>
              </div>
              {index.change >= 0 ? (
                <TrendingUp className="w-5 h-5 text-purple-accent" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              <MaskedNumber value={index.price.toLocaleString()} />
            </div>
            <div className="flex items-center justify-between">
              <div className={`text-sm font-medium ${index.change >= 0 ? 'text-purple-accent' : 'text-red-400'}`}>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Vol: {index.volume}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stock Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Stock List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Market Movers</h3>
            <div className="flex rounded-lg bg-white/5 p-1">
              {(['trending', 'gainers', 'losers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-purple-primary text-black' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {getActiveStocks().map((stock, index) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-primary/20 to-purple-secondary/20 flex items-center justify-center">
                    <span className="text-xs font-bold">{stock.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                    <div className="text-xs text-muted-foreground">{stock.sector}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">
                      <MaskedNumber value={stock.price.toLocaleString()} prefix="₹" />
                    </div>
                    <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-purple-accent' : 'text-red-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWatchlist(stock.symbol)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star 
                      className={`w-4 h-4 ${watchlist.includes(stock.symbol) ? 'fill-purple-primary text-purple-primary' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-primary" />
              NIFTY 50 Trend
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last 30 days
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={generateMockData(24350, 30)}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FFD1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FFD1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)" 
                fontSize={12}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px'
                }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Price']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#00FFD1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-primary" />
              Your Watchlist
            </h3>
            <div className="text-sm text-muted-foreground">
              {watchlist.length} stocks
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((symbol) => {
              const stock = marketData?.trending.find(s => s.symbol === symbol);
              if (!stock) return null;
              
              return (
                <div
                  key={symbol}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{stock.symbol}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWatchlist(symbol)}
                    >
                      <Star className="w-4 h-4 fill-purple-primary text-purple-primary" />
                    </Button>
                  </div>
                  <div className="text-lg font-bold mb-1">
                    <MaskedNumber value={stock.price.toLocaleString()} prefix="₹" />
                  </div>
                  <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-purple-accent' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Market News/Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-secondary" />
          Market Alerts
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neon-teal/10 border border-neon-teal/20">
            <TrendingUp className="w-5 h-5 text-neon-teal mt-0.5" />
            <div>
              <div className="font-medium">NIFTY 50 hits new high</div>
              <div className="text-sm text-muted-foreground">Index crossed 24,400 level with strong buying in IT and banking stocks</div>
              <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neon-violet/10 border border-neon-violet/20">
            <Globe className="w-5 h-5 text-neon-violet mt-0.5" />
            <div>
              <div className="font-medium">Global markets mixed</div>
              <div className="text-sm text-muted-foreground">Asian markets show cautious trading ahead of US Fed meeting</div>
              <div className="text-xs text-muted-foreground mt-1">4 hours ago</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neon-lime/10 border border-neon-lime/20">
            <Activity className="w-5 h-5 text-neon-lime mt-0.5" />
            <div>
              <div className="font-medium">High volume in banking stocks</div>
              <div className="text-sm text-muted-foreground">HDFC Bank and ICICI Bank see increased institutional activity</div>
              <div className="text-xs text-muted-foreground mt-1">6 hours ago</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}