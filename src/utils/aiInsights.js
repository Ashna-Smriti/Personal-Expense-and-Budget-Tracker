import { getMonthYear } from './helpers';
import { CURRENCIES } from './constants';

function fmt(currencyCode, amount) {
  const c = CURRENCIES.find((x) => x.code === currencyCode);
  const sym = c?.symbol || '$';
  return `${sym}${Number(amount).toLocaleString(c?.locale === 'en-IN' ? 'en-IN' : 'en-US')}`;
}

export function generateAIInsights(transactions, budget, currentMonth, goals = [], currency = 'INR') {
  const insights = [];
  const expenses = transactions.filter((t) => t.type === 'Expense');
  const income = transactions.filter((t) => t.type === 'Income');

  const currentExpenses = expenses.filter((t) => getMonthYear(t.date) === currentMonth);
  const currentIncome = income.filter((t) => getMonthYear(t.date) === currentMonth);
  const monthlyExpenseTotal = currentExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const monthlyIncomeTotal = currentIncome.reduce((s, t) => s + Number(t.amount), 0);
  const currentBudgetVal = budget[currentMonth] || 0;

  const catMap = {};
  currentExpenses.forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });

  const monthKeys = [...new Set(expenses.map((t) => getMonthYear(t.date)))].sort();
  const prevMonth = monthKeys.length > 1 ? monthKeys[monthKeys.length - 2] : null;

  if (prevMonth) {
    const prevExpenses = expenses.filter((t) => getMonthYear(t.date) === prevMonth);
    const prevCatMap = {};
    prevExpenses.forEach((t) => { prevCatMap[t.category] = (prevCatMap[t.category] || 0) + Number(t.amount); });

    for (const [cat, amt] of Object.entries(catMap)) {
      const prevAmt = prevCatMap[cat] || 0;
      if (prevAmt > 0) {
        const change = ((amt - prevAmt) / prevAmt) * 100;
        if (change > 15) {
          insights.push({ icon: '📈', title: `${cat} spending up`, message: `${cat} expenses increased by ${Math.round(change)}% compared to last month.`, type: 'warning' });
        } else if (change < -15) {
          insights.push({ icon: '📉', title: `${cat} spending down`, message: `${cat} expenses decreased by ${Math.round(Math.abs(change))}% compared to last month. Great job!`, type: 'success' });
        }
      }
    }
  }

  if (currentBudgetVal > 0) {
    const daysInMonth = new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]), 0).getDate();
    const dayOfMonth = new Date().getDate();
    const daysLeft = daysInMonth - dayOfMonth;
    const dailyAvg = dayOfMonth > 0 ? monthlyExpenseTotal / dayOfMonth : 0;
    const projectedEnd = monthlyExpenseTotal + dailyAvg * Math.max(daysLeft, 0);

    if (projectedEnd > currentBudgetVal) {
      insights.push({
        icon: '🚨', title: 'Budget at risk',
        message: `You're on track to exceed your budget by ${fmt(currency, projectedEnd - currentBudgetVal)} this month. Current pace: ${fmt(currency, Math.round(dailyAvg))}/day.`,
        type: 'danger',
      });
    } else {
      insights.push({
        icon: '✅', title: 'Budget on track',
        message: `Projected to stay within budget with ${fmt(currency, Math.round(currentBudgetVal - projectedEnd))} remaining.`,
        type: 'success',
      });
    }
  }

  if (goals.length > 0) {
    const activeGoals = goals.filter((g) => g.saved < g.target);
    if (activeGoals.length > 0) {
      const goal = activeGoals[0];
      const topCat = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0];
      if (topCat) {
        const reduction = Math.round(topCat[1] * 0.15);
        insights.push({
          icon: '💡', title: 'Savings tip',
          message: `Reducing ${topCat[0]} by ${fmt(currency, reduction)} can help you reach "${goal.name}" faster.`,
          type: 'info',
        });
      }
    }
  }

  if (monthlyIncomeTotal > 0) {
    const savingsRate = ((monthlyIncomeTotal - monthlyExpenseTotal) / monthlyIncomeTotal) * 100;
    if (savingsRate < 10) {
      insights.push({ icon: '⚠️', title: 'Low savings rate', message: `Your savings rate is only ${Math.round(savingsRate)}%. Aim for at least 20%.`, type: 'warning' });
    } else if (savingsRate >= 20) {
      insights.push({ icon: '🌟', title: 'Great savings rate', message: `You're saving ${Math.round(savingsRate)}% of your income. Excellent!`, type: 'success' });
    }
  }

  if (monthKeys.length >= 3) {
    const recentMonths = monthKeys.slice(-3);
    const spendTrend = recentMonths.map((m) =>
      expenses.filter((t) => getMonthYear(t.date) === m).reduce((s, t) => s + Number(t.amount), 0)
    );
    if (spendTrend[2] > spendTrend[1] && spendTrend[1] > spendTrend[0]) {
      insights.push({ icon: '📈', title: 'Spending trend alert', message: 'Spending has increased for 3 consecutive months. Review your budget.', type: 'warning' });
    }
  }

  return insights;
}
