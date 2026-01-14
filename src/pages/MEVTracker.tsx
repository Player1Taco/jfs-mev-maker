import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { useMEVStore, JFS_ADDRESSES } from '../store/mevStore';
import TransactionTable from '../components/TransactionTable';

const MEVTracker: React.FC = () => {
  const { transactions, isLoading, fetchMEVData } = useMEVStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showJFSOnly, setShowJFSOnly] = useState(false);

  useEffect(() => {
    fetchMEVData();
  }, [fetchMEVData]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.attacker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.victim.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || tx.type === filterType;

    const matchesJFS =
      !showJFSOnly ||
      JFS_ADDRESSES.some((addr) => addr.toLowerCase() === tx.attacker.toLowerCase());

    return matchesSearch && matchesType && matchesJFS;
  });

  const mevTypes = ['all', 'sandwich', 'frontrun', 'backrun', 'arbitrage', 'liquidation'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">MEV Tracker</h1>
          <p className="text-text-secondary">
            Real-time monitoring of MEV transactions on Ethereum Mainnet
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fetchMEVData()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-xl text-primary hover:bg-primary/30 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by hash, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-text-secondary" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors"
            >
              {mevTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* JFS Only Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowJFSOnly(!showJFSOnly)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showJFSOnly
                ? 'bg-error/20 border-error/30 text-error'
                : 'bg-surface border-border text-text-secondary hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            JFS Only
          </motion.button>

          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="p-4 rounded-xl glass border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Tracked</p>
              <p className="text-xl font-bold text-white">{transactions.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass border border-error/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-error/20">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Sandwich Attacks</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter((t) => t.type === 'sandwich').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass border border-warning/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Frontrun Attacks</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter((t) => t.type === 'frontrun').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass border border-success/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Arbitrage</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter((t) => t.type === 'arbitrage').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        title={`MEV Transactions (${filteredTransactions.length})`}
      />
    </div>
  );
};

export default MEVTracker;
