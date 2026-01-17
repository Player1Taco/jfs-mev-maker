import React, { useEffect, useState } from 'react';
import { useMEVData } from '../hooks/useMEVData';
import { MEVTransaction } from '../store/mevStore';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS: Record<string, string> = {
  sandwich: 'bg-red-500/20 text-red-400 border-red-500/30',
  frontrun: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  backrun: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  arbitrage: 'bg-green-500/20 text-green-400 border-green-500/30',
  liquidation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  bundle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  sandwich: '🥪',
  frontrun: '⚡',
  backrun: '🔙',
  arbitrage: '🔄',
  liquidation: '💧',
  bundle: '📦',
};

interface LiveMEVFeedProps {
  maxItems?: number;
  showHeader?: boolean;
}

export function LiveMEVFeed({ maxItems = 10, showHeader = true }: LiveMEVFeedProps) {
  const { transactions, isLoading, error, refresh, lastUpdate } = useMEVData(true, 15000);
  const [newTxIds, setNewTxIds] = useState<Set<string>>(new Set());

  // Track new transactions for animation
  useEffect(() => {
    if (transactions.length > 0) {
      const latestIds = new Set(transactions.slice(0, 3).map(tx => tx.id));
      setNewTxIds(latestIds);
      
      const timer = setTimeout(() => {
        setNewTxIds(new Set());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const formatAddress = (address: string) => {
    if (!address || address === '0x...') return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatProfit = (profit: string, profitUSD: number) => {
    const ethValue = parseFloat(profit);
    if (ethValue < 0.001) {
      return `$${profitUSD.toFixed(2)}`;
    }
    return `${ethValue.toFixed(4)} ETH`;
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400 text-sm">Error loading MEV data: {error}</p>
        <button 
          onClick={refresh}
          className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <span className="text-sm text-gray-400">
              {isLoading ? 'Updating...' : 'Live Feed'}
            </span>
          </div>
          {lastUpdate > 0 && (
            <span className="text-xs text-gray-500">
              Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {transactions.slice(0, maxItems).map((tx) => (
          <TransactionCard 
            key={tx.id} 
            tx={tx} 
            isNew={newTxIds.has(tx.id)}
            formatAddress={formatAddress}
            formatProfit={formatProfit}
          />
        ))}

        {transactions.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>No MEV transactions found</p>
            <button 
              onClick={refresh}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Refresh
            </button>
          </div>
        )}

        {isLoading && transactions.length === 0 && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-gray-700 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TransactionCardProps {
  tx: MEVTransaction;
  isNew: boolean;
  formatAddress: (address: string) => string;
  formatProfit: (profit: string, profitUSD: number) => string;
}

function TransactionCard({ tx, isNew, formatAddress, formatProfit }: TransactionCardProps) {
  return (
    <div 
      className={`
        bg-gray-800/50 border border-gray-700/50 rounded-lg p-3
        transition-all duration-300
        ${isNew ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : ''}
        hover:bg-gray-800/70 hover:border-gray-600/50
      `}
    >
      <div className="flex items-center gap-3">
        {/* Type Icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center text-lg
          ${TYPE_COLORS[tx.type] || 'bg-gray-500/20 text-gray-400'}
          border
        `}>
          {TYPE_ICONS[tx.type] || '📄'}
        </div>

        {/* Transaction Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-medium uppercase
              ${TYPE_COLORS[tx.type] || 'bg-gray-500/20 text-gray-400'}
            `}>
              {tx.type}
            </span>
            <span className="text-xs text-gray-500">{tx.dex}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span className="font-mono">{formatAddress(tx.attacker)}</span>
            <span>→</span>
            <span className="font-mono">{formatAddress(tx.victim)}</span>
          </div>
        </div>

        {/* Profit */}
        <div className="text-right">
          <div className="text-green-400 font-semibold">
            +{formatProfit(tx.profit, tx.profitUSD)}
          </div>
          <div className="text-xs text-gray-500">
            Block #{tx.blockNumber.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center justify-between">
        <a 
          href={`https://etherscan.io/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-blue-400 hover:text-blue-300 truncate max-w-[200px]"
        >
          {tx.hash}
        </a>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export default LiveMEVFeed;
