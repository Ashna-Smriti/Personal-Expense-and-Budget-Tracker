import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_CATEGORIES, MONTHS } from '../../utils/constants';
import { formatCurrency, formatDate, getMonthYear, filterTransactions, getMonthLabel } from '../../utils/helpers';
import { exportCSV, exportPDF } from '../../utils/export';
import Filters from '../Filters/Filters';
import { getCurrentMonth } from '../../utils/helpers';
import { calculateFinancialHealth } from '../../utils/helpers';

export default function Reports() {
  const { transactions, totalIncome, totalExpenses, budget, savingsGoals, currency } = useApp();
  const [filters, setFilters] = useState({ month: '', category: '', startDate: '', endDate: '', search: '' });

  const filtered = useMemo(() => filterTransactions(transactions, {
    ...filters,
    month: filters.month || getCurrentMonth(),
  }), [transactions, filters]);

  const reportMonth = filters.month || getCurrentMonth();
  const currentBudget = budget[reportMonth] || 0;

  const monthIncome = filtered.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpenses = filtered.filter((t) => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);

  const categorySummary = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type === 'Expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ category: cat, amount: amt, percentage: monthExpenses > 0 ? (amt / monthExpenses) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, monthExpenses]);

  const totalSavingsProgress = useMemo(() => {
    const total = savingsGoals.reduce((s, g) => s + g.target, 0);
    const totalSaved = savingsGoals.reduce((s, g) => s + g.saved, 0);
    return total > 0 ? { total, saved: totalSaved, percent: (totalSaved / total) * 100 } : null;
  }, [savingsGoals]);

  const { score, label, color } = calculateFinancialHealth(monthIncome, monthExpenses, currentBudget);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Export</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monthly summaries and data export</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(filtered, currency)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => exportPDF(transactions, totalIncome, totalExpenses, currentBudget, currency)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-danger hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <Filters filters={filters} setFilters={setFilters} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Month Income</p>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(currency, monthIncome)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Month Expenses</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(currency, monthExpenses)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Health Score</p>
          <p className="text-2xl font-bold" style={{ color }}>{label}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Category Breakdown</h3>
          {categorySummary.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {categorySummary.map(({ category, amount, percentage }) => {
                const cat = ALL_CATEGORIES.find((c) => c.name === category);
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-300">{cat?.icon} {category}</span>
                      <span className="text-slate-500 dark:text-slate-400">{formatCurrency(currency, amount)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat?.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Savings Progress</h3>
          {totalSavingsProgress ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">{formatCurrency(currency, totalSavingsProgress.saved)} saved</span>
                <span className="text-slate-500 dark:text-slate-400">Target: {formatCurrency(currency, totalSavingsProgress.total)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(totalSavingsProgress.percent, 100)}%` }} />
              </div>
              <p className="text-sm font-medium text-primary">{totalSavingsProgress.percent.toFixed(1)}% of all goals achieved</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No savings goals set</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white">Transaction Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Category</th>
                <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Description</th>
                <th className="text-right p-3 font-medium text-slate-500 dark:text-slate-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500">No transactions found</td>
                </tr>
              ) : (
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 text-slate-600 dark:text-slate-300">{formatDate(t.date)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        t.type === 'Income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>{t.type}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{t.category || '-'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{t.description}</td>
                    <td className={`p-3 text-right font-medium ${t.type === 'Income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'Income' ? '+' : '-'}{formatCurrency(currency, t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
