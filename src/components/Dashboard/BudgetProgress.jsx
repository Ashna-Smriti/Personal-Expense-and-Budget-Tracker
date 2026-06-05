import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function BudgetProgress() {
  const { monthlyExpenses, currentBudget, budgetSpentPercent, currency } = useApp();

  if (!currentBudget) return null;

  const remaining = currentBudget - monthlyExpenses;
  const isWarning = budgetSpentPercent >= 80 && budgetSpentPercent < 100;
  const isDanger = budgetSpentPercent >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="glass-card dark:glass-dark rounded-2xl p-4 sm:p-5 h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Monthly Budget</h3>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
          isDanger
            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            : isWarning
              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        }`}>
          {isDanger ? 'Exceeded' : isWarning ? 'Limit Near' : 'On Track'}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400 dark:text-slate-500">Spent</span>
          <span className="text-slate-400 dark:text-slate-500">Budget</span>
        </div>
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-slate-800 dark:text-white">{formatCurrency(currency, monthlyExpenses)}</span>
          <span className="text-slate-500 dark:text-slate-400">{formatCurrency(currency, currentBudget)}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className={`font-medium ${
            isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-primary'
          }`}>
            {budgetSpentPercent.toFixed(1)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {remaining >= 0 ? `${formatCurrency(currency, remaining)} left` : `${formatCurrency(currency, Math.abs(remaining))} over`}
          </span>
        </div>
      </div>
      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
        isDanger
          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
          : isWarning
            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      }`}>
        {isDanger ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> : isWarning ? <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
        <span>
          {isDanger
            ? `Exceeded by ${formatCurrency(currency, Math.abs(remaining))}`
            : isWarning
              ? `${budgetSpentPercent.toFixed(0)}% of budget used`
              : `${formatCurrency(currency, remaining)} remaining`
          }
        </span>
      </div>
    </motion.div>
  );
}
