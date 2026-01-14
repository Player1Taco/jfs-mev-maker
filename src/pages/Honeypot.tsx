import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Bug,
  Zap,
  Target,
  AlertTriangle,
  Shield,
  Rocket,
  Settings,
} from 'lucide-react';
import { useMEVStore, HoneypotTrap, JFS_ADDRESSES } from '../store/mevStore';
import HoneypotCard from '../components/HoneypotCard';
import { useWalletStore } from '../store/walletStore';

const Honeypot: React.FC = () => {
  const { honeypots, addHoneypot, updateHoneypot } = useMEVStore();
  const { address } = useWalletStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrap, setNewTrap] = useState({
    name: '',
    type: 'sandwich-bait' as HoneypotTrap['type'],
    targetBot: JFS_ADDRESSES[0],
  });

  // Default honeypots for demo
  const defaultHoneypots: HoneypotTrap[] = [
    {
      id: '1',
      name: 'Sandwich Bait Alpha',
      status: 'active',
      type: 'sandwich-bait',
      deployedAt: Date.now() - 86400000,
      contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE71',
      triggerCount: 12,
      totalProfit: '2.45',
      targetBot: JFS_ADDRESSES[0],
    },
    {
      id: '2',
      name: 'Fake Liquidity Pool',
      status: 'active',
      type: 'fake-liquidity',
      deployedAt: Date.now() - 172800000,
      contractAddress: '0x8B3392483BA26D65E331dB86D4F430E9B3814E5e',
      triggerCount: 8,
      totalProfit: '1.87',
      targetBot: JFS_ADDRESSES[0],
    },
    {
      id: '3',
      name: 'Gas Trap Beta',
      status: 'triggered',
      type: 'gas-trap',
      deployedAt: Date.now() - 259200000,
      contractAddress: '0x1234567890AbCdEf1234567890AbCdEf12345678',
      triggerCount: 23,
      totalProfit: '4.12',
      targetBot: JFS_ADDRESSES[1],
    },
  ];

  const displayHoneypots = honeypots.length > 0 ? honeypots : defaultHoneypots;

  const handleCreateTrap = () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    const trap: HoneypotTrap = {
      id: `trap-${Date.now()}`,
      name: newTrap.name || `Trap ${displayHoneypots.length + 1}`,
      status: 'inactive',
      type: newTrap.type,
      deployedAt: Date.now(),
      contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      triggerCount: 0,
      totalProfit: '0',
      targetBot: newTrap.targetBot,
    };

    addHoneypot(trap);
    setShowCreateModal(false);
    setNewTrap({
      name: '',
      type: 'sandwich-bait',
      targetBot: JFS_ADDRESSES[0],
    });
  };

  const trapTypes = [
    {
      type: 'sandwich-bait',
      icon: Bug,
      name: 'Sandwich Bait',
      description: 'Creates attractive swap transactions that revert when sandwiched',
    },
    {
      type: 'fake-liquidity',
      icon: Zap,
      name: 'Fake Liquidity',
      description: 'Deploys pools with hidden revert conditions',
    },
    {
      type: 'gas-trap',
      icon: Target,
      name: 'Gas Trap',
      description: 'Wastes attacker gas with complex computations',
    },
    {
      type: 'revert-trap',
      icon: AlertTriangle,
      name: 'Revert Trap',
      description: 'Transactions that revert after MEV extraction attempt',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Honeypot Manager</h1>
          <p className="text-text-secondary">
            Deploy and manage honeypot traps to counter MEV bots
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all btn-glow"
        >
          <Plus className="w-5 h-5" />
          Deploy New Trap
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="p-6 rounded-2xl glass border border-success/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-success/20">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-text-secondary">Active Traps</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {displayHoneypots.filter((h) => h.status === 'active').length}
          </p>
        </div>
        <div className="p-6 rounded-2xl glass border border-warning/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-text-secondary">Triggered</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {displayHoneypots.reduce((sum, h) => sum + h.triggerCount, 0)}
          </p>
        </div>
        <div className="p-6 rounded-2xl glass border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-text-secondary">Total Profit</span>
          </div>
          <p className="text-3xl font-bold text-success">
            {displayHoneypots.reduce((sum, h) => sum + parseFloat(h.totalProfit), 0).toFixed(2)} ETH
          </p>
        </div>
        <div className="p-6 rounded-2xl glass border border-error/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-error/20">
              <Target className="w-5 h-5 text-error" />
            </div>
            <span className="text-sm text-text-secondary">JFS Trapped</span>
          </div>
          <p className="text-3xl font-bold text-error">
            {displayHoneypots.filter((h) => h.triggerCount > 0).length}
          </p>
        </div>
      </motion.div>

      {/* Trap Types Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Available Trap Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trapTypes.map((trap) => (
            <div
              key={trap.type}
              className="p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <trap.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-white">{trap.name}</span>
              </div>
              <p className="text-sm text-text-secondary">{trap.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Honeypot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayHoneypots.map((trap, index) => (
          <motion.div
            key={trap.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <HoneypotCard
              trap={trap}
              onActivate={() => updateHoneypot(trap.id, { status: 'active' })}
              onDeactivate={() => updateHoneypot(trap.id, { status: 'inactive' })}
            />
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg p-6 rounded-2xl glass-strong border border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/20">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Deploy New Honeypot</h2>
                <p className="text-sm text-text-secondary">Configure your trap settings</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Trap Name</label>
                <input
                  type="text"
                  value={newTrap.name}
                  onChange={(e) => setNewTrap({ ...newTrap, name: e.target.value })}
                  placeholder="Enter trap name..."
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Trap Type</label>
                <select
                  value={newTrap.type}
                  onChange={(e) =>
                    setNewTrap({ ...newTrap, type: e.target.value as HoneypotTrap['type'] })
                  }
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {trapTypes.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Target Bot</label>
                <select
                  value={newTrap.targetBot}
                  onChange={(e) => setNewTrap({ ...newTrap, targetBot: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {JFS_ADDRESSES.map((addr, i) => (
                    <option key={addr} value={addr}>
                      JFS Address {i + 1}: {addr.slice(0, 10)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-warning font-medium">Deployment Notice</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Deploying a honeypot requires ETH for gas. Make sure you understand the
                      risks involved in MEV counter-strategies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTrap}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white"
                >
                  Deploy Trap
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Honeypot;
