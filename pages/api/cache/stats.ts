/**
 * API Route: GET /api/cache/stats
 * Returns cache statistics
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { ApiResponse, CacheStats } from '@/lib/types';

interface StatsResponse extends CacheStats {
  rateLimit: {
    minuteUsage: number;
    minuteLimit: number;
    monthUsage: number;
    monthLimit: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<StatsResponse>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const cacheStats = cache.getStats();
    const rateLimit = rateLimiter.getUsage();

    res.status(200).json({
      success: true,
      data: {
        ...cacheStats,
        rateLimit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error in /api/cache/stats:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

