/**
 * Home Page
 * Lists all tracked indices with real-time updates
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import IndexCard from '@/components/IndexCard';
import RateLimitIndicator from '@/components/RateLimitIndicator';
import WebSocketStatus from '@/components/WebSocketStatus';
import { IndexData, ApiResponse } from '@/lib/types';

export default function Home() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState({
    minuteUsage: 0,
    minuteLimit: 20,
    monthUsage: 0,
    monthLimit: 500,
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>();

  // Fetch initial data
  useEffect(() => {
    fetchIndices();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WebSocket] Connected');
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'update' && message.data) {
              console.log('[WebSocket] Received update');
              setIndices(message.data);
              setLastUpdate(message.timestamp);
            }
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          setWsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...');
            connect();
          }, 5000);
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          setWsConnected(false);
        };
      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
        setWsConnected(false);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const fetchIndices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/indices');
      const data: ApiResponse<IndexData[]> = await response.json();

      if (data.success && data.data) {
        setIndices(data.data);
        if (data.rateLimit) {
          setRateLimit(data.rateLimit);
        }
        setLastUpdate(data.timestamp);
      } else {
        setError(data.error || 'Failed to fetch indices');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Financial Indices Tracker</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Financial Indices Tracker
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Real-time market data with 30-day historical views
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                <WebSocketStatus
                  isConnected={wsConnected}
                  lastUpdate={lastUpdate}
                />
                <button
                  onClick={fetchIndices}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Rate Limit Indicator */}
          <div className="mb-6">
            <RateLimitIndicator
              minuteUsage={rateLimit.minuteUsage}
              minuteLimit={rateLimit.minuteLimit}
              monthUsage={rateLimit.monthUsage}
              monthLimit={rateLimit.monthLimit}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && indices.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Indices Grid */}
          {!loading && indices.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-600">No indices data available</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indices.map((index) => (
              <IndexCard key={index.symbol} index={index} />
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              About This Tracker
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • <strong>Real-time Updates:</strong> Data refreshes automatically via WebSocket every 2 minutes
              </p>
              <p>
                • <strong>Smart Caching:</strong> Responses are cached for 60 seconds to minimize API calls
              </p>
              <p>
                • <strong>Rate Limiting:</strong> Respects API limits of 20 requests/minute and 500 requests/month
              </p>
              <p>
                • <strong>Historical Data:</strong> Click any index to view 30-day price history
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600">
              Built with Next.js, TypeScript, and Alpha Vantage API
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

