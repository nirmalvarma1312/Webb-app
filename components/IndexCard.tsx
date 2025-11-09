/**
 * Index Card Component
 * Displays a single index with current value and change
 */

import React from 'react';
import Link from 'next/link';
import { IndexData } from '@/lib/types';

interface IndexCardProps {
  index: IndexData;
}

export default function IndexCard({ index }: IndexCardProps) {
  const isPositive = index.change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <Link href={`/index/${index.symbol}`}>
      <div className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{index.symbol}</h3>
            <p className="text-sm text-gray-600">{index.name}</p>
          </div>
          <div className={`px-2 py-1 rounded ${bgColor}`}>
            <span className={`text-xs font-semibold ${changeColor}`}>
              {isPositive ? '↑' : '↓'}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-3xl font-bold text-gray-900">
            ${index.value.toFixed(2)}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <span className={`text-sm font-semibold ${changeColor}`}>
              {isPositive ? '+' : ''}{index.change.toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${changeColor}`}>
              ({isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(index.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

