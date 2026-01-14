import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { useMEVStore } from '../store/mevStore';

const Analytics: React.FC = () => {
  const { transactions, jfsStats } = useMEVStore();

  // Generate analytics data
  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    mev: Math.random() * 50 + 20,
    trapped: Math.random() * 10 + 2,
    attacks: Math.floor(Math.random() * 100 + 50),
  }));

  const mevTypeData = [
    { name: 'Sandwich', value: 45, color: '#ef4444' },
    { name: 'Frontrun', value: 25, color: '#f59e0b' },
    { name: 'Backrun', value: 15, color: '#f472b6' },
    { name: 'Arbitrage', value: 10, color: '#10b981' },
    { name: 'Liquidation', value: 5, color: '#9E7FFF' },
  ];

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    volume: Math.random() * 100 + 20,
    profit: Math.random() * 5 + 1,
  }));

  const topDexData = [
    { name: 'Uniswap V3', attacks: 450, profit: 125.5 },
    { name: 'Uniswap V2', attacks: 320, profit: 89.2 },
    { name: 'SushiSwap', attacks: 180, profit: 45.8 },
    { name: 'Curve', attacks: 120, profit: 32.1 },
    { name: '1inch', attacks: 80, profit: 18.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-text-secondary">
          Comprehensive MEV analysis and honeypot performance metrics
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Total MEV Tracked</p>
          <p className="text-2xl font-bold text-white">1,247.83 ETH</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl glass border border-success/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-success/20">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +8.3%
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Value Trapped</p>
          <p className="text-2xl font-bold text-success">8.44 ETH</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl glass border border-error/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-error/20">
              <BarChart3 className="w-5 h-5 text-error" />
            </div>
            <div className="flex items-center gap-1 text-error text-sm">
              <TrendingDown className="w-4 h-4" />
              -5.2%
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">JFS Success Rate</p>
          <p className="text-2xl font-bold text-white">94.7%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl glass border border-warning/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-warning/20">
              <PieChart className="w-5 h-5 text-warning" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +15.8%
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-1">Trap Efficiency</p>
          <p className="text-2xl font-bold text-white">78.3%</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly MEV Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Weekly MEV Activity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="mevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9E7FFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9E7FFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="trappedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#A3A3A3" fontSize={12} tickLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} />
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
                  fill="url(#mevGrad)"
                  name="MEV (ETH)"
                />
                <Area
                  type="monotone"
                  dataKey="trapped"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#trappedGrad)"
                  name="Trapped (ETH)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* MEV Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">MEV Type Distribution</h3>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <RechartsPie>
                <Pie
                  data={mevTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mevTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid rgba(158, 127, 255, 0.2)',
                    borderRadius: '12px',
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {mevTypeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">24h Volume Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis
                  dataKey="hour"
                  stroke="#A3A3A3"
                  fontSize={10}
                  tickLine={false}
                  interval={3}
                />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid rgba(158, 127, 255, 0.2)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="volume" fill="#9E7FFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top DEXs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl glass border border-primary/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Top Targeted DEXs</h3>
          <div className="space-y-4">
            {topDexData.map((dex, index) => (
              <div key={dex.name} className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-8">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{dex.name}</span>
                    <span className="text-sm text-success">{dex.profit} ETH</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dex.attacks / 450) * 100}%` }}
                      transition={{ duration: 1, delay: 0.1 * index }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                  </div>
                </div>
                <span className="text-xs text-text-secondary w-20 text-right">
                  {dex.attacks} attacks
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Victims Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Top JFS Victims (Last 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Total Loss
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Attacks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Avg Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {jfsStats.topVictims.map((victim, index) => (
                <tr key={victim.address} className="hover:bg-surface-light/50 transition-colors">
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-warning/20 text-warning'
                          : index === 1
                          ? 'bg-text-secondary/20 text-text-secondary'
                          : index === 2
                          ? 'bg-accent/20 text-accent'
                          : 'bg-surface text-text-secondary'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-white">
                      {victim.address.slice(0, 10)}...{victim.address.slice(-8)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-error font-medium">
                      ${victim.lossUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-text-secondary">
                      {Math.floor(Math.random() * 20 + 5)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-text-secondary">
                      ${(victim.lossUSD / (Math.random() * 20 + 5)).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
