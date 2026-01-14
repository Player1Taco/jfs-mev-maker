import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  subtitle?: string;
}

const colorClasses = {
  primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
  success: 'from-success/20 to-success/5 border-success/30 text-success',
  warning: 'from-warning/20 to-warning/5 border-warning/30 text-warning',
  error: 'from-error/20 to-error/5 border-error/30 text-error',
  accent: 'from-accent/20 to-accent/5 border-accent/30 text-accent',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl overflow-hidden card-hover`}
    >
      {/* Background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-${color}/10 blur-3xl`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-${color}/20`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].split(' ').pop()}`} />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                change >= 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
              }`}
            >
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <p className="text-sm text-text-secondary mb-1">{title}</p>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
