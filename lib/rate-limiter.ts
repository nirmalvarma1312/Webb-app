/**
 * Rate limiter to respect API plan limits
 * - 20 requests per minute
 * - 500 requests per month
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private minuteLimit: number;
  private monthLimit: number;
  private minuteRequests: Map<string, RateLimitEntry>;
  private monthRequests: Map<string, RateLimitEntry>;
  private lastRefresh: number;

  constructor(
    minuteLimit: number = 20,
    monthLimit: number = 500
  ) {
    this.minuteLimit = minuteLimit;
    this.monthLimit = monthLimit;
    this.minuteRequests = new Map();
    this.monthRequests = new Map();
    this.lastRefresh = Date.now();
  }

  /**
   * Check if a request can be made
   */
  canMakeRequest(key: string = 'default'): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    const now = Date.now();
    
    // Check minute limit
    const minuteEntry = this.minuteRequests.get(key);
    if (minuteEntry) {
      if (now < minuteEntry.resetAt) {
        if (minuteEntry.count >= this.minuteLimit) {
          return {
            allowed: false,
            reason: 'Minute rate limit exceeded',
            retryAfter: Math.ceil((minuteEntry.resetAt - now) / 1000),
          };
        }
      } else {
        // Reset expired entry
        this.minuteRequests.delete(key);
      }
    }

    // Check month limit
    const monthEntry = this.monthRequests.get(key);
    if (monthEntry) {
      if (now < monthEntry.resetAt) {
        if (monthEntry.count >= this.monthLimit) {
          return {
            allowed: false,
            reason: 'Monthly rate limit exceeded',
            retryAfter: Math.ceil((monthEntry.resetAt - now) / 1000),
          };
        }
      } else {
        // Reset expired entry
        this.monthRequests.delete(key);
      }
    }

    return { allowed: true };
  }

  /**
   * Record a request
   */
  recordRequest(key: string = 'default'): void {
    const now = Date.now();

    // Record minute request
    const minuteEntry = this.minuteRequests.get(key);
    if (minuteEntry && now < minuteEntry.resetAt) {
      minuteEntry.count++;
    } else {
      this.minuteRequests.set(key, {
        count: 1,
        resetAt: now + 60 * 1000, // 1 minute
      });
    }

    // Record month request
    const monthEntry = this.monthRequests.get(key);
    if (monthEntry && now < monthEntry.resetAt) {
      monthEntry.count++;
    } else {
      this.monthRequests.set(key, {
        count: 1,
        resetAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }
  }

  /**
   * Get current usage statistics
   */
  getUsage(key: string = 'default'): {
    minuteUsage: number;
    minuteLimit: number;
    monthUsage: number;
    monthLimit: number;
  } {
    const now = Date.now();
    
    const minuteEntry = this.minuteRequests.get(key);
    const minuteUsage = minuteEntry && now < minuteEntry.resetAt ? minuteEntry.count : 0;

    const monthEntry = this.monthRequests.get(key);
    const monthUsage = monthEntry && now < monthEntry.resetAt ? monthEntry.count : 0;

    return {
      minuteUsage,
      minuteLimit: this.minuteLimit,
      monthUsage,
      monthLimit: this.monthLimit,
    };
  }

  /**
   * Reset all limits (for testing)
   */
  reset(): void {
    this.minuteRequests.clear();
    this.monthRequests.clear();
  }
}

// Singleton instance
const minuteLimit = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '20', 10);
const monthLimit = parseInt(process.env.MAX_REQUESTS_PER_MONTH || '500', 10);
export const rateLimiter = new RateLimiter(minuteLimit, monthLimit);

