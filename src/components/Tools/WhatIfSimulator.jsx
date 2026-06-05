import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthYear } from '../../utils/helpers';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { Lightbulb, TrendingDown, PiggyBank, CalendarDays } from 'lucide-react';

export default function WhatIfSimulator() {
  const { transactions, totalIncome, totalExpenses, monthlyIncome, monthlyExpenses, currency, savingsGoals } = useApp();

  const [scenario, setScenario] = useState('reduce-category');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]?.name || 'Food');
  const [reduceAmount, setReduceAmount] = useState(1000);
  const [extraSavingsPct, setExtraSavingsPct] = useState(10);

  const currentMonth = getMonthYear(new Date().toISOString());
  const currentExpenses = useMemo(() =>
    transactions.filter((t) => t.type === 'Expense' && getMonthYear(t.date) === currentMonth)
      .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );
  const currentIncome = useMemo(() =>
    transactions.filter((t) => t.type === 'Income' && getMonthYear(t.date) === currentMonth)
      .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const catSpending = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === 'Expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return map;
  }, [transactions]);

  const result = useMemo(() => {
    const monthlyCatSpend = catSpending[selectedCategory] || 0;
    const actualReduce = scenario === 'reduce-category' ? reduceAmount : 0;
    const pctReduce = scenario === 'increase-savings' ? extraSavingsPct : 0;

    const newMonthlyExpenses = currentExpenses - actualReduce;
    const newSavingsRate = currentIncome > 0 ? ((currentIncome - newMonthlyExpenses) / currentIncome) * 100 : 0;

    const extraSavedMonthly = actualReduce + (currentIncome * pctReduce / 100);
    const projectedSavings6m = extraSavedMonthly * 6;
    const projectedSavings12m = extraSavedMonthly * 12;

    const goalImpact = savingsGoals.filter((g) => g.saved < g.target).map((g) => {
      const remaining = g.target - g.saved;
      const monthsNormal = Math.ceil(remaining / (monthlyIncome - currentExpenses || 1));
      const monthsWithChange = Math.ceil(remaining / ((monthlyIncome - currentExpenses + extraSavedMonthly) || 1));
      return { name: g.name, remaining, monthsNormal, monthsWithChange };
    });

    return {
      newMonthlyExpenses: Math.round(newMonthlyExpenses),
      monthlySavings: Math.round(currentIncome - newMonthlyExpenses),
      newSavingsRate: Math.round(newSavingsRate),
      extraSavedMonthly: Math.round(extraSavedMonthly),
      projectedSavings6m: Math.round(projectedSavings6m),
      projectedSavings12m: Math.round(projectedSavings12m),
      goalImpact,
    };
  }, [scenario, selectedCategory, reduceAmount, extraSavingsPct, currentExpenses, currentIncome, catSpending, savingsGoals]);

  const currentSavingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">What-If Simulator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Test how different spending decisions affect your finances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card dark:glass-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> Scenario
          </h3>

          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-lg">
              {[
                { value: 'reduce-category', label: 'Reduce Category', icon: '📉' },
                { value: 'increase-savings', label: 'Save More %', icon: '💰' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScenario(opt.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    scenario === opt.value
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            {scenario === 'reduce-category' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                          selectedCategory === cat.name
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary'
                        }`}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Current spend: {formatCurrency(currency, catSpending[selectedCategory] || 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Reduce by: {formatCurrency(currency, reduceAmount)}/month
                  </label>
                  <input
                    type="range"
                    min="100"
                    max={Math.max((catSpending[selectedCategory] || 10000) * 0.5, 100)}
                    step="100"
                    value={reduceAmount}
                    onChange={(e) => setReduceAmount(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{formatCurrency(currency, 100)}</span>
                    <span>{formatCurrency(currency, Math.max((catSpending[selectedCategory] || 10000) * 0.5, 100))}</span>
                  </div>
                </div>
              </>
            )}

            {scenario === 'increase-savings' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Increase savings by: {extraSavingsPct}% of income
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={extraSavingsPct}
                  onChange={(e) => setExtraSavingsPct(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1%</span>
                  <span>50%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  That's ~{formatCurrency(currency, Math.round(currentIncome * extraSavingsPct / 100))} extra per month
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card dark:glass-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" /> Financial Impact
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Current Savings Rate</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{currentSavingsRate.toFixed(0)}%</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">New Savings Rate</p>
                <p className="text-lg font-bold text-emerald-500">{result.newSavingsRate}%</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">New Monthly Expenses</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{formatCurrency(currency, result.newMonthlyExpenses)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Extra Saved/Month</p>
                <p className="text-lg font-bold text-emerald-500">{formatCurrency(currency, result.extraSavedMonthly)}</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 border border-amber-200 dark:border-amber-500/20">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">Projected Savings</p>
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 dark:text-amber-300">In 6 months:</span>
                <span className="font-bold text-amber-700 dark:text-amber-200">{formatCurrency(currency, result.projectedSavings6m)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 dark:text-amber-300">In 12 months:</span>
                <span className="font-bold text-amber-700 dark:text-amber-200">{formatCurrency(currency, result.projectedSavings12m)}</span>
              </div>
            </div>

            {result.goalImpact.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Impact on Savings Goals</p>
                {result.goalImpact.map((g) => (
                  <div key={g.name} className="flex items-center gap-2 text-xs mb-1.5">
                    <PiggyBank className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">{g.name}</span>
                    <span className="text-red-400 line-through">{g.monthsNormal}mo</span>
                    <span className="text-emerald-500 font-medium">{g.monthsWithChange}mo</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
