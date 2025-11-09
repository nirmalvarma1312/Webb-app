/**
 * Rate Limit Indicator Component
 * Shows current API usage statistics
 */

import React from 'react';

interface RateLimitIndicatorProps {
  minuteUsage: number;
  minuteLimit: number;
  monthUsage: number;
  monthLimit: number;
}

export default function RateLimitIndicator({
  minuteUsage,
  minuteLimit,
  monthUsage,
  monthLimit,
}: RateLimitIndicatorProps) {
  const minutePercentage = (minuteUsage / minuteLimit) * 100;
  const monthPercentage = (monthUsage / monthLimit) * 100;

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">API Usage</h3>
      
      <div className="space-y-4">
        {/* Minute Usage */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Per Minute</span>
            <span>
              {minuteUsage} / {minuteLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getColorClass(
                minutePercentage
              )}`}
              style={{ width: `${Math.min(minutePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Month Usage */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Per Month</span>
            <span>
              {monthUsage} / {monthLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getColorClass(
                monthPercentage
              )}`}
              style={{ width: `${Math.min(monthPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

