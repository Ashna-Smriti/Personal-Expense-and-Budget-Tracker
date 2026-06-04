import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

export default function BudgetProgress() {
  const { monthlyExpenses, currentBudget, budgetSpentPercent, currency } = useApp();

  if (!currentBudget) return null;

  const remaining = currentBudget - monthlyExpenses;
  const isWarning = budgetSpentPercent >= 80 && budgetSpentPercent < 100;
  const isDanger = budgetSpentPercent >= 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 dark:text-white">Monthly Budget</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isDanger ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
          isWarning ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
          'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
        }`}>
          {isDanger ? 'Exceeded!' : isWarning ? 'Limit Near' : 'On Track'}
        </span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-500 dark:text-slate-400">Spent: {formatCurrency(currency, monthlyExpenses)}</span>
          <span className="text-slate-500 dark:text-slate-400">Budget: {formatCurrency(currency, currentBudget)}</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isDanger ? 'bg-red-500 progress-glow' : isWarning ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className={isDanger ? 'text-red-500 font-medium' : isWarning ? 'text-amber-500 font-medium' : 'text-primary font-medium'}>
            {budgetSpentPercent.toFixed(1)}% spent
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {remaining >= 0 ? `${formatCurrency(currency, remaining)} left` : `${formatCurrency(currency, Math.abs(remaining))} over`}
          </span>
        </div>
      </div>
      {isDanger && (
        <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          ⚠️ You have exceeded your monthly budget by {formatCurrency(currency, Math.abs(remaining))}!
        </p>
      )}
      {isWarning && !isDanger && (
        <p className="text-xs text-amber-500 mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
          ⚠️ You have used {budgetSpentPercent.toFixed(0)}% of your monthly budget
        </p>
      )}
    </div>
  );
}
