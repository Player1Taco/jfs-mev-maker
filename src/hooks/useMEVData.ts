import { useEffect, useCallback } from 'react';
import { useMEVStore } from '../store/mevStore';

export function useMEVData(autoRefresh = true, refreshInterval = 30000) {
  const { 
    transactions, 
    jfsStats, 
    marketData,
    isLoading, 
    error,
    lastUpdate,
    fetchMEVData,
    fetchMarketData,
  } = useMEVStore();

  const refresh = useCallback(async () => {
    await Promise.all([fetchMEVData(), fetchMarketData()]);
  }, [fetchMEVData, fetchMarketData]);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    transactions,
    jfsStats,
    marketData,
    isLoading,
    error,
    lastUpdate,
    refresh,
  };
}
