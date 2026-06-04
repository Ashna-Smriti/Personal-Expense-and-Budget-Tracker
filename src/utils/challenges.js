export const CHALLENGES_TEMPLATES = [
  { name: 'Save ₹5,000 in 30 Days', target: 5000, days: 30, icon: '💰' },
  { name: 'No Online Shopping', target: 1, days: 14, type: 'restriction', category: 'Shopping', icon: '🛍️' },
  { name: 'No Food Delivery', target: 1, days: 14, type: 'restriction', category: 'Food', icon: '🍔' },
  { name: 'Save ₹10,000 in 60 Days', target: 10000, days: 60, icon: '💎' },
  { name: 'Coffee-Free Week', target: 1, days: 7, type: 'restriction', category: 'Food', icon: '☕' },
  { name: 'No Entertainment Spending', target: 1, days: 14, type: 'restriction', category: 'Entertainment', icon: '🎬' },
  { name: 'Save ₹2,000 in 7 Days', target: 2000, days: 7, icon: '⚡' },
  { name: 'Transport Detox (Walk/Bike)', target: 1, days: 7, type: 'restriction', category: 'Transport', icon: '🚶' },
];

export function checkChallengeProgress(challenge, transactions) {
  if (!challenge.startedAt) return 0;

  const start = new Date(challenge.startedAt);
  const now = new Date();
  const elapsedDays = Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
  const totalDays = challenge.days || 30;

  if (challenge.type === 'restriction') {
    const relevantTxns = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return t.type === 'Expense' && t.category === challenge.category && tDate >= start;
    });
    const daysPassed = Math.min(elapsedDays, totalDays);
    return Math.min(100, (daysPassed / totalDays) * 100);
  }

  const savedBefore = challenge.initialSaved || 0;
  const savingsGoalsTotal = challenge.savingsTotal || 0;
  const progress = Math.min((savingsGoalsTotal / challenge.target) * 100, 100);
  return progress;
}
