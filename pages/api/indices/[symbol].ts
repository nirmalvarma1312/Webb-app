/**
 * API Route: GET /api/indices/[symbol]
 * Returns detailed data for a specific index including 30-day history
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchIndexDetail } from '@/lib/api-service';
import { rateLimiter } from '@/lib/rate-limiter';
import { ApiResponse, IndexDetail } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IndexDetail>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const { symbol } = req.query;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Symbol parameter is required',
    });
  }

  try {
    // Get rate limit info
    const rateLimit = rateLimiter.getUsage();

    // Fetch index detail
    const indexDetail = await fetchIndexDetail(symbol.toUpperCase());

    if (!indexDetail) {
      return res.status(404).json({
        success: false,
        error: 'Index not found',
        rateLimit,
      });
    }

    res.status(200).json({
      success: true,
      data: indexDetail,
      timestamp: new Date().toISOString(),
      rateLimit,
    });
  } catch (error) {
    console.error(`[API] Error in /api/indices/${symbol}:`, error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      rateLimit: rateLimiter.getUsage(),
    });
  }
}

