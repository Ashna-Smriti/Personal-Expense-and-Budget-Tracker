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

export function checkBillReminders(bills, setNotifications) {
  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  for (const bill of bills) {
    if (bill.paid) continue;
    let dueDay = bill.dueDay;
    if (dueDay < today) dueDay += daysInMonth;
    const daysUntil = dueDay - today;
    if (daysUntil === 0) {
      setNotifications((prev) => {
        if (prev.some((n) => n.message?.includes(bill.name) && n.title === 'Bill Due Today')) return prev;
        return [createNotification('Bill Due Today', `${bill.name} of ${bill.amount} is due today!`, 'danger', '🔔'), ...prev].slice(0, 50);
      });
    } else if (daysUntil <= 3 && daysUntil > 0) {
      setNotifications((prev) => {
        if (prev.some((n) => n.message?.includes(bill.name) && n.title === 'Upcoming Bill')) return prev;
        return [createNotification('Upcoming Bill', `${bill.name} of ${bill.amount} is due in ${daysUntil} days.`, 'warning', '⏰'), ...prev].slice(0, 50);
      });
    }
  }
}

function getMonthLabel(monthStr) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [, m] = monthStr.split('-');
  return months[parseInt(m) - 1] || monthStr;
}
