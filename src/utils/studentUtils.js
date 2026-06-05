import { getMonthYear } from './helpers';

export function calculateStudentHealthScore(transactions, budget, currentMonth) {
  const monthlyExpenses = transactions.filter(t => t.type === 'Expense' && getMonthYear(t.date) === currentMonth)
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthlyIncome = transactions.filter(t => t.type === 'Income' && getMonthYear(t.date) === currentMonth)
    .reduce((s, t) => s + Number(t.amount), 0);
  const currentBudget = budget[currentMonth] || 0;

  let score = 50;

  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  if (savingsRate >= 30) score += 20;
  else if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 10;
  else if (savingsRate >= 0) score += 5;
  else score -= 10;

  const educationExpenses = transactions.filter(t =>
    t.type === 'Expense' && getMonthYear(t.date) === currentMonth &&
    ['Tuition Fee', 'Books', 'Online Courses', 'Stationery', 'Education'].includes(t.category)
  ).reduce((s, t) => s + Number(t.amount), 0);
  const educationRatio = monthlyExpenses > 0 ? (educationExpenses / monthlyExpenses) * 100 : 0;
  if (educationRatio >= 40) score += 15;
  else if (educationRatio >= 25) score += 10;
  else if (educationRatio >= 15) score += 5;

  const entertainmentExpenses = transactions.filter(t =>
    t.type === 'Expense' && getMonthYear(t.date) === currentMonth &&
    ['Entertainment', 'Shopping', 'Food'].includes(t.category)
  ).reduce((s, t) => s + Number(t.amount), 0);
  const entertainmentRatio = monthlyExpenses > 0 ? (entertainmentExpenses / monthlyExpenses) * 100 : 0;
  if (entertainmentRatio <= 15) score += 15;
  else if (entertainmentRatio <= 25) score += 10;
  else if (entertainmentRatio <= 35) score += 5;
  else score -= 5;

  if (currentBudget > 0) {
    const budgetRatio = monthlyExpenses / currentBudget;
    if (budgetRatio <= 0.8) score += 15;
    else if (budgetRatio <= 1) score += 5;
    else score -= 10;
  } else {
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  let label = 'Needs Improvement';
  let color = '#ef4444';
  if (score >= 80) { label = 'Excellent Student'; color = '#10b981'; }
  else if (score >= 60) { label = 'Good Student'; color = '#6366f1'; }
  else if (score >= 40) { label = 'Fair Student'; color = '#f59e0b'; }

  return { score, label, color, savings, educationExpenses, entertainmentExpenses, savingsRate, educationRatio };
}

export function generateStudentInsights(transactions, budget, currentMonth, currency = 'INR') {
  const insights = [];
  const monthlyExpenses = transactions.filter(t => t.type === 'Expense' && getMonthYear(t.date) === currentMonth);
  const monthlyIncome = transactions.filter(t => t.type === 'Income' && getMonthYear(t.date) === currentMonth);
  const totalExpenses = monthlyExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = monthlyIncome.reduce((s, t) => s + Number(t.amount), 0);
  const currentBudget = budget[currentMonth] || 0;

  const symbol = currency === 'INR' ? '₹' : '$';

  const booksExpenses = monthlyExpenses.filter(t => t.category === 'Books')
    .reduce((s, t) => s + Number(t.amount), 0);
  if (booksExpenses > 0) {
    insights.push({ icon: '📖', title: 'Book Spending', message: `You spent ${symbol}${booksExpenses.toLocaleString()} on books this month.`, type: 'info' });
  }

  const educationExpenses = monthlyExpenses.filter(t => ['Tuition Fee', 'Books', 'Online Courses', 'Stationery', 'Education'].includes(t.category))
    .reduce((s, t) => s + Number(t.amount), 0);
  if (totalExpenses > 0) {
    const eduPercent = Math.round((educationExpenses / totalExpenses) * 100);
    insights.push({ icon: '📚', title: 'Education vs Total', message: `Education expenses are ${eduPercent}% of total spending.`, type: eduPercent >= 25 ? 'success' : 'warning' });
  }

  if (currentBudget > 0) {
    if (totalExpenses <= currentBudget) {
      const remaining = currentBudget - totalExpenses;
      insights.push({ icon: '✅', title: 'Within Budget', message: `You are within your student budget with ${symbol}${remaining.toLocaleString()} remaining.`, type: 'success' });
    } else {
      const over = totalExpenses - currentBudget;
      insights.push({ icon: '⚠️', title: 'Over Budget', message: `You exceeded your student budget by ${symbol}${over.toLocaleString()}.`, type: 'danger' });
    }
  }

  const pocketMoney = monthlyIncome.filter(t => t.category === 'Pocket Money')
    .reduce((s, t) => s + Number(t.amount), 0);
  if (pocketMoney > 0) {
    insights.push({ icon: '💵', title: 'Pocket Money', message: `You received ${symbol}${pocketMoney.toLocaleString()} as pocket money this month.`, type: 'info' });
  }

  const entertainmentExpenses = monthlyExpenses.filter(t => ['Entertainment', 'Food'].includes(t.category))
    .reduce((s, t) => s + Number(t.amount), 0);
  if (entertainmentExpenses > educationExpenses && educationExpenses > 0) {
    insights.push({ icon: '🎯', title: 'Spending Priority', message: 'You spend more on entertainment than education. Consider rebalancing.', type: 'warning' });
  }

  const savings = totalIncome - totalExpenses;
  if (savings > 0) {
    insights.push({ icon: '💰', title: 'Monthly Savings', message: `You saved ${symbol}${savings.toLocaleString()} this month. Keep it up!`, type: 'success' });
  }

  return insights;
}

export function calculateSemesterBudget(transactions, semesterBudget, semesterMonths, currentMonth) {
  const semesterStart = new Date(semesterMonths.start);
  const semesterEnd = new Date(semesterMonths.end);
  const totalSpent = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'Expense' && d >= semesterStart && d <= semesterEnd;
  }).reduce((s, t) => s + Number(t.amount), 0);

  const remaining = Math.max(0, semesterBudget - totalSpent);
  const percentUsed = semesterBudget > 0 ? (totalSpent / semesterBudget) * 100 : 0;

  const monthsElapsed = Math.max(1, (new Date(currentMonth) - semesterStart) / (30 * 86400000));
  const monthlyAvg = totalSpent / monthsElapsed;
  const monthsLeft = Math.max(0, (semesterEnd - new Date()) / (30 * 86400000));
  const predictedTotal = totalSpent + monthlyAvg * monthsLeft;
  const predictedRemaining = Math.max(0, semesterBudget - predictedTotal);

  return { totalSpent, remaining, percentUsed, monthlyAvg, predictedTotal, predictedRemaining };
}

export function getSemesterMonths() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 1 && month <= 5) {
    return {
      label: 'Jan-Jun',
      start: new Date(year, 0, 1).toISOString(),
      end: new Date(year, 5, 30).toISOString(),
    };
  }
  if (month >= 6 && month <= 11) {
    return {
      label: 'Jul-Dec',
      start: new Date(year, 6, 1).toISOString(),
      end: new Date(year, 11, 31).toISOString(),
    };
  }
  return {
    label: 'Jan-Jun',
    start: new Date(year, 0, 1).toISOString(),
    end: new Date(year, 5, 30).toISOString(),
  };
}
