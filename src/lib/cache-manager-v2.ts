
// Advanced localStorage caching system with TTL and smart invalidation

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  key: string;
}

interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  version: string;
  storagePrefix: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  apiCalls: number;
  hitRate: string;
  cacheSize: string;
  storageFull: boolean;
}

export class AdvancedCacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    apiCalls: 0,
    hitRate: '0%',
    cacheSize: '0KB',
    storageFull: false
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 200,
      defaultTtl: config.defaultTtl || 5 * 60 * 1000, // 5 minutes
      version: config.version || '2.0.0',
      storagePrefix: config.storagePrefix || 'app_cache_v2_'
    };
    
    this.validateCacheVersion();
    this.setupStorageEventListener();
  }

  // Main cache interface with fallback chain
  async getData<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: { ttl?: number; forceRefresh?: boolean; skipAPI?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.config.defaultTtl, forceRefresh = false, skipAPI = false } = options;
    const cacheKey = this.getCacheKey(key);

    if (!forceRefresh) {
      // L1: Check memory cache
      const memoryResult = this.getFromMemoryCache<T>(cacheKey, ttl);
      if (memoryResult) {
        this.recordHit('memory');
        return memoryResult;
      }

      // L2: Check localStorage
      const localResult = this.getFromLocalStorage<T>(cacheKey, ttl);
      if (localResult) {
        // Promote to memory cache
        this.setMemoryCache(cacheKey, localResult, ttl);
        this.recordHit('localStorage');
        return localResult;
      }
    }

    if (skipAPI) {
      throw new Error('Cache miss and API call skipped');
    }

    // L3: Fetch from API
    this.recordMiss();
    const freshData = await fetcher();
    
    // Store in both caches
    this.setCache(cacheKey, freshData, ttl);
    
    return freshData;
  }

  // Optimistic updates for better UX
  setOptimistic<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = this.getCacheKey(key);
    this.setMemoryCache(cacheKey, data, ttl || this.config.defaultTtl);
  }

  // Batch operations
  async batchGet<T>(keys: string[], fetcher: (missingKeys: string[]) => Promise<Record<string, T>>): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const missingKeys: string[] = [];

    // Check cache for all keys
    for (const key of keys) {
      try {
        const cached = await this.getData(key, async () => {
          throw new Error('Skip API');
        }, { skipAPI: true });
        results[key] = cached;
      } catch {
        missingKeys.push(key);
      }
    }

    // Batch fetch missing data
    if (missingKeys.length > 0) {
      const freshData = await fetcher(missingKeys);
      Object.entries(freshData).forEach(([key, data]) => {
        results[key] = data;
        this.setCache(this.getCacheKey(key), data, this.config.defaultTtl);
      });
    }

    return results;
  }

  // Cache invalidation
  invalidateCache(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.memoryCache.delete(cacheKey);
    localStorage.removeItem(cacheKey);
  }

  invalidatePattern(pattern: string): void {
    // Invalidate memory cache
    for (const [key] of this.memoryCache) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.config.storagePrefix) && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Private methods
  private getCacheKey(key: string): string {
    return `${this.config.storagePrefix}v${this.config.version}:${key}`;
  }

  private getFromMemoryCache<T>(key: string, ttl: number): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (this.isExpired(entry, ttl)) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  private getFromLocalStorage<T>(key: string, ttl: number): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      if (entry.version !== this.config.version || this.isExpired(entry, ttl)) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      localStorage.removeItem(key);
      return null;
    }
  }

  private setMemoryCache<T>(key: string, data: T, ttl: number): void {
    // Evict if at max size
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldestMemoryEntry();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.config.version,
      key
    };

    this.memoryCache.set(key, entry);
  }

  private setLocalStorage<T>(key: string, data: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: this.config.version,
        key
      };

      const serialized = JSON.stringify(entry);
      
      // Check if we need compression for large objects
      if (serialized.length > 10000) {
        console.warn('Large cache entry detected:', key, serialized.length);
      }

      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // QuotaExceededError
        this.handleStorageFull();
        console.warn('localStorage full, cleaned up old entries');
      }
    }
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.setMemoryCache(key, data, ttl);
    this.setLocalStorage(key, data, ttl);
  }

  private isExpired(entry: CacheEntry, ttl: number): boolean {
    return Date.now() - entry.timestamp > ttl;
  }

  private evictOldestMemoryEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private handleStorageFull(): void {
    // Get all cache entries
    const entries: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.config.storagePrefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }

    // Remove oldest 30%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
    toRemove.forEach(entry => localStorage.removeItem(entry.key));

    // Temporarily reduce TTL
    this.config.defaultTtl = Math.max(this.config.defaultTtl * 0.7, 60000);
  }

  private validateCacheVersion(): void {
    const versionKey = `${this.config.storagePrefix}version`;
    const storedVersion = localStorage.getItem(versionKey);
    
    if (storedVersion !== this.config.version) {
      this.clearAllCache();
      localStorage.setItem(versionKey, this.config.version);
    }
  }

  private clearAllCache(): void {
    this.memoryCache.clear();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.config.storagePrefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  private setupStorageEventListener(): void {
    // Sync across tabs
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith(this.config.storagePrefix) && e.newValue) {
        try {
          const entry = JSON.parse(e.newValue);
          this.memoryCache.set(e.key, entry);
        } catch {
          // Ignore malformed entries
        }
      }
    });
  }

  // Analytics and monitoring
  private recordHit(source: 'memory' | 'localStorage'): void {
    this.stats.hits++;
    this.updateHitRate();
    console.log(`Cache hit from ${source}`, this.stats.hitRate);
  }

  private recordMiss(): void {
    this.stats.misses++;
    this.stats.apiCalls++;
    this.updateHitRate();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? `${(this.stats.hits / total * 100).toFixed(1)}%` : '0%';
  }

  getStats(): CacheStats {
    const cacheSize = this.calculateCacheSize();
    return {
      ...this.stats,
      cacheSize: `${(cacheSize / 1024).toFixed(1)}KB`,
      storageFull: this.isStorageNearFull()
    };
  }

  private calculateCacheSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.config.storagePrefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
    return totalSize;
  }

  private isStorageNearFull(): boolean {
    try {
      const testKey = 'storage_test';
      const testData = 'x'.repeat(1024);
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return false;
    } catch {
      return true;
    }
  }
}

// Create specialized cache instances
export const apiCache = new AdvancedCacheManager({
  maxSize: 200,
  defaultTtl: 15 * 60 * 1000, // 15 minutes for API data
  version: '2.0.0',
  storagePrefix: 'api_cache_'
});

export const userDataCache = new AdvancedCacheManager({
  maxSize: 50,
  defaultTtl: 5 * 60 * 1000, // 5 minutes for user data
  version: '2.0.0',
  storagePrefix: 'user_cache_'
});

export const listCache = new AdvancedCacheManager({
  maxSize: 100,
  defaultTtl: 2 * 60 * 1000, // 2 minutes for lists (more dynamic)
  version: '2.0.0',
  storagePrefix: 'list_cache_'
});
