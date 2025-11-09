/**
 * Index Detail Page
 * Shows 30-day historical data for a specific index
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Chart from '@/components/Chart';
import RateLimitIndicator from '@/components/RateLimitIndicator';
import { IndexDetail, ApiResponse } from '@/lib/types';

export default function IndexDetailPage() {
  const router = useRouter();
  const { symbol } = router.query;
  
  const [indexDetail, setIndexDetail] = useState<IndexDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState({
    minuteUsage: 0,
    minuteLimit: 20,
    monthUsage: 0,
    monthLimit: 500,
  });

  useEffect(() => {
    if (symbol && typeof symbol === 'string') {
      fetchIndexDetail(symbol);
    }
  }, [symbol]);

  const fetchIndexDetail = async (sym: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/indices/${sym}`);
      const data: ApiResponse<IndexDetail> = await response.json();

      if (data.success && data.data) {
        setIndexDetail(data.data);
        if (data.rateLimit) {
          setRateLimit(data.rateLimit);
        }
      } else {
        setError(data.error || 'Failed to fetch index detail');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isPositive = indexDetail ? indexDetail.change >= 0 : false;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <>
      <Head>
        <title>
          {indexDetail ? `${indexDetail.symbol} - ${indexDetail.name}` : 'Loading...'}
        </title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
            
            {indexDetail && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {indexDetail.symbol}
                </h1>
                <p className="mt-1 text-lg text-gray-600">{indexDetail.name}</p>
              </div>
            )}
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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Index Detail */}
          {!loading && indexDetail && (
            <>
              {/* Current Value Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Price</p>
                    <p className="text-4xl font-bold text-gray-900">
                      ${indexDetail.currentValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Change</p>
                    <p className={`text-3xl font-bold ${changeColor}`}>
                      {isPositive ? '+' : ''}
                      {indexDetail.change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Change %</p>
                    <p className={`text-3xl font-bold ${changeColor}`}>
                      {isPositive ? '+' : ''}
                      {indexDetail.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(indexDetail.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <Chart data={indexDetail.historicalData} symbol={indexDetail.symbol} />

              {/* Historical Data Table */}
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Trading Days
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Open
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          High
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Low
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Close
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {indexDetail.historicalData.slice(-10).reverse().map((point) => (
                        <tr key={point.date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(point.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${point.open.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ${point.high.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ${point.low.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${point.close.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

