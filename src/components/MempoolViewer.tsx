import React from 'react';
import { useMempool } from '../hooks/useMempool';
import { Play, Pause, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function MempoolViewer() {
  const { 
    transactions, 
    isMonitoring, 
    error, 
    startMonitoring, 
    stopMonitoring, 
    clearTransactions 
  } = useMempool(30);

  const formatAddress = (address: string) => {
    if (!address) return 'Contract Creation';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (num === 0) return '0 ETH';
    if (num < 0.001) return '<0.001 ETH';
    return `${num.toFixed(4)} ETH`;
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <h3 className="font-semibold text-white">Mempool Monitor</h3>
          <span className="text-sm text-gray-400">
            {transactions.length} pending
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearTransactions}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Clear transactions"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${isMonitoring 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }
            `}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Transactions List */}
      <div className="max-h-[400px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isMonitoring ? (
              <p>Waiting for pending transactions...</p>
            ) : (
              <p>Click Start to monitor the mempool</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {transactions.map((tx, index) => (
              <div 
                key={tx.hash}
                className={`
                  p-3 hover:bg-gray-700/30 transition-colors
                  ${index === 0 ? 'bg-blue-500/5' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${parseFloat(tx.value) > 1 ? 'bg-green-400' : 'bg-gray-400'}
                    `} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-300">
                          {formatAddress(tx.from)}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="font-mono text-sm text-gray-300">
                          {formatAddress(tx.to)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatValue(tx.value)}</span>
                        <span>{tx.gasPrice} Gwei</span>
                        <span>Nonce: {tx.nonce}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </span>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MempoolViewer;
