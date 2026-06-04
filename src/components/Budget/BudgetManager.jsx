import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getCurrencySymbol, getMonthLabel, getCurrentMonth } from '../../utils/helpers';
import SmartBudgetPlanner from './SmartBudgetPlanner';

export default function BudgetManager() {
  const { budget, setMonthlyBudget, currentMonth, monthlyExpenses, budgetSpentPercent, currency } = useApp();
  const [amount, setAmount] = useState('');
  const [editing, setEditing] = useState(false);

  const currentBudget = budget[currentMonth] || 0;
  const remaining = currentBudget - monthlyExpenses;
  const isDanger = budgetSpentPercent >= 100;
  const isWarning = budgetSpentPercent >= 80 && budgetSpentPercent < 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    setMonthlyBudget(currentMonth, parseFloat(amount));
    setAmount('');
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Budget Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set and monitor your monthly budgets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">{getMonthLabel(currentMonth)} Budget</h3>
            {currentBudget > 0 && (
              <button
                onClick={() => { setEditing(true); setAmount(String(currentBudget)); }}
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {currentBudget > 0 && !editing ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">Budget: <strong className="text-slate-800 dark:text-white">{formatCurrency(currency, currentBudget)}</strong></span>
              </div>
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDanger ? 'bg-red-500 progress-glow' : isWarning ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Spent: {formatCurrency(currency, monthlyExpenses)}</span>
                <span className={isDanger ? 'text-red-500 font-medium' : isWarning ? 'text-amber-500 font-medium' : 'text-emerald-500 font-medium'}>
                  {budgetSpentPercent.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 text-sm">
                <span className={`font-medium ${remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {remaining >= 0 ? `${formatCurrency(currency, remaining)} remaining` : `${formatCurrency(currency, Math.abs(remaining))} over budget`}
                </span>
              </div>
              {isDanger && (
                <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">⚠️ Budget exceeded! Consider reducing expenses.</p>
              )}
              {isWarning && !isDanger && (
                <p className="mt-3 text-sm text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">⚠️ You've used {budgetSpentPercent.toFixed(0)}% of your budget.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {editing ? 'Update your monthly budget' : 'Set a budget for this month'}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{getCurrencySymbol(currency)}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 mt-4">
                {editing && (
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setAmount(''); }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                  {editing ? 'Update Budget' : 'Set Budget'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Budget History</h3>
          {Object.keys(budget).length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No budgets set yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(budget)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, amt]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{getMonthLabel(month)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Budget set</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(currency, amt)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <SmartBudgetPlanner />
    </div>
  );
}
