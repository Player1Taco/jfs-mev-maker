import { useState, useEffect, useCallback } from 'react';
import { getGasPrice } from '../services/etherscan';
import { mempoolMonitor } from '../services/mempool';

interface GasPrices {
  slow: string;
  standard: string;
  fast: string;
  lastUpdate: number;
}

export function useGasPrice(refreshInterval = 15000) {
  const [gasPrices, setGasPrices] = useState<GasPrices>({
    slow: '20',
    standard: '25',
    fast: '30',
    lastUpdate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGasPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try Etherscan first
      const etherscanGas = await getGasPrice();
      
      if (etherscanGas.SafeGasPrice !== '0') {
        setGasPrices({
          slow: etherscanGas.SafeGasPrice,
          standard: etherscanGas.ProposeGasPrice,
          fast: etherscanGas.FastGasPrice,
          lastUpdate: Date.now(),
        });
      } else {
        // Fallback to mempool monitor
        const mempoolGas = await mempoolMonitor.getGasEstimate();
        setGasPrices({
          ...mempoolGas,
          lastUpdate: Date.now(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gas prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGasPrices();

    const interval = setInterval(fetchGasPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchGasPrices, refreshInterval]);

  return {
    gasPrices,
    isLoading,
    error,
    refresh: fetchGasPrices,
  };
}
