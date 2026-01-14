import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { MEVTransaction, JFS_ADDRESSES } from '../store/mevStore';

interface TransactionTableProps {
  transactions: MEVTransaction[];
  title?: string;
}

const typeColors = {
  sandwich: 'bg-error/20 text-error border-error/30',
  frontrun: 'bg-warning/20 text-warning border-warning/30',
  backrun: 'bg-accent/20 text-accent border-accent/30',
  arbitrage: 'bg-success/20 text-success border-success/30',
  liquidation: 'bg-primary/20 text-primary border-primary/30',
};

const statusIcons = {
  confirmed: CheckCircle,
  pending: Clock,
  failed: AlertTriangle,
};

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, title }) => {
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const isJFS = (address: string) =>
    JFS_ADDRESSES.some((addr) => addr.toLowerCase() === address.toLowerCase());

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-primary/10 overflow-hidden"
    >
      {title && (
        <div className="px-6 py-4 border-b border-primary/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Attacker
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                DEX
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {transactions.map((tx, index) => {
              const StatusIcon = statusIcons[tx.status];
              return (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-surface-light/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium border ${typeColors[tx.type]}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white">
                        {formatAddress(tx.hash)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tx.hash)}
                        className="p-1 hover:bg-surface rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-text-secondary" />
                      </button>
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-surface rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-text-secondary" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm ${
                          isJFS(tx.attacker) ? 'text-error font-bold' : 'text-white'
                        }`}
                      >
                        {isJFS(tx.attacker) ? '🎯 JFS' : formatAddress(tx.attacker)}
                      </span>
                      {isJFS(tx.attacker) && (
                        <span className="px-2 py-0.5 bg-error/20 text-error text-xs rounded-full">
                          Target
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono text-sm text-success font-medium">
                        +{tx.profit} ETH
                      </p>
                      <p className="text-xs text-text-secondary">
                        ≈ ${tx.profitUSD.toFixed(2)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{tx.dex}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {formatTime(tx.timestamp)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`w-4 h-4 ${
                          tx.status === 'confirmed'
                            ? 'text-success'
                            : tx.status === 'pending'
                            ? 'text-warning'
                            : 'text-error'
                        }`}
                      />
                      <span className="text-sm text-text-secondary capitalize">
                        {tx.status}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TransactionTable;
