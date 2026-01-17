import { useState, useEffect, useCallback } from 'react';
import { mempoolMonitor, PendingTransaction } from '../services/mempool';

export function useMempool(maxTransactions = 50) {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startMonitoring = useCallback(async () => {
    try {
      setError(null);
      await mempoolMonitor.start();
      setIsMonitoring(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring');
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    mempoolMonitor.stop();
    setIsMonitoring(false);
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  useEffect(() => {
    const unsubscribe = mempoolMonitor.onTransaction((tx) => {
      setTransactions((prev) => {
        const newTxs = [tx, ...prev].slice(0, maxTransactions);
        return newTxs;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [maxTransactions]);

  useEffect(() => {
    return () => {
      mempoolMonitor.stop();
    };
  }, []);

  return {
    transactions,
    isMonitoring,
    error,
    startMonitoring,
    stopMonitoring,
    clearTransactions,
  };
}
