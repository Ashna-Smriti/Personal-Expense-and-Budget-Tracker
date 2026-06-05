import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const typeConfig = {
  danger: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: AlertTriangle },
  warning: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: TrendingUp },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
  info: { bg: 'bg-primary/5', text: 'text-primary', icon: Lightbulb },
};

export default function AIInsightsWidget({ compact = false }) {
  const { aiInsights } = useApp();

  if (!aiInsights || aiInsights.length === 0) return null;

  const displayed = compact ? aiInsights.slice(0, 3) : aiInsights;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">AI</div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Insights</h3>
      </div>
      <div className="space-y-2">
        {displayed.map((insight, idx) => {
          const config = typeConfig[insight.type] || typeConfig.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl ${config.bg}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.text}`} />
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${config.text}`}>{insight.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{insight.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {compact && aiInsights.length > 3 && (
        <p className="text-xs text-primary font-medium mt-3">+{aiInsights.length - 3} more insights</p>
      )}
    </motion.div>
  );
}
