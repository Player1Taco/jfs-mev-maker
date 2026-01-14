import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Zap,
  Globe,
  Key,
  AlertTriangle,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { JFS_ADDRESSES } from '../store/mevStore';

const Settings: React.FC = () => {
  const { address } = useWalletStore();
  const [settings, setSettings] = useState({
    notifications: {
      mevAlerts: true,
      honeypotTriggers: true,
      jfsActivity: true,
      emailAlerts: false,
    },
    monitoring: {
      autoRefresh: true,
      refreshInterval: 30,
      trackAllMEV: false,
      jfsOnlyMode: true,
    },
    honeypot: {
      autoActivate: false,
      maxGasPrice: 100,
      minProfitThreshold: 0.1,
      targetAddresses: JFS_ADDRESSES,
    },
    api: {
      etherscanKey: '',
      alchemyKey: '',
      flashbotsKey: '',
    },
  });

  const [newTargetAddress, setNewTargetAddress] = useState('');

  const handleSave = () => {
    localStorage.setItem('jfs-mev-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const addTargetAddress = () => {
    if (newTargetAddress && newTargetAddress.startsWith('0x') && newTargetAddress.length === 42) {
      setSettings({
        ...settings,
        honeypot: {
          ...settings.honeypot,
          targetAddresses: [...settings.honeypot.targetAddresses, newTargetAddress],
        },
      });
      setNewTargetAddress('');
    }
  };

  const removeTargetAddress = (address: string) => {
    setSettings({
      ...settings,
      honeypot: {
        ...settings.honeypot,
        targetAddresses: settings.honeypot.targetAddresses.filter((a) => a !== address),
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-text-secondary">Configure your MEV tracker and honeypot settings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </motion.button>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/20">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-surface rounded-xl">
              <div>
                <p className="text-white font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-text-secondary">
                  {key === 'mevAlerts' && 'Get notified when MEV activity is detected'}
                  {key === 'honeypotTriggers' && 'Alert when a honeypot trap is triggered'}
                  {key === 'jfsActivity' && 'Track jaredfromsubway.eth activity'}
                  {key === 'emailAlerts' && 'Receive email notifications'}
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: !value },
                  })
                }
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  value ? 'bg-primary' : 'bg-surface-light'
                }`}
              >
                <motion.div
                  animate={{ x: value ? 28 : 4 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-success/20">
            <RefreshCw className="w-5 h-5 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-white">Monitoring</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
            <div>
              <p className="text-white font-medium">Auto Refresh</p>
              <p className="text-sm text-text-secondary">Automatically refresh MEV data</p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  monitoring: { ...settings.monitoring, autoRefresh: !settings.monitoring.autoRefresh },
                })
              }
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.monitoring.autoRefresh ? 'bg-primary' : 'bg-surface-light'
              }`}
            >
              <motion.div
                animate={{ x: settings.monitoring.autoRefresh ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
              />
            </button>
          </div>

          <div className="p-4 bg-surface rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">Refresh Interval</p>
              <span className="text-primary font-mono">{settings.monitoring.refreshInterval}s</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              value={settings.monitoring.refreshInterval}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  monitoring: { ...settings.monitoring, refreshInterval: parseInt(e.target.value) },
                })
              }
              className="w-full h-2 bg-surface-light rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
            <div>
              <p className="text-white font-medium">JFS Only Mode</p>
              <p className="text-sm text-text-secondary">Only track jaredfromsubway.eth transactions</p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  monitoring: { ...settings.monitoring, jfsOnlyMode: !settings.monitoring.jfsOnlyMode },
                })
              }
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.monitoring.jfsOnlyMode ? 'bg-error' : 'bg-surface-light'
              }`}
            >
              <motion.div
                animate={{ x: settings.monitoring.jfsOnlyMode ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Honeypot Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-warning/20">
            <Shield className="w-5 h-5 text-warning" />
          </div>
          <h2 className="text-lg font-semibold text-white">Honeypot Configuration</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-surface rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">Max Gas Price (Gwei)</p>
              <span className="text-primary font-mono">{settings.honeypot.maxGasPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              value={settings.honeypot.maxGasPrice}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  honeypot: { ...settings.honeypot, maxGasPrice: parseInt(e.target.value) },
                })
              }
              className="w-full h-2 bg-surface-light rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="p-4 bg-surface rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium">Min Profit Threshold (ETH)</p>
              <span className="text-primary font-mono">{settings.honeypot.minProfitThreshold}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={settings.honeypot.minProfitThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  honeypot: { ...settings.honeypot, minProfitThreshold: parseFloat(e.target.value) },
                })
              }
              className="w-full h-2 bg-surface-light rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Target Addresses */}
          <div className="p-4 bg-surface rounded-xl">
            <p className="text-white font-medium mb-3">Target Bot Addresses</p>
            <div className="space-y-2 mb-4">
              {settings.honeypot.targetAddresses.map((addr) => (
                <div
                  key={addr}
                  className="flex items-center justify-between p-3 bg-surface-light rounded-lg"
                >
                  <span className="font-mono text-sm text-white truncate flex-1">{addr}</span>
                  <button
                    onClick={() => removeTargetAddress(addr)}
                    className="ml-2 px-3 py-1 text-xs text-error hover:bg-error/20 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTargetAddress}
                onChange={(e) => setNewTargetAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-4 py-2 bg-surface-light border border-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={addTargetAddress}
                className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl glass border border-primary/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/20">
            <Key className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-white">API Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Etherscan API Key</label>
            <input
              type="password"
              value={settings.api.etherscanKey}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, etherscanKey: e.target.value },
                })
              }
              placeholder="Enter your Etherscan API key"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Alchemy API Key</label>
            <input
              type="password"
              value={settings.api.alchemyKey}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, alchemyKey: e.target.value },
                })
              }
              placeholder="Enter your Alchemy API key"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-warning font-medium">API Keys Required</p>
                <p className="text-xs text-text-secondary mt-1">
                  For real-time data, you'll need API keys from Etherscan and Alchemy. Free tiers
                  are available for both services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connected Wallet */}
      {address && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl glass border border-success/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/20">
              <Globe className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-white">Connected Wallet</h2>
          </div>
          <div className="p-4 bg-surface rounded-xl">
            <p className="text-sm text-text-secondary mb-1">Address</p>
            <p className="font-mono text-white break-all">{address}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;
