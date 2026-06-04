import { getMonthYear } from './helpers';

export function predictExpenses(transactions, budget, currentMonth) {
  const expenses = transactions.filter((t) => t.type === 'Expense');
  const income = transactions.filter((t) => t.type === 'Income');

  const currentExpenses = expenses.filter((t) => getMonthYear(t.date) === currentMonth);
  const currentIncome = income.filter((t) => getMonthYear(t.date) === currentMonth);
  const currentExpenseTotal = currentExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const currentIncomeTotal = currentIncome.reduce((s, t) => s + Number(t.amount), 0);
  const currentBudgetVal = budget[currentMonth] || 0;

  const daysInMonth = new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]), 0).getDate();
  const dayOfMonth = Math.min(new Date().getDate(), daysInMonth);
  const daysLeft = daysInMonth - dayOfMonth;

  const dailyAvg = dayOfMonth > 0 ? currentExpenseTotal / dayOfMonth : 0;
  const predictedEndOfMonth = currentExpenseTotal + dailyAvg * Math.max(daysLeft, 0);

  const monthKeys = [...new Set(expenses.map((t) => getMonthYear(t.date)))].sort();
  const monthlyTotals = monthKeys.map((m) => ({
    month: m,
    total: expenses.filter((t) => getMonthYear(t.date) === m).reduce((s, t) => s + Number(t.amount), 0),
  }));

  let trend = 'stable';
  if (monthlyTotals.length >= 3) {
    const last3 = monthlyTotals.slice(-3).map((m) => m.total);
    if (last3[2] > last3[1] && last3[1] > last3[0]) trend = 'increasing';
    else if (last3[2] < last3[1] && last3[1] < last3[0]) trend = 'decreasing';
  }

  const budgetRisk = currentBudgetVal > 0 ? (predictedEndOfMonth / currentBudgetVal) * 100 : 0;
  let riskLevel = 'low';
  let riskColor = '#10b981';
  if (budgetRisk > 100) { riskLevel = 'high'; riskColor = '#ef4444'; }
  else if (budgetRisk > 85) { riskLevel = 'medium'; riskColor = '#f59e0b'; }

  const predictedSavings = currentIncomeTotal - predictedEndOfMonth;

  return {
    predictedEndOfMonth: Math.round(predictedEndOfMonth),
    dailyAverage: Math.round(dailyAvg),
    daysLeft: Math.max(daysLeft, 0),
    trend,
    budgetRisk: Math.round(budgetRisk),
    riskLevel,
    riskColor,
    predictedSavings: Math.round(predictedSavings),
    monthlyTrend: monthlyTotals,
  };
}
