
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdvancedCacheManager } from '@/lib/cache-manager-v2';

interface UseCachedDataOptions {
  ttl?: number;
  forceRefresh?: boolean;
  enabled?: boolean;
}

interface UseCachedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<T | null>;
  setOptimistic: (data: T) => void;
}

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheManager: AdvancedCacheManager,
  options: UseCachedDataOptions = {}
): UseCachedDataReturn<T> {
  const { ttl, forceRefresh = false, enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async (force = false) => {
    if (!enabled) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await cacheManager.getData(
        key, 
        fetcher, 
        { ttl, forceRefresh: force }
      );
      
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Cache data loading error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, cacheManager, ttl, enabled]);

  const refresh = useCallback(async () => {
    return loadData(true);
  }, [loadData]);

  const setOptimistic = useCallback((optimisticData: T) => {
    setData(optimisticData);
    cacheManager.setOptimistic(key, optimisticData, ttl);
  }, [key, cacheManager, ttl]);

  useEffect(() => {
    loadData(forceRefresh);
  }, [loadData, forceRefresh]);

  return { data, loading, error, refresh, setOptimistic };
}

// Specialized hooks for different data types
export function useCachedLists(userId: string) {
  const { listCache } = useMemo(() => import('@/lib/cache-manager-v2'), []);
  
  return useCachedData(
    `user-lists:${userId}`,
    () => import('@/lib/lists-service').then(({ listsService }) => 
      listsService.getLists(userId)
    ),
    listCache,
    { ttl: 2 * 60 * 1000 } // 2 minutes
  );
}

export function useCachedListItems(listId: string) {
  const { listCache } = useMemo(() => import('@/lib/cache-manager-v2'), []);
  
  return useCachedData(
    `list-items:${listId}`,
    () => import('@/lib/lists-service').then(({ listsService }) => 
      listsService.getListItems(listId)
    ),
    listCache,
    { ttl: 1 * 60 * 1000 } // 1 minute for more dynamic data
  );
}

export function useCachedMediaItems(userId: string) {
  const { userDataCache } = useMemo(() => import('@/lib/cache-manager-v2'), []);
  
  return useCachedData(
    `user-media:${userId}`,
    () => import('@/lib/supabase-store').then(({ supabaseStore }) => 
      supabaseStore.getAll(userId)
    ),
    userDataCache,
    { ttl: 5 * 60 * 1000 } // 5 minutes
  );
}

export function useCachedApiSearch(query: string, category: string) {
  const { apiCache } = useMemo(() => import('@/lib/cache-manager-v2'), []);
  
  return useCachedData(
    `api-search:${category}:${query}`,
    () => import('@/lib/api').then(({ mediaApi }) => 
      mediaApi.search(query, category as any)
    ),
    apiCache,
    { 
      ttl: 15 * 60 * 1000, // 15 minutes for API results
      enabled: query.length >= 3 // Only search if query is long enough
    }
  );
}
