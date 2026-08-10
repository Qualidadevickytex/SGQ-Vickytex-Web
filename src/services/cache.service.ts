/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Intelligent in-memory Cache Service
 * Enhances response times and reduces redundant API requests for static arrays and records.
 */
class CacheServiceClass {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtl = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Write data into cache with optional custom TTL
   */
  set<T>(key: string, value: T, ttlMs: number = this.defaultTtl): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Retrieves data from cache. Automatically deletes expired entries.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * High-level helper combining cache fetch, miss, execution, and fill.
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number = this.defaultTtl): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const freshValue = await fetchFn();
    this.set(key, freshValue, ttlMs);
    return freshValue;
  }

  /**
   * Invalidates a specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheServiceClass();
export default cacheService;
