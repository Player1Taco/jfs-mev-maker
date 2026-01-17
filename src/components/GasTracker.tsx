import React from 'react';
import { useGasPrice } from '../hooks/useGasPrice';
import { Fuel, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GasTrackerProps {
  compact?: boolean;
}

export function GasTracker({ compact = false }: GasTrackerProps) {
  const { gasPrices, isLoading, error, refresh } = useGasPrice(15000);

  const getGasLevel = (price: string) => {
    const p = parseFloat(price);
    if (p < 20) return { level: 'low', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (p < 50) return { level: 'medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'high', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const standardLevel = getGasLevel(gasPrices.standard);

  if (compact) {
    return (
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${standardLevel.bg} cursor-pointer`}
        onClick={refresh}
        title="Click to refresh"
      >
        <Fuel className={`w-4 h-4 ${standardLevel.color}`} />
        <span className={`text-sm font-medium ${standardLevel.color}`}>
          {isLoading ? '...' : `${gasPrices.standard} Gwei`}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400 text-sm">Failed to load gas prices</p>
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
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Gas Tracker</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs ${standardLevel.color}`}>
          {standardLevel.level === 'low' && <TrendingDown className="w-3 h-3" />}
          {standardLevel.level === 'medium' && <Minus className="w-3 h-3" />}
          {standardLevel.level === 'high' && <TrendingUp className="w-3 h-3" />}
          <span className="capitalize">{standardLevel.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <GasCard 
          label="Slow" 
          price={gasPrices.slow} 
          time="~5 min"
          isLoading={isLoading}
        />
        <GasCard 
          label="Standard" 
          price={gasPrices.standard} 
          time="~1 min"
          isLoading={isLoading}
          highlighted
        />
        <GasCard 
          label="Fast" 
          price={gasPrices.fast} 
          time="~15 sec"
          isLoading={isLoading}
        />
      </div>

      {gasPrices.lastUpdate > 0 && (
        <div className="mt-3 text-center">
          <button 
            onClick={refresh}
            className="text-xs text-gray-500 hover:text-gray-400"
          >
            Last updated: {new Date(gasPrices.lastUpdate).toLocaleTimeString()}
          </button>
        </div>
      )}
    </div>
  );
}

interface GasCardProps {
  label: string;
  price: string;
  time: string;
  isLoading: boolean;
  highlighted?: boolean;
}

function GasCard({ label, price, time, isLoading, highlighted }: GasCardProps) {
  const level = getGasLevel(price);

  return (
    <div className={`
      rounded-lg p-3 text-center
      ${highlighted 
        ? 'bg-blue-500/20 border border-blue-500/30' 
        : 'bg-gray-700/30 border border-gray-700/50'
      }
    `}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${isLoading ? 'animate-pulse' : ''} ${level.color}`}>
        {isLoading ? '...' : price}
      </div>
      <div className="text-xs text-gray-500">Gwei</div>
      <div className="text-xs text-gray-500 mt-1">{time}</div>
    </div>
  );
}

function getGasLevel(price: string) {
  const p = parseFloat(price);
  if (p < 20) return { level: 'low', color: 'text-green-400' };
  if (p < 50) return { level: 'medium', color: 'text-yellow-400' };
  return { level: 'high', color: 'text-red-400' };
}

export default GasTracker;
