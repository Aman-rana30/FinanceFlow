import { Request, Response } from "express";
import { Investment } from "../models/Investment";
import fetch from "node-fetch";

// Alpha Vantage integration helpers
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;

/**
 * If the symbol has no suffix, try Indian exchanges in order: .BSE -> .NS
 * Returns a list of candidates to try in order.
 */
function symbolCandidates(sym: string) {
  const s = sym.trim().toUpperCase();
  if (s.includes(".")) return [s];
  return [s + ".NS", s + ".BSE", s]; // try NSE, then BSE, then raw
}

/**
 * Fetch one quote via Alpha Vantage GLOBAL_QUOTE, returning our normalized shape.
 */
async function fetchAlphaVantageQuote(sym: string) {
  if (!ALPHA_VANTAGE_KEY) return null;
  const candidates = symbolCandidates(sym);

  for (const c of candidates) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
      c
    )}&apikey=${ALPHA_VANTAGE_KEY}`;

    const r = await fetch(url);
    if (!r.ok) continue;
    const j = await r.json();

    const gq = j?.["Global Quote"];
    if (!gq || Object.keys(gq).length === 0) continue;

    const price = parseFloat(gq["05. price"]);
    const open = parseFloat(gq["02. open"]);
    const high = parseFloat(gq["03. high"]);
    const low = parseFloat(gq["04. low"]);
    const prevClose = parseFloat(gq["08. previous close"]);
    const changePercentStr = gq["10. change percent"] || "";
    const change =
      typeof changePercentStr === "string"
        ? parseFloat(changePercentStr.replace("%", ""))
        : undefined;

    // Normalize to our response shape
    return {
      symbol: gq["01. symbol"] || c,
      name: gq["01. symbol"] || c, // AV doesn't return longName here
      price: Number.isFinite(price) ? price : undefined,
      change: Number.isFinite(change) ? change : undefined,
      open: Number.isFinite(open) ? open : undefined,
      high: Number.isFinite(high) ? high : undefined,
      low: Number.isFinite(low) ? low : undefined,
      prevClose: Number.isFinite(prevClose) ? prevClose : undefined,
      volume: parseFloat(gq["06. volume"]) || undefined,
    };
  }

  return null;
}

// Mock stock price API (in production, use real APIs like Alpha Vantage, Yahoo Finance, etc.)
const mockStockPrices: Record<string, number> = {
  'RELIANCE': 2875.50,
  'TCS': 3980.25,
  'INFY': 1845.75,
  'HDFCBANK': 1678.90,
  'ICICIBANK': 1245.60,
  'ITC': 456.80,
  'SBIN': 825.45,
  'BHARTIARTL': 1598.30,
  'ASIANPAINT': 2890.15,
  'MARUTI': 11245.80,
  'NIFTY50': 24350.75,
  'SENSEX': 80125.30
};

const sectorData = {
  'RELIANCE': 'Energy',
  'TCS': 'Information Technology',
  'INFY': 'Information Technology',
  'HDFCBANK': 'Financial Services',
  'ICICIBANK': 'Financial Services',
  'ITC': 'FMCG',
  'SBIN': 'Financial Services',
  'BHARTIARTL': 'Telecom',
  'ASIANPAINT': 'Paints',
  'MARUTI': 'Automobile'
};

// Get all investments for a user
export const getInvestments = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011'; // Mock user ID
    
    const investments = await Investment.find({ userId }).sort({ createdAt: -1 });
    
    // Calculate portfolio summary
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    
    // Group by sector
    const sectorAllocation = investments.reduce((acc: any, inv) => {
      const sector = inv.sector || 'Others';
      if (!acc[sector]) {
        acc[sector] = { value: 0, count: 0 };
      }
      acc[sector].value += inv.currentValue;
      acc[sector].count += 1;
      return acc;
    }, {});
    
    // Group by type
    const typeAllocation = investments.reduce((acc: any, inv) => {
      if (!acc[inv.type]) {
        acc[inv.type] = { value: 0, count: 0 };
      }
      acc[inv.type].value += inv.currentValue;
      acc[inv.type].count += 1;
      return acc;
    }, {});
    
    res.json({
      investments,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
        totalHoldings: investments.length
      },
      allocation: {
        sector: sectorAllocation,
        type: typeAllocation
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

// Add new investment
export const addInvestment = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011'; // Mock user ID
    const { symbol, name, type, quantity, avgPrice, purchaseDate, sector } = req.body;
    
    // Get current price (mock)
    const currentPrice = mockStockPrices[symbol.toUpperCase()] || avgPrice;
    const totalInvested = quantity * avgPrice;
    const currentValue = quantity * currentPrice;
    const gainLoss = currentValue - totalInvested;
    const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
    
    const investment = new Investment({
      userId,
      symbol: symbol.toUpperCase(),
      name,
      type,
      quantity,
      avgPrice,
      currentPrice,
      totalInvested,
      currentValue,
      gainLoss,
      gainLossPercent,
      sector: sector || sectorData[symbol.toUpperCase()] || 'Others',
      purchaseDate: new Date(purchaseDate),
      lastUpdated: new Date()
    });
    
    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    console.error('Error adding investment:', error);
    res.status(500).json({ error: 'Failed to add investment' });
  }
};

// Update investment prices (mock real-time updates)
export const updatePrices = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    const investments = await Investment.find({ userId });
    
    const updates = [];
    for (const investment of investments) {
      const newPrice = mockStockPrices[investment.symbol] || investment.currentPrice;
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% random change
      const updatedPrice = newPrice * (1 + priceChange);
      
      const currentValue = investment.quantity * updatedPrice;
      const gainLoss = currentValue - investment.totalInvested;
      const gainLossPercent = investment.totalInvested > 0 ? (gainLoss / investment.totalInvested) * 100 : 0;
      
      await Investment.findByIdAndUpdate(investment._id, {
        currentPrice: updatedPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
        lastUpdated: new Date()
      });
      
      updates.push({
        symbol: investment.symbol,
        oldPrice: investment.currentPrice,
        newPrice: updatedPrice,
        change: ((updatedPrice - investment.currentPrice) / investment.currentPrice) * 100
      });
    }
    
    res.json({ message: 'Prices updated', updates });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ error: 'Failed to update prices' });
  }
};

// Get market data (trending stocks, indices)
export const getMarketData = async (req: Request, res: Response) => {
  try {
    // Prefer configured API; otherwise default to Yahoo Finance for common NSE tickers
    const defaultSymbols = ['RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS','ICICIBANK.NS','ITC.NS','SBIN.NS','ASIANPAINT.NS','MARUTI.NS'];
    const defaultYahoo = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${defaultSymbols.join(',')}`;
    const liveUrl = process.env.MARKET_API_URL || defaultYahoo; // e.g. Yahoo Finance quote endpoint

    try {
      const r = await fetch(liveUrl);
      const data = await r.json();
      // Normalize Yahoo-like structures
      const quotes = (data?.quoteResponse?.result || data?.data || []).map((q: any) => ({
        symbol: q.symbol,
        name: q.longName || q.shortName || q.symbol,
        price: q.regularMarketPrice ?? q.price,
        change: q.regularMarketChangePercent ?? q.changePercent,
        sector: q.sector || '-',
        volume: q.regularMarketVolume ?? q.volume,
      }));
      if (quotes.length > 0) {
        const topGainers = [...quotes].filter((q) => typeof q.change === 'number' && q.change > 0).sort((a, b) => (b.change as number) - (a.change as number)).slice(0, 5);
        const topLosers = [...quotes].filter((q) => typeof q.change === 'number' && q.change < 0).sort((a, b) => (a.change as number) - (b.change as number)).slice(0, 5);
        return res.json({
          indices: [],
          trending: quotes.slice(0, 10),
          topGainers,
          topLosers,
          marketStatus: { isOpen: true, nextSession: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        });
      }
      // If live returns empty, fall through to mock
    } catch (e) {
      // fall through to mock if live fails
    }

    // Mock fallback
    const indices = [
      { symbol: 'NIFTY50', name: 'Nifty 50', price: 24350.75, change: 0.8, volume: '2.5B' },
      { symbol: 'SENSEX', name: 'BSE Sensex', price: 80125.30, change: 0.6, volume: '1.8B' },
      { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 52890.45, change: -0.3, volume: '890M' }
    ];

    const trending = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2875.50, change: -0.3, sector: 'Energy' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3980.25, change: 1.2, sector: 'IT' },
      { symbol: 'INFY', name: 'Infosys Limited', price: 1845.75, change: 0.9, sector: 'IT' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1678.90, change: -0.1, sector: 'Banking' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1245.60, change: 0.5, sector: 'Banking' }
    ];

    const topGainers = trending
      .filter(stock => stock.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 5);

    const topLosers = trending
      .filter(stock => stock.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 5);

    res.json({
      indices,
      trending,
      topGainers,
      topLosers,
      marketStatus: {
        isOpen: new Date().getHours() >= 9 && new Date().getHours() < 16,
        nextSession: '9:15 AM IST',
        timezone: 'Asia/Kolkata'
      }
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
};

// Fetch quotes for a comma-separated list of symbols using external API when configured
export const getQuotes = async (req: Request, res: Response) => {
  try {
    const symbolsRaw = String(req.query.symbols || "").trim();
    if (!symbolsRaw) return res.status(400).json({ error: "symbols_required" });

    const symbols = symbolsRaw.split(",").map((s) => s.trim()).filter(Boolean);

    // Prefer Alpha Vantage if key present. Note: AV free tier is rate-limited (5 req/min).
    if (ALPHA_VANTAGE_KEY) {
      try {
        const results = await Promise.all(symbols.map((s) => fetchAlphaVantageQuote(s)));
        const quotes = results.filter(Boolean) as any[];
        if (quotes.length > 0) {
          return res.json(quotes);
        }
        // fall through to Yahoo if AV returned nothing
      } catch {
        // fall through to Yahoo on any AV error
      }
    }

    // Yahoo fallback (existing behavior)
    const defaultYahoo = `https://query1.finance.yahoo.com/v7/finance/quote`;
    const base = process.env.QUOTE_API_URL || process.env.MARKET_API_URL || defaultYahoo;
    const url = base.includes("symbols=")
      ? base
      : `${base}${base.includes("?") ? "&" : "?"}symbols=${encodeURIComponent(symbols.join(","))}`;

    const r = await fetch(url);
    const data = await r.json();
    const quotes = (data?.quoteResponse?.result || data?.data || []).map((q: any) => ({
      symbol: q.symbol || q.ticker,
      name: q.longName || q.shortName || q.name || q.symbol,
      price: q.regularMarketPrice ?? q.price,
      change: q.regularMarketChangePercent ?? q.changePercent,
      open: q.regularMarketOpen ?? q.open,
      high: q.regularMarketDayHigh ?? q.high,
      low: q.regularMarketDayLow ?? q.low,
      prevClose: q.regularMarketPreviousClose ?? q.previousClose,
      volume: q.regularMarketVolume ?? q.volume,
    }));
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
};

// Search stocks
export const searchStocks = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || "").trim();
    if (!query) return res.json([]);

    // Try Alpha Vantage symbol search if available
    if (ALPHA_VANTAGE_KEY) {
      try {
        const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
          query
        )}&apikey=${ALPHA_VANTAGE_KEY}`;
        const r = await fetch(url);
        const j = await r.json();
        const matches = Array.isArray(j?.bestMatches) ? j.bestMatches : [];
        const mapped = matches.map((m: any) => ({
          symbol: m["1. symbol"],
          name: m["2. name"],
          sector: "-", // AV search doesn't include sector
          exchange: m["4. region"] || m["8. currency"] || "-",
        }));
        if (mapped.length) return res.json(mapped);
        // fall through to mock if empty
      } catch {
        // fall through to mock on error
      }
    }

    // Mock search results fallback
    const allStocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', exchange: 'NSE' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT', exchange: 'NSE' },
      { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', exchange: 'NSE' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', exchange: 'NSE' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', exchange: 'NSE' },
      { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE' },
      { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', exchange: 'NSE' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', exchange: 'NSE' }
    ];

    const results = allStocks.filter((stock) =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );

    res.json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
};