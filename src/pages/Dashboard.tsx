import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  DollarSign,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle,
  Shield,
  Crosshair,
} from 'lucide-react';
import { useMEVStore, JFS_ADDRESSES } from '../store/mevStore';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const { transactions, jfsStats, isLoading, fetchMEVData } = useMEVStore();

  useEffect(() => {
    fetchMEVData();
    const interval = setInterval(fetchMEVData, 30000);
    return () => clearInterval(interval);
  }, [fetchMEVData]);

  // Generate chart data
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    mev: Math.random() * 10 + 5,
    trapped: Math.random() * 2,
  }));

  const jfsTransactions = transactions.filter((tx) =>
    JFS_ADDRESSES.some((addr) => addr.toLowerCase() === tx.attacker.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(158, 127, 255, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        }}
      >
        <div className="absolute inset-0 hex-pattern opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-3 rounded-xl bg-error/20 border border-error/30">
                <Crosshair className="w-8 h-8 text-error" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">JFS MEV Tracker</h1>
                <p className="text-text-secondary">Monitoring jaredfromsubway.eth</p>
              </div>
            </motion.div>
            <p className="text-lg text-text-secondary max-w-xl">
              Real-time tracking and honeypot deployment system designed to counter MEV extraction
              by jaredfromsubway.eth and protect DeFi users.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-right"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-error/20 border border-error/30 rounded-xl mb-2">
              <AlertTriangle className="w-5 h-5 text-error" />
              <span className="text-error font-semibold">Target Active</span>
            </div>
            <p className="text-sm text-text-secondary">
              Last seen: {new Date().toLocaleTimeString()}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="JFS Total Extracted"
          value={`${jfsStats.totalExtracted} ETH`}
          change={-12.5}
          icon={DollarSign}
          color="error"
          subtitle="All-time MEV profit"
        />
        <StatCard
          title="24h JFS Activity"
          value={`${jfsStats.last24hProfit} ETH`}
          change={8.3}
          icon={Activity}
          color="warning"
          subtitle="Last 24 hours"
        />
        <StatCard
          title="Transactions Tracked"
          value={jfsStats.totalTransactions.toLocaleString()}
          change={15.2}
          icon={Target}
          color="primary"
          subtitle="JFS transactions"
        />
        <StatCard
          title="Honeypots Active"
          value="3"
          icon={Shield}
          color="success"
          subtitle="Traps deployed"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MEV Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">MEV Activity (24h)</h3>
              <p className="text-sm text-text-secondary">JFS extraction over time</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-error/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-error" />
              <span className="text-sm text-error font-medium">+23.5%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mevGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9E7FFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9E7FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} ETH`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid rgba(158, 127, 255, 0.2)',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mev"
                  stroke="#9E7FFF"
                  strokeWidth={2}
                  fill="url(#mevGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Trapped Value Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Honeypot Performance</h3>
              <p className="text-sm text-text-secondary">Value trapped from JFS</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/20 rounded-lg">
              <Zap className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Active</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="hour"
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} ETH`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="trapped"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* JFS Target Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl glass border border-error/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-error/20">
            <Target className="w-6 h-6 text-error" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Target: jaredfromsubway.eth</h3>
            <p className="text-sm text-text-secondary">Known MEV bot addresses</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JFS_ADDRESSES.map((addr, i) => (
            <div key={addr} className="p-4 rounded-xl bg-surface border border-error/10">
              <p className="text-xs text-text-secondary mb-1">Address {i + 1}</p>
              <p className="font-mono text-sm text-white break-all">{addr}</p>
              <a
                href={`https://etherscan.io/address/${addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                View on Etherscan →
              </a>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <TransactionTable
        transactions={jfsTransactions.slice(0, 10)}
        title="Recent JFS Transactions"
      />
    </div>
  );
};

export default Dashboard;
