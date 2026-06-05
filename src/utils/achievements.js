export const ACHIEVEMENTS = [
  { id: 'first_txn', icon: '🌟', title: 'First Transaction', desc: 'Added your first transaction', check: (txns) => txns.length >= 1 },
  { id: 'ten_transactions', icon: '📊', title: 'Getting Started', desc: 'Added 10 transactions', check: (txns) => txns.length >= 10 },
  { id: 'fifty_transactions', icon: '📈', title: 'Power User', desc: 'Added 50 transactions', check: (txns) => txns.length >= 50 },
  { id: 'hundred_transactions', icon: '💎', title: 'Finance Pro', desc: 'Added 100 transactions', check: (txns) => txns.length >= 100 },
  { id: 'first_savings', icon: '🎯', title: 'Goal Setter', desc: 'Created your first savings goal', check: (_, goals) => goals.length >= 1 },
  { id: 'savings_goal_done', icon: '🏆', title: 'Goal Crusher', desc: 'Completed a savings goal', check: (_, goals) => goals.some((g) => g.saved >= g.target) },
  { id: 'saved_5000', icon: '🪙', title: '₹5K Saver', desc: 'Saved ₹5,000 total across goals', check: (_, goals) => goals.reduce((s, g) => s + (g.saved || 0), 0) >= 5000 },
  { id: 'saved_10000', icon: '💰', title: 'Money Saver', desc: 'Saved ₹10,000 total across goals', check: (_, goals) => goals.reduce((s, g) => s + (g.saved || 0), 0) >= 10000 },
  { id: 'saved_25000', icon: '💼', title: 'Savings Pro', desc: 'Saved ₹25,000 total across goals', check: (_, goals) => goals.reduce((s, g) => s + (g.saved || 0), 0) >= 25000 },
  { id: 'saved_50000', icon: '🏦', title: 'Wealth Builder', desc: 'Saved ₹50,000 total across goals', check: (_, goals) => goals.reduce((s, g) => s + (g.saved || 0), 0) >= 50000 },
  { id: 'under_budget', icon: '📋', title: 'Budget Champion', desc: 'Stayed under budget for a month', check: (_, __, budget, monthlyExp, currentMonth) => {
    const b = budget[currentMonth]; return b > 0 && monthlyExp <= b;
  }},
  { id: 'streak_7', icon: '🔥', title: 'Week Warrior', desc: '7-day tracking streak', check: (txns) => {
    const days = new Set(txns.map((t) => t.date.split('T')[0])); return days.size >= 7;
  }},
  { id: 'streak_30', icon: '🔥', title: 'Consistency King', desc: '30-day tracking streak', check: (txns) => {
    const days = new Set(txns.map((t) => t.date.split('T')[0])); return days.size >= 30;
  }},
  { id: 'streak_60', icon: '💪', title: 'Discipline Master', desc: '60-day tracking streak', check: (txns) => {
    const days = new Set(txns.map((t) => t.date.split('T')[0])); return days.size >= 60;
  }},
  { id: 'five_categories', icon: '🎨', title: 'Well Rounded', desc: 'Spent in 5+ different categories', check: (txns) => {
    const cats = new Set(txns.filter((t) => t.type === 'Expense').map((t) => t.category)); return cats.size >= 5;
  }},
  { id: 'income_50k', icon: '💼', title: 'High Earner', desc: 'Earned ₹50,000+ total', check: (txns) => {
    return txns.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0) >= 50000;
  }},
  { id: 'income_1l', icon: '👑', title: 'Income King', desc: 'Earned ₹1,00,000+ total', check: (txns) => {
    return txns.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0) >= 100000;
  }},
  { id: 'first_bill', icon: '📄', title: 'Bill Tracker', desc: 'Added your first bill reminder', check: (_, __, ___, ____, _____, bills) => (bills || []).length >= 1 },
];

export function checkAchievements(transactions, goals, budget, monthlyExpenses, currentMonth, bills) {
  const earned = [];
  for (const achievement of ACHIEVEMENTS) {
    if (achievement.check(transactions, goals, budget, monthlyExpenses, currentMonth, bills)) {
      earned.push(achievement.id);
    }
  }
  return earned;
}
