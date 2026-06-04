import { getMonthYear } from './helpers';

export function calculateHealthScore(transactions, budget, currentMonth) {
  const expenses = transactions.filter((t) => t.type === 'Expense');
  const income = transactions.filter((t) => t.type === 'Income');

  const currentExpenses = expenses.filter((t) => getMonthYear(t.date) === currentMonth);
  const currentIncome = income.filter((t) => getMonthYear(t.date) === currentMonth);
  const monthlyExpenseTotal = currentExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const monthlyIncomeTotal = currentIncome.reduce((s, t) => s + Number(t.amount), 0);
  const currentBudgetVal = budget[currentMonth] || 0;

  let score = 0;
  const breakdown = [];
  const suggestions = [];

  const savingsRate = monthlyIncomeTotal > 0 ? ((monthlyIncomeTotal - monthlyExpenseTotal) / monthlyIncomeTotal) * 100 : 0;
  if (savingsRate >= 30) { score += 25; breakdown.push({ label: 'Savings Rate', score: 25, max: 25, detail: `${Math.round(savingsRate)}%` }); }
  else if (savingsRate >= 20) { score += 20; breakdown.push({ label: 'Savings Rate', score: 20, max: 25, detail: `${Math.round(savingsRate)}%` }); }
  else if (savingsRate >= 10) { score += 12; breakdown.push({ label: 'Savings Rate', score: 12, max: 25, detail: `${Math.round(savingsRate)}%` }); }
  else { score += 5; breakdown.push({ label: 'Savings Rate', score: 5, max: 25, detail: `${Math.round(savingsRate)}%` }); }
  if (savingsRate < 10) suggestions.push('Try to save at least 20% of your income each month.');

  if (currentBudgetVal > 0) {
    const spentPercent = (monthlyExpenseTotal / currentBudgetVal) * 100;
    if (spentPercent <= 70) { score += 25; breakdown.push({ label: 'Budget Adherence', score: 25, max: 25, detail: `${Math.round(spentPercent)}%` }); }
    else if (spentPercent <= 90) { score += 18; breakdown.push({ label: 'Budget Adherence', score: 18, max: 25, detail: `${Math.round(spentPercent)}%` }); }
    else if (spentPercent <= 100) { score += 10; breakdown.push({ label: 'Budget Adherence', score: 10, max: 25, detail: `${Math.round(spentPercent)}%` }); }
    else { score += 5; breakdown.push({ label: 'Budget Adherence', score: 5, max: 25, detail: `${Math.round(spentPercent)}%` }); }
    if (spentPercent > 100) suggestions.push('Your budget has been exceeded. Consider increasing your budget or reducing expenses.');
    else if (spentPercent > 80) suggestions.push('You are close to your budget limit. Watch your spending for the rest of the month.');
  } else {
    score += 10; breakdown.push({ label: 'Budget Adherence', score: 10, max: 25, detail: 'No budget' });
    suggestions.push('Set a monthly budget to better track your spending.');
  }

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExp = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const incomeStability = totalIncome > 0 ? Math.min(income.length / Math.max(Math.ceil(income.length / 3), 1), 1) * 25 : 0;
  score += Math.round(incomeStability);
  breakdown.push({ label: 'Income Stability', score: Math.round(incomeStability), max: 25, detail: `${income.length} income entries` });
  if (income.length === 0) suggestions.push('Start tracking your income to get a complete financial picture.');

  const catCount = Object.keys(expenses.reduce((m, t) => ({ ...m, [t.category]: true }), {})).length;
  const distScore = Math.min(catCount * 3, 15);
  score += distScore;
  breakdown.push({ label: 'Expense Distribution', score: distScore, max: 15, detail: `${catCount} categories` });
  if (catCount <= 2 && totalExp > 0) suggestions.push('Your expenses are concentrated in few categories. Consider diversifying your spending.');

  if (totalIncome > 0) {
    const debtRatio = totalExp / totalIncome;
    const debtScore = debtRatio <= 0.5 ? 10 : debtRatio <= 0.75 ? 7 : debtRatio <= 1 ? 4 : 1;
    score += debtScore;
    breakdown.push({ label: 'Expense-to-Income Ratio', score: debtScore, max: 10, detail: `${Math.round(debtRatio * 100)}%` });
    if (debtRatio > 0.8) suggestions.push('Your expenses are very high relative to income. Look for ways to reduce spending.');
  } else {
    breakdown.push({ label: 'Expense-to-Income Ratio', score: 0, max: 10, detail: 'No income' });
  }

  score = Math.min(Math.max(score, 0), 100);

  let label = 'Poor', color = '#ef4444';
  if (score >= 80) { label = 'Excellent'; color = '#10b981'; }
  else if (score >= 60) { label = 'Good'; color = '#6366f1'; }
  else if (score >= 40) { label = 'Fair'; color = '#f59e0b'; }

  return { score, label, color, breakdown, suggestions };
}
