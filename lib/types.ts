/**
 * Type definitions for the application
 */

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface IndexDetail {
  symbol: string;
  name: string;
  currentValue: number;
  change: number;
  changePercent: number;
  timestamp: string;
  historicalData: HistoricalDataPoint[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
  rateLimit?: {
    minuteUsage: number;
    minuteLimit: number;
    monthUsage: number;
    monthLimit: number;
  };
}

export interface WebSocketMessage {
  type: 'update' | 'error' | 'connected' | 'heartbeat';
  data?: any;
  timestamp: string;
}

export interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
}

