import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getCurrencySymbol } from '../../utils/helpers';
import { ALL_CATEGORIES } from '../../utils/constants';

export default function SmartBudgetPlanner() {
  const { monthlyIncome, currency, budget, setMonthlyBudget, currentMonth } = useApp();
  const [income, setIncome] = useState(monthlyIncome || '');
  const [applied, setApplied] = useState(false);

  const incomeVal = parseFloat(income) || 0;
  const needs = incomeVal * 0.5;
  const wants = incomeVal * 0.3;
  const savings = incomeVal * 0.2;

  const categories = [
    { type: 'Needs (50%)', amount: needs, color: '#6366f1', items: ['Rent/Mortgage', 'Groceries', 'Bills', 'Healthcare', 'Transport'] },
    { type: 'Wants (30%)', amount: wants, color: '#f59e0b', items: ['Entertainment', 'Shopping', 'Dining Out', 'Travel', 'Hobbies'] },
    { type: 'Savings (20%)', amount: savings, color: '#10b981', items: ['Emergency Fund', 'Investments', 'Retirement', 'Savings Goals'] },
  ];

  const handleApplyBudget = () => {
    setMonthlyBudget(currentMonth, needs + wants);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Smart Budget Planner</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Follow the 50/30/20 rule to plan your budget</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Monthly Income</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{getCurrencySymbol(currency)}</span>
            <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)}
              placeholder={`Enter your monthly income`}
              className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <button onClick={handleApplyBudget} disabled={!incomeVal}
            className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50">
            {applied ? 'Applied ✓' : 'Apply Budget'}
          </button>
        </div>
      </div>

      {incomeVal > 0 && (
        <div className="space-y-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-500" style={{ width: '50%' }} />
            <div className="bg-amber-500" style={{ width: '30%' }} />
            <div className="bg-emerald-500" style={{ width: '20%' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.type} className="rounded-lg p-3 border" style={{ borderColor: `${cat.color}30`, backgroundColor: `${cat.color}08` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.type}</span>
                  <span className="text-sm font-bold" style={{ color: cat.color }}>{formatCurrency(currency, cat.amount)}</span>
                </div>
                <ul className="space-y-0.5">
                  {cat.items.map((item) => (
                    <li key={item} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
