import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_CATEGORIES } from '../../utils/constants';
import { formatCurrency, getMonthYear, getCurrentMonth, getMonthLabel } from '../../utils/helpers';
import AIInsightsWidget from '../Dashboard/AIInsightsWidget';
import HealthScoreCard from './HealthScoreCard';
import PredictionsCard from './PredictionsCard';

export default function Insights() {
  const { transactions, currentBudget, monthlyIncome, monthlyExpenses, currentMonth, currency, moodAnalysis } = useApp();

  const insights = useMemo(() => {
    const result = [];
    const expenses = transactions.filter((t) => t.type === 'Expense');
    const income = transactions.filter((t) => t.type === 'Income');

    const catMap = {};
    expenses.forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });
    const sortedCats = Object.entries(catMap).sort(([, a], [, b]) => b - a);
    if (sortedCats.length > 0) {
      const [topCat, topAmt] = sortedCats[0];
      const catInfo = ALL_CATEGORIES.find((c) => c.name === topCat);
      result.push({ icon: catInfo?.icon || '📌', title: 'Highest Spending Category', value: `${topCat} - ${formatCurrency(currency, topAmt)}`, description: 'Your highest spending category across all time', color: catInfo?.color || '#64748b' });
    }

    const currentIncome = income.filter((t) => getMonthYear(t.date) === currentMonth).reduce((s, t) => s + Number(t.amount), 0);
    const currentExpenses = expenses.filter((t) => getMonthYear(t.date) === currentMonth).reduce((s, t) => s + Number(t.amount), 0);
    const savings = currentIncome - currentExpenses;
    result.push({
      icon: savings >= 0 ? '💰' : '⚠️', title: 'Monthly Savings',
      value: savings >= 0 ? formatCurrency(currency, savings) : `-${formatCurrency(currency, Math.abs(savings))}`,
      description: savings >= 0 ? `You saved ${formatCurrency(currency, savings)} this month (${currentIncome > 0 ? ((savings / currentIncome) * 100).toFixed(1) : 0}% of income)` : `You spent ${formatCurrency(currency, Math.abs(savings))} more than you earned this month`,
      color: savings >= 0 ? '#10b981' : '#ef4444',
    });

    const currentMonthExpenses = expenses.filter((t) => getMonthYear(t.date) === currentMonth);
    const daysInMonth = new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]), 0).getDate();
    const daysSoFar = Math.min(new Date().getDate(), daysInMonth);
    const avgDaily = currentMonthExpenses.length > 0 ? currentMonthExpenses.reduce((s, t) => s + Number(t.amount), 0) / daysSoFar : 0;
    result.push({ icon: '📊', title: 'Average Daily Spend', value: formatCurrency(currency, avgDaily), description: `Based on ${daysSoFar} days of data this month`, color: '#6366f1' });

    if (currentBudget > 0) {
      const spentPercent = (currentExpenses / currentBudget) * 100;
      if (spentPercent > 100) {
        result.push({ icon: '🚨', title: 'Budget Alert', value: `${spentPercent.toFixed(0)}% of budget spent`, description: `You've exceeded your ${getMonthLabel(currentMonth)} budget by ${formatCurrency(currency, currentExpenses - currentBudget)}!`, color: '#ef4444' });
      } else if (spentPercent > 80) {
        result.push({ icon: '⚠️', title: 'Budget Warning', value: `${spentPercent.toFixed(0)}% of budget used`, description: `You've used ${spentPercent.toFixed(0)}% of your ${getMonthLabel(currentMonth)} budget. Only ${formatCurrency(currency, currentBudget - currentExpenses)} remaining.`, color: '#f59e0b' });
      }
    }

    const monthlyTotals = {};
    expenses.forEach((t) => { const key = getMonthYear(t.date); monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(t.amount); });
    const monthKeys = Object.keys(monthlyTotals).sort();
    if (monthKeys.length >= 2) {
      const lastMonth = monthKeys[monthKeys.length - 2];
      const lastMonthTotal = monthlyTotals[lastMonth] || 0;
      if (lastMonthTotal > 0) {
        const change = ((currentExpenses - lastMonthTotal) / lastMonthTotal) * 100;
        if (Math.abs(change) > 30) {
          result.push({
            icon: change > 0 ? '📈' : '📉', title: change > 0 ? 'Spending Spike' : 'Spending Drop',
            value: `${change > 0 ? '+' : ''}${change.toFixed(0)}% vs last month`,
            description: change > 0 ? `Your spending increased by ${change.toFixed(0)}% compared to ${getMonthLabel(lastMonth)}. Review your expenses.` : `Great job! Your spending decreased by ${Math.abs(change).toFixed(0)}% compared to ${getMonthLabel(lastMonth)}.`,
            color: change > 0 ? '#ef4444' : '#10b981',
          });
        }
      }
    }

    if (sortedCats.length > 1) {
      const [lowCat, lowAmt] = sortedCats[sortedCats.length - 1];
      const lowCatInfo = ALL_CATEGORIES.find((c) => c.name === lowCat);
      result.push({ icon: lowCatInfo?.icon || '📌', title: 'Lowest Spending Category', value: `${lowCat} - ${formatCurrency(currency, lowAmt)}`, description: 'Your lowest spending category across all time', color: lowCatInfo?.color || '#10b981' });
    }

    if (monthKeys.length > 0) {
      const avgMonthly = monthKeys.reduce((s, m) => s + monthlyTotals[m], 0) / monthKeys.length;
      result.push({ icon: '📅', title: 'Average Monthly Spending', value: formatCurrency(currency, avgMonthly), description: `Across ${monthKeys.length} month(s) of data`, color: '#8b5cf6' });
    }

    if (expenses.length > 0) {
      const maxTxn = expenses.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max), expenses[0]);
      result.push({ icon: '💎', title: 'Most Expensive Transaction', value: formatCurrency(currency, maxTxn.amount), description: `${maxTxn.description} (${maxTxn.category}) on ${new Date(maxTxn.date).toLocaleDateString()}`, color: '#f59e0b' });
    }

    result.push({ icon: '📋', title: 'Total Transactions', value: `${transactions.length}`, description: `${income.length} income, ${expenses.length} expense transactions`, color: '#6366f1' });

    const totalInc = income.reduce((s, t) => s + Number(t.amount), 0);
    const totalExp = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const balance = totalInc - totalExp;
    result.push({ icon: '🏦', title: 'Overall Balance', value: formatCurrency(currency, balance), description: balance >= 0 ? "You're in the green overall" : 'Overall expenses exceed income', color: balance >= 0 ? '#10b981' : '#ef4444' });

    return result;
  }, [transactions, currentBudget, currentMonth, monthlyIncome, monthlyExpenses, currency]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Insights</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart analysis and AI-powered financial guidance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIInsightsWidget />
        </div>
        <div className="lg:col-span-1">
          <HealthScoreCard />
        </div>
      </div>

      <PredictionsCard />

      {moodAnalysis && moodAnalysis.analysis.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Mood-Based Spending</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {moodAnalysis.analysis.map((item) => (
              <div key={item.mood} className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-2xl block mb-1">{item.icon}</span>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{item.count}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          {moodAnalysis.insights.length > 0 && (
            <div className="space-y-2">
              {moodAnalysis.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                  <span>{insight.icon}</span>
                  <span>{insight.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {insights.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-slate-400 dark:text-slate-500">Add some transactions to see insights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm card-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: `${insight.color}15` }}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{insight.title}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">{insight.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
