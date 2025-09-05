import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Plus, Star, StarOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { toast } from "sonner";

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

interface StockSearchProps {
  onAddToPortfolio: (stock: Stock) => void;
  onAddToWatchlist: (stock: Stock) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
}

const mockStocks: Stock[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2875.50,
    change: 45.25,
    changePercent: 1.6,
    volume: 2450000,
    marketCap: 1945000000000,
    sector: "Energy",
    pe: 24.5,
    dividend: 2.1,
    isWatchlisted: false
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 3980.25,
    change: -25.75,
    changePercent: -0.64,
    volume: 1850000,
    marketCap: 1456000000000,
    sector: "Information Technology",
    pe: 28.3,
    dividend: 1.8,
    isWatchlisted: true
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 1678.90,
    change: 12.40,
    changePercent: 0.74,
    volume: 3200000,
    marketCap: 1234000000000,
    sector: "Financial Services",
    pe: 18.7,
    dividend: 1.5,
    isWatchlisted: false
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1845.60,
    change: -18.30,
    changePercent: -0.98,
    volume: 2100000,
    marketCap: 765000000000,
    sector: "Information Technology",
    pe: 26.1,
    dividend: 2.3,
    isWatchlisted: true
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 1156.75,
    change: 8.90,
    changePercent: 0.78,
    volume: 4500000,
    marketCap: 812000000000,
    sector: "Financial Services",
    pe: 16.4,
    dividend: 1.2,
    isWatchlisted: false
  }
];

export default function StockSearch({ onAddToPortfolio, onAddToWatchlist, onRemoveFromWatchlist }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(["TCS", "INFY"]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filtered = mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.sector.toLowerCase().includes(query.toLowerCase())
    ).map(stock => ({
      ...stock,
      isWatchlisted: watchlist.includes(stock.symbol)
    }));
    
    setSearchResults(filtered);
    setShowResults(true);
    setLoading(false);
  };

  const toggleWatchlist = (stock: Stock) => {
    if (watchlist.includes(stock.symbol)) {
      setWatchlist(prev => prev.filter(s => s !== stock.symbol));
      onRemoveFromWatchlist(stock.symbol);
      toast.success(`${stock.symbol} removed from watchlist`);
    } else {
      setWatchlist(prev => [...prev, stock.symbol]);
      onAddToWatchlist(stock);
      toast.success(`${stock.symbol} added to watchlist`);
    }
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `₹${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `₹${(value / 1e6).toFixed(2)}M`;
    return `₹${value.toLocaleString()}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search stocks by symbol, name, or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 bg-white/5 border-white/10 focus:border-neon-teal/50"
          onFocus={() => searchQuery && setShowResults(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neon-teal animate-spin" />
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {searchResults.length === 0 ? (
              <div className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No stocks found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="p-2">
                {searchResults.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <div className="font-bold text-lg">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">{stock.name}</div>
                          </div>
                          <div className="px-2 py-1 rounded-full bg-neon-teal/20 text-neon-teal text-xs font-medium">
                            {stock.sector}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Price</div>
                            <div className="font-semibold">
                              <MaskedNumber value={stock.price.toFixed(2)} prefix="₹" />
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Change</div>
                            <div className={`font-semibold flex items-center gap-1 ${
                              stock.change >= 0 ? 'text-neon-lime' : 'text-red-400'
                            }`}>
                              {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Volume</div>
                            <div className="font-semibold">{formatVolume(stock.volume)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Market Cap</div>
                            <div className="font-semibold">{formatMarketCap(stock.marketCap)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {watchlist.includes(stock.symbol) ? (
                            <Star className="w-4 h-4 text-neon-teal fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToPortfolio(stock);
                            setShowResults(false);
                            toast.success(`${stock.symbol} added to portfolio`);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Detail Modal */}
      <AnimatePresence>
        {selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStock(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStock.symbol}</h2>
                  <p className="text-muted-foreground">{selectedStock.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    <MaskedNumber value={selectedStock.price.toFixed(2)} prefix="₹" />
                  </div>
                  <div className={`flex items-center gap-1 justify-end ${
                    selectedStock.change >= 0 ? 'text-neon-lime' : 'text-red-400'
                  }`}>
                    {selectedStock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{selectedStock.changePercent.toFixed(2)}%</span>
                    <span>({selectedStock.change >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold">{formatVolume(selectedStock.volume)}</div>
                  <div className="text-sm text-muted-foreground">Volume</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold">{formatMarketCap(selectedStock.marketCap)}</div>
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold">{selectedStock.pe?.toFixed(1) || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">P/E Ratio</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onAddToPortfolio(selectedStock);
                    setSelectedStock(null);
                    toast.success(`${selectedStock.symbol} added to portfolio`);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Portfolio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toggleWatchlist(selectedStock);
                    setSelectedStock(null);
                  }}
                >
                  {watchlist.includes(selectedStock.symbol) ? (
                    <>
                      <StarOff className="w-4 h-4 mr-2" />
                      Remove from Watchlist
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}