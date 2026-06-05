import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getCurrencySymbol, getMonthLabel } from '../../utils/helpers';
import { calculateSemesterBudget, getSemesterMonths } from '../../utils/studentUtils';
import SmartBudgetPlanner from './SmartBudgetPlanner';
import { GraduationCap } from 'lucide-react';

export default function BudgetManager() {
  const { budget, setMonthlyBudget, currentMonth, monthlyExpenses, budgetSpentPercent, currency, studentMode, transactions } = useApp();
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

  const semester = useMemo(() => getSemesterMonths(), []);
  const semesterData = useMemo(() =>
    calculateSemesterBudget(transactions, budget['semester'] || 0, semester, currentMonth),
    [transactions, budget, semester, currentMonth]
  );

  const [semesterBudgetAmt, setSemesterBudgetAmt] = useState('');
  const [showSemesterBudget, setShowSemesterBudget] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-base">💰</span>
          {studentMode ? 'Student Budget Planner' : 'Budget Management'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {studentMode ? 'Manage your semester and monthly student budget' : 'Set and monitor your monthly budgets'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="glass-card dark:glass-dark rounded-2xl p-6">
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

        <div className="glass-card dark:glass-dark rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Budget History</h3>
          {Object.keys(budget).length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No budgets set yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(budget)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, amt]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
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

      {studentMode && (
        <div className="glass-card dark:glass-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              Semester Budget ({semester.label})
            </h3>
            {budget['semester'] ? (
              <button
                onClick={() => { setShowSemesterBudget(true); setSemesterBudgetAmt(String(budget['semester'])); }}
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => setShowSemesterBudget(true)}
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Set Budget
              </button>
            )}
          </div>

          {budget['semester'] && !showSemesterBudget ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className="text-[10px] text-slate-400">Semester Budget</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white font-mono">{formatCurrency(currency, budget['semester'])}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className="text-[10px] text-slate-400">Spent So Far</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white font-mono">{formatCurrency(currency, semesterData.totalSpent)}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Remaining</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(currency, semesterData.remaining)}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">Predicted Total</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(currency, semesterData.predictedTotal)}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="text-slate-500">{Math.round(semesterData.percentUsed)}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${semesterData.percentUsed > 90 ? 'bg-red-500' : semesterData.percentUsed > 70 ? 'bg-amber-500' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(semesterData.percentUsed, 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (semesterBudgetAmt) { setMonthlyBudget('semester', parseFloat(semesterBudgetAmt)); setShowSemesterBudget(false); } }}>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {budget['semester'] ? 'Update your semester budget' : 'Set your total semester budget'}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{getCurrencySymbol(currency)}</span>
                <input
                  type="number" step="0.01" min="0" required
                  value={semesterBudgetAmt}
                  onChange={(e) => setSemesterBudgetAmt(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowSemesterBudget(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors">
                  {budget['semester'] ? 'Update' : 'Set'} Semester Budget
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <SmartBudgetPlanner />
    </motion.div>
  );
}
