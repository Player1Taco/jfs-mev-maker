import React, { useEffect } from 'react';
import { useMEVStore } from '../store/mevStore';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Target } from 'lucide-react';

export function MarketStats() {
  const { jfsStats, marketData, fetchMEVData, fetchMarketData, isLoading } = useMEVStore();

  useEffect(() => {
    fetchMEVData();
    fetchMarketData();
  }, [fetchMEVData, fetchMarketData]);

  const stats = [
    {
      label: 'ETH Price',
      value: `$${marketData.ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: marketData.ethChange24h,
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Total MEV Extracted',
      value: `${jfsStats.totalExtracted} ETH`,
      subValue: `$${(parseFloat(jfsStats.totalExtracted) * marketData.ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Zap,
      color: 'purple',
    },
    {
      label: 'MEV Transactions',
      value: jfsStats.totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'green',
    },
    {
      label: 'Avg Profit/TX',
      value: `${jfsStats.averageProfit} ETH`,
      subValue: `$${(parseFloat(jfsStats.averageProfit) * marketData.ethPrice).toFixed(2)}`,
      icon: Target,
      color: 'orange',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}

function StatCard({ label, value, subValue, change, icon: Icon, color, isLoading }: StatCardProps) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`
      ${colors.bg} border ${colors.border} rounded-xl p-4
      transition-all duration-300 hover:scale-[1.02]
    `}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
      </div>

      <div className={`text-2xl font-bold text-white ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? '...' : value}
      </div>

      <div className="flex items-center justify-between mt-2">
        {subValue && (
          <span className="text-sm text-gray-500">{subValue}</span>
        )}
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketStats;
