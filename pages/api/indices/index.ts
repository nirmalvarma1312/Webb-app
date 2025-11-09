/**
 * API Route: GET /api/indices
 * Returns list of all tracked indices
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllIndices } from '@/lib/api-service';
import { rateLimiter } from '@/lib/rate-limiter';
import { ApiResponse, IndexData } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<IndexData[]>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get rate limit info
    const rateLimit = rateLimiter.getUsage();

    // Fetch all indices
    const indices = await fetchAllIndices();

    res.status(200).json({
      success: true,
      data: indices,
      timestamp: new Date().toISOString(),
      rateLimit,
    });
  } catch (error) {
    console.error('[API] Error in /api/indices:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      rateLimit: rateLimiter.getUsage(),
    });
  }
}

