let notificationId = 0;

export function createNotification(title, message, type = 'info', icon = '🔔') {
  return { id: ++notificationId, title, message, type, icon, read: false, timestamp: new Date().toISOString() };
}

export function checkBudgetAlert(monthlyExpenses, currentBudget, currentMonth) {
  if (currentBudget <= 0) return null;
  const pct = (monthlyExpenses / currentBudget) * 100;
  if (pct >= 100) {
    return createNotification('Budget Exceeded', `You've exceeded your ${getMonthLabel(currentMonth)} budget!`, 'danger', '🚨');
  } else if (pct >= 80) {
    return createNotification('Budget Warning', `You've used ${Math.round(pct)}% of your ${getMonthLabel(currentMonth)} budget.`, 'warning', '⚠️');
  }
  return null;
}

export function checkSavingsGoalAlert(goals) {
  for (const goal of goals) {
    if (goal.saved >= goal.target) {
      return createNotification('Goal Achieved', `Congratulations! You achieved your savings goal: ${goal.name}`, 'success', '🎉');
    }
  }
  return null;
}

export function checkUnusualSpendingAlert(transactions, currentMonth) {
  const expenses = transactions.filter((t) => t.type === 'Expense');
  const monthKeys = [...new Set(expenses.map((t) => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].sort();
  if (monthKeys.length < 2) return null;

  const currentExpenses = expenses.filter((t) => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === currentMonth;
  });
  const currentTotal = currentExpenses.reduce((s, t) => s + Number(t.amount), 0);

  const prevMonth = monthKeys[monthKeys.length - 2];
  const prevExpenses = expenses.filter((t) => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === prevMonth;
  });
  const prevTotal = prevExpenses.reduce((s, t) => s + Number(t.amount), 0);

  if (prevTotal > 0 && currentTotal > prevTotal * 1.5) {
    return createNotification('Unusual Spending', `Your spending increased ${Math.round((currentTotal / prevTotal - 1) * 100)}% compared to last month!`, 'warning', '📈');
  }
  return null;
}

function getMonthLabel(monthStr) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [, m] = monthStr.split('-');
  return months[parseInt(m) - 1] || monthStr;
}
