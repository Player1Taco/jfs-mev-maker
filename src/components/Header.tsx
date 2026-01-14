import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, Bell, Search, Fuel, TrendingUp } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { getGasPrice, getEthPrice } from '../services/etherscan';

const Header: React.FC = () => {
  const { address, balance, isConnecting, connect, disconnect } = useWalletStore();
  const [gasPrice, setGasPrice] = useState({ fast: '0', standard: '0', slow: '0' });
  const [ethPrice, setEthPrice] = useState('0');
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const gas = await getGasPrice();
      setGasPrice({
        fast: gas.FastGasPrice,
        standard: gas.ProposeGasPrice,
        slow: gas.SafeGasPrice,
      });

      const price = await getEthPrice();
      setEthPrice(parseFloat(price.ethusd).toFixed(2));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 right-0 left-64 h-20 glass-strong border-b border-primary/10 z-40 px-6"
    >
      <div className="h-full flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search transactions, addresses, blocks..."
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Gas Price */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border">
            <Fuel className="w-4 h-4 text-warning" />
            <span className="text-sm text-text-secondary">Gas:</span>
            <span className="text-sm font-mono text-white">{gasPrice.standard}</span>
            <span className="text-xs text-text-secondary">gwei</span>
          </div>

          {/* ETH Price */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-text-secondary">ETH:</span>
            <span className="text-sm font-mono text-white">${ethPrice}</span>
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 bg-surface rounded-xl border border-border hover:border-primary/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error" />
          </motion.button>

          {/* Wallet Connection */}
          <div className="relative">
            {address ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl hover:border-primary/50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-mono text-white">{formatAddress(address)}</p>
                  <p className="text-xs text-text-secondary">{parseFloat(balance).toFixed(4)} ETH</p>
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all btn-glow"
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </motion.button>
            )}

            {/* Wallet Dropdown */}
            {showWalletMenu && address && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-64 p-4 glass-strong rounded-xl border border-primary/20"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-surface rounded-lg">
                    <p className="text-xs text-text-secondary mb-1">Connected Address</p>
                    <p className="text-sm font-mono text-white break-all">{address}</p>
                  </div>
                  <div className="p-3 bg-surface rounded-lg">
                    <p className="text-xs text-text-secondary mb-1">Balance</p>
                    <p className="text-lg font-bold text-white">{parseFloat(balance).toFixed(4)} ETH</p>
                    <p className="text-sm text-text-secondary">
                      ≈ ${(parseFloat(balance) * parseFloat(ethPrice)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setShowWalletMenu(false);
                    }}
                    className="w-full py-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
