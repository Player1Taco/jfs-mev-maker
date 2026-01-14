import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Zap, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { HoneypotTrap } from '../store/mevStore';

interface HoneypotCardProps {
  trap: HoneypotTrap;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

const statusConfig = {
  active: {
    color: 'success',
    icon: CheckCircle,
    label: 'Active',
  },
  triggered: {
    color: 'warning',
    icon: AlertTriangle,
    label: 'Triggered',
  },
  inactive: {
    color: 'error',
    icon: XCircle,
    label: 'Inactive',
  },
};

const typeIcons = {
  'sandwich-bait': Bug,
  'fake-liquidity': Zap,
  'gas-trap': Target,
  'revert-trap': AlertTriangle,
};

const HoneypotCard: React.FC<HoneypotCardProps> = ({ trap, onActivate, onDeactivate }) => {
  const status = statusConfig[trap.status];
  const TypeIcon = typeIcons[trap.type];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="relative p-6 rounded-2xl glass border border-primary/10 overflow-hidden card-hover"
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${status.color}/20 border border-${status.color}/30`}
        >
          <StatusIcon className={`w-4 h-4 text-${status.color}`} />
          <span className={`text-xs font-medium text-${status.color}`}>{status.label}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
          <TypeIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{trap.name}</h3>
          <p className="text-sm text-text-secondary capitalize">{trap.type.replace('-', ' ')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-surface">
          <p className="text-xs text-text-secondary mb-1">Trigger Count</p>
          <p className="text-xl font-bold text-white">{trap.triggerCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-surface">
          <p className="text-xs text-text-secondary mb-1">Total Profit</p>
          <p className="text-xl font-bold text-success">{trap.totalProfit} ETH</p>
        </div>
      </div>

      {/* Contract Address */}
      <div className="p-3 rounded-xl bg-surface mb-4">
        <p className="text-xs text-text-secondary mb-1">Contract Address</p>
        <p className="text-sm font-mono text-white truncate">{trap.contractAddress}</p>
      </div>

      {/* Target */}
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-4 h-4 text-error" />
        <span className="text-sm text-text-secondary">Target:</span>
        <span className="text-sm font-mono text-error">{trap.targetBot}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {trap.status === 'inactive' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onActivate}
            className="flex-1 py-3 bg-gradient-to-r from-success to-success/80 rounded-xl font-semibold text-white"
          >
            Activate Trap
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDeactivate}
            className="flex-1 py-3 bg-gradient-to-r from-error to-error/80 rounded-xl font-semibold text-white"
          >
            Deactivate
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default HoneypotCard;
