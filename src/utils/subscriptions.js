export const SUBSCRIPTION_PRESETS = [
  { name: 'Netflix', icon: '🎬', defaultCost: 199, category: 'Entertainment' },
  { name: 'Spotify', icon: '🎵', defaultCost: 119, category: 'Entertainment' },
  { name: 'Amazon Prime', icon: '📦', defaultCost: 149, category: 'Shopping' },
  { name: 'Disney+ Hotstar', icon: '⭐', defaultCost: 299, category: 'Entertainment' },
  { name: 'YouTube Premium', icon: '▶️', defaultCost: 129, category: 'Entertainment' },
  { name: 'Apple Music', icon: '🍎', defaultCost: 99, category: 'Entertainment' },
  { name: 'Zomato Pro', icon: '🍕', defaultCost: 99, category: 'Food' },
  { name: 'Swiggy One', icon: '🛵', defaultCost: 99, category: 'Food' },
];

export function getUpcomingRenewals(subscriptions) {
  const now = new Date();
  const upcoming = [];
  for (const sub of subscriptions) {
    const renewal = new Date(sub.nextRenewal);
    const daysUntil = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 7) {
      upcoming.push({ ...sub, daysUntil });
    }
  }
  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function calculateSubscriptionCosts(subscriptions) {
  const monthlyTotal = subscriptions.reduce((s, sub) => s + (sub.monthlyCost || 0), 0);
  const annualTotal = subscriptions.reduce((s, sub) => s + (sub.annualCost || sub.monthlyCost * 12 || 0), 0);
  return { monthlyTotal, annualTotal };
}
