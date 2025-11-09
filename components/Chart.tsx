/**
 * Chart Component
 * Displays 30-day historical data using Recharts
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { HistoricalDataPoint } from '@/lib/types';
import { format } from 'date-fns';

interface ChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
}

export default function Chart({ data, symbol }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No historical data available</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((point) => ({
    date: format(new Date(point.date), 'MMM dd'),
    fullDate: point.date,
    close: point.close,
    high: point.high,
    low: point.low,
    open: point.open,
  }));

  // Determine if trend is positive
  const firstValue = data[0].close;
  const lastValue = data[data.length - 1].close;
  const isPositive = lastValue >= firstValue;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        30-Day Price History
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? '#10b981' : '#ef4444'}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? '#10b981' : '#ef4444'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">Current</p>
          <p className="text-lg font-semibold text-gray-900">
            ${lastValue.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">30-Day High</p>
          <p className="text-lg font-semibold text-green-600">
            ${Math.max(...data.map((d) => d.high)).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">30-Day Low</p>
          <p className="text-lg font-semibold text-red-600">
            ${Math.min(...data.map((d) => d.low)).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">30-Day Change</p>
          <p
            className={`text-lg font-semibold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}
            {(((lastValue - firstValue) / firstValue) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

