import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCard({ title, value, icon, color, subtitle, trend, delay = 0 }) {
  const trendVal = trend;
  const isPositive = trendVal >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5 card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
          style={{ backgroundColor: `${color}18` }}
        >
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
        {trend !== null && trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trendVal)}%
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-0.5 font-mono tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{title}</p>
      {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
