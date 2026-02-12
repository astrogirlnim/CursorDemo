/**
 * Simple In-Memory Cache Utility
 * For caching frequently accessed data to reduce database queries
 * 
 * Use cases:
 * - Team membership checks (most common operation)
 * - User lookups
 * - Team details
 * 
 * Note: This is a simple implementation. For production with multiple
 * servers, consider Redis or similar distributed cache.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 60000) { // Default 60 seconds
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
    
    console.log('[Cache] Initialized with TTL:', defaultTTL, 'ms');
  }
  
  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log('[Cache] MISS:', key);
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      console.log('[Cache] EXPIRED:', key);
      this.cache.delete(key);
      return null;
    }
    
    console.log('[Cache] HIT:', key);
    return entry.data as T;
  }
  
  /**
   * Set cache value with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, { data, expiresAt });
    console.log('[Cache] SET:', key, `(expires in ${(ttl || this.defaultTTL) / 1000}s)`);
  }
  
  /**
   * Delete cached value
   */
  delete(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log('[Cache] DELETE:', key);
    }
  }
  
  /**
   * Delete all keys matching pattern
   */
  deletePattern(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`[Cache] DELETED ${count} keys matching pattern:`, pattern);
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache] CLEARED ${size} entries`);
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    let expired = 0;
    const now = Date.now();
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      }
    }
    
    return {
      total: this.cache.size,
      active: this.cache.size - expired,
      expired,
    };
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[Cache] Cleanup: removed ${cleaned} expired entries`);
    }
  }
  
  /**
   * Get or compute cached value
   * If key exists in cache, return it. Otherwise, compute it and cache.
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Compute value
    console.log('[Cache] Computing value for:', key);
    const value = await computeFn();
    
    // Store in cache
    this.set(key, value, ttl);
    
    return value;
  }
}

// Export singleton instance
export const cache = new SimpleCache(60000); // 60 second default TTL

// Cache key generators for consistency
export const CacheKeys = {
  teamMember: (teamId: number, userId: number) => `team:${teamId}:member:${userId}`,
  teamOwner: (teamId: number, userId: number) => `team:${teamId}:owner:${userId}`,
  team: (teamId: number) => `team:${teamId}`,
  user: (userId: number) => `user:${userId}`,
  teamMembers: (teamId: number) => `team:${teamId}:members`,
  userTeams: (userId: number) => `user:${userId}:teams`,
};

// Cache invalidation helpers
export const CacheInvalidation = {
  /**
   * Invalidate all team-related caches
   */
  team: (teamId: number) => {
    cache.deletePattern(`team:${teamId}`);
  },
  
  /**
   * Invalidate user-related caches
   */
  user: (userId: number) => {
    cache.deletePattern(`user:${userId}`);
  },
  
  /**
   * Invalidate when team membership changes
   */
  teamMembership: (teamId: number, userId: number) => {
    cache.delete(CacheKeys.teamMember(teamId, userId));
    cache.delete(CacheKeys.teamMembers(teamId));
    cache.delete(CacheKeys.userTeams(userId));
  },
};
