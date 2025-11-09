/**
 * In-memory cache with TTL support
 * Stores API responses to minimize external API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 60) {
    this.store = new Map();
    this.defaultTTL = defaultTTLSeconds * 1000; // Convert to milliseconds
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with optional custom TTL
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const now = Date.now();
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    
    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.store.forEach((entry) => {
      if (now <= entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.store.size,
      validEntries,
      expiredEntries,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }
}

// Singleton instance
const cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);
export const cache = new Cache(cacheTTL);

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const cleaned = cache.cleanup();
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }, 5 * 60 * 1000);
}

