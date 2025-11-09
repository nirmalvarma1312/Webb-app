/**
 * API Service for fetching financial data
 * Uses Alpha Vantage API with fallback options
 */

import { cache } from './cache';
import { rateLimiter } from './rate-limiter';
import { IndexData, HistoricalDataPoint, IndexDetail } from './types';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const MIN_REFRESH_INTERVAL = parseInt(process.env.MIN_REFRESH_INTERVAL_SECONDS || '60', 10) * 1000;

// Popular indices to track
export const TRACKED_INDICES = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'DIA', name: 'Dow Jones ETF' },
  { symbol: 'QQQ', name: 'NASDAQ-100 ETF' },
  { symbol: 'IWM', name: 'Russell 2000 ETF' },
  { symbol: 'VTI', name: 'Total Stock Market ETF' },
];

interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
    '07. latest trading day': string;
  };
}

interface AlphaVantageTimeSeries {
  'Meta Data': {
    '2. Symbol': string;
    '3. Last Refreshed': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

/**
 * Fetch current quote for a symbol
 */
export async function fetchQuote(symbol: string): Promise<IndexData | null> {
  const cacheKey = `quote:${symbol}`;
  
  // Check cache first
  const cached = cache.get<IndexData>(cacheKey);
  if (cached) {
    console.log(`[API] Cache hit for ${symbol}`);
    return cached;
  }

  // Check rate limit
  const rateLimitCheck = rateLimiter.canMakeRequest();
  if (!rateLimitCheck.allowed) {
    console.warn(`[API] Rate limit exceeded: ${rateLimitCheck.reason}`);
    throw new Error(rateLimitCheck.reason);
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY is not configured');
  }

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    console.log(`[API] Fetching quote for ${symbol}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AlphaVantageQuote = await response.json();
    
    // Record the request
    rateLimiter.recordRequest();

    // Check if API returned valid data
    if (!data['Global Quote'] || !data['Global Quote']['01. symbol']) {
      console.warn(`[API] Invalid response for ${symbol}:`, data);
      return null;
    }

    const quote = data['Global Quote'];
    const indexData: IndexData = {
      symbol: quote['01. symbol'],
      name: TRACKED_INDICES.find(i => i.symbol === symbol)?.name || symbol,
      value: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      timestamp: quote['07. latest trading day'],
    };

    // Cache the result
    cache.set(cacheKey, indexData);
    
    return indexData;
  } catch (error) {
    console.error(`[API] Error fetching quote for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch historical data for a symbol (30 days)
 */
export async function fetchHistoricalData(symbol: string): Promise<HistoricalDataPoint[]> {
  const cacheKey = `historical:${symbol}`;
  
  // Check cache first
  const cached = cache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) {
    console.log(`[API] Cache hit for historical data ${symbol}`);
    return cached;
  }

  // Check rate limit
  const rateLimitCheck = rateLimiter.canMakeRequest();
  if (!rateLimitCheck.allowed) {
    console.warn(`[API] Rate limit exceeded: ${rateLimitCheck.reason}`);
    throw new Error(rateLimitCheck.reason);
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY is not configured');
  }

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    
    console.log(`[API] Fetching historical data for ${symbol}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AlphaVantageTimeSeries = await response.json();
    
    // Record the request
    rateLimiter.recordRequest();

    // Check if API returned valid data
    if (!data['Time Series (Daily)']) {
      console.warn(`[API] Invalid historical response for ${symbol}:`, data);
      return [];
    }

    const timeSeries = data['Time Series (Daily)'];
    const historicalData: HistoricalDataPoint[] = Object.entries(timeSeries)
      .slice(0, 30) // Get last 30 days
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume']),
      }))
      .reverse(); // Oldest to newest

    // Cache the result with longer TTL for historical data
    cache.set(cacheKey, historicalData, 300); // 5 minutes
    
    return historicalData;
  } catch (error) {
    console.error(`[API] Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch complete index detail (quote + historical)
 */
export async function fetchIndexDetail(symbol: string): Promise<IndexDetail | null> {
  try {
    const [quote, historicalData] = await Promise.all([
      fetchQuote(symbol),
      fetchHistoricalData(symbol),
    ]);

    if (!quote) {
      return null;
    }

    return {
      symbol: quote.symbol,
      name: quote.name,
      currentValue: quote.value,
      change: quote.change,
      changePercent: quote.changePercent,
      timestamp: quote.timestamp,
      historicalData,
    };
  } catch (error) {
    console.error(`[API] Error fetching index detail for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch all tracked indices
 */
export async function fetchAllIndices(): Promise<IndexData[]> {
  const results: IndexData[] = [];
  
  // Fetch sequentially to avoid rate limiting
  for (const index of TRACKED_INDICES) {
    try {
      const data = await fetchQuote(index.symbol);
      if (data) {
        results.push(data);
      }
      
      // Add delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[API] Error fetching ${index.symbol}:`, error);
      // Continue with other indices
    }
  }
  
  return results;
}

