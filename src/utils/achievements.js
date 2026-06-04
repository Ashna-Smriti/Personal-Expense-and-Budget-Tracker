export const ACHIEVEMENTS = [
  { id: 'first_txn', icon: '🌟', title: 'First Transaction', desc: 'Added your first transaction', check: (txns) => txns.length >= 1 },
  { id: 'first_savings', icon: '🎯', title: 'Goal Setter', desc: 'Created your first savings goal', check: (_, goals) => goals.length >= 1 },
  { id: 'saved_10000', icon: '💰', title: 'Money Saver', desc: 'Saved ₹10,000 total across goals', check: (_, goals) => goals.reduce((s, g) => s + g.saved, 0) >= 10000 },
  { id: 'under_budget', icon: '📋', title: 'Budget Master', desc: 'Stayed under budget for a month', check: (_, __, budget, monthlyExp, currentMonth) => {
    const b = budget[currentMonth]; return b > 0 && monthlyExp <= b;
  }},
  { id: 'streak_30', icon: '🔥', title: '30-Day Streak', desc: 'Added transactions for 30 days', check: (txns) => {
    const days = new Set(txns.map((t) => t.date)); return days.size >= 30;
  }},
  { id: 'five_categories', icon: '🎨', title: 'Well Rounded', desc: 'Spent in 5+ different categories', check: (txns) => {
    const cats = new Set(txns.filter((t) => t.type === 'Expense').map((t) => t.category)); return cats.size >= 5;
  }},
  { id: 'income_50k', icon: '💼', title: 'High Earner', desc: 'Earned ₹50,000+ total', check: (txns) => {
    return txns.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0) >= 50000;
  }},
  { id: 'ten_transactions', icon: '📊', title: 'Getting Started', desc: 'Added 10 transactions', check: (txns) => txns.length >= 10 },
  { id: 'fifty_transactions', icon: '📈', title: 'Power User', desc: 'Added 50 transactions', check: (txns) => txns.length >= 50 },
  { id: 'savings_goal_done', icon: '🏆', title: 'Goal Crusher', desc: 'Completed a savings goal', check: (_, goals) => goals.some((g) => g.saved >= g.target) },
];

export function checkAchievements(transactions, goals, budget, monthlyExpenses, currentMonth) {
  const earned = [];
  for (const achievement of ACHIEVEMENTS) {
    if (achievement.check(transactions, goals, budget, monthlyExpenses, currentMonth)) {
      earned.push(achievement.id);
    }
  }
  return earned;
}
