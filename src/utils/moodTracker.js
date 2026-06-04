export const MOODS = [
  { value: 'happy', icon: '😊', label: 'Happy', color: '#10b981' },
  { value: 'neutral', icon: '😐', label: 'Neutral', color: '#6366f1' },
  { value: 'sad', icon: '😢', label: 'Sad', color: '#f59e0b' },
  { value: 'stressed', icon: '😫', label: 'Stressed', color: '#ef4444' },
];

export function analyzeMoodSpending(transactions) {
  const moodTransactions = transactions.filter((t) => t.mood);
  if (moodTransactions.length === 0) return null;

  const moodMap = {};
  for (const t of moodTransactions) {
    if (!moodMap[t.mood]) moodMap[t.mood] = { total: 0, count: 0, categories: {} };
    moodMap[t.mood].total += Number(t.amount);
    moodMap[t.mood].count += 1;
    moodMap[t.mood].categories[t.category] = (moodMap[t.mood].categories[t.category] || 0) + Number(t.amount);
  }

  const analysis = [];
  for (const [mood, data] of Object.entries(moodMap)) {
    const topCat = Object.entries(data.categories).sort(([, a], [, b]) => b - a)[0];
    const moodInfo = MOODS.find((m) => m.value === mood);
    analysis.push({
      mood,
      icon: moodInfo?.icon || '😐',
      label: moodInfo?.label || mood,
      total: data.total,
      count: data.count,
      topCategory: topCat ? topCat[0] : null,
      topCategoryAmount: topCat ? topCat[1] : 0,
      percentage: moodTransactions.length > 0 ? (data.count / moodTransactions.length) * 100 : 0,
    });
  }

  return {
    analysis: analysis.sort((a, b) => b.total - a.total),
    total: moodTransactions.length,
    insights: generateMoodInsights(analysis),
  };
}

function generateMoodInsights(analysis) {
  const insights = [];
  for (const item of analysis) {
    if (item.topCategory && item.percentage > 20) {
      insights.push({
        icon: item.icon,
        message: `${item.percentage.toFixed(0)}% of ${item.label.toLowerCase()} spending goes to ${item.topCategory}.`,
      });
    }
  }
  const stressedData = analysis.find((a) => a.mood === 'stressed');
  const shoppingData = stressedData?.categories?.Shopping;
  if (shoppingData && stressedData.total > 0) {
    const pct = (shoppingData / stressedData.total) * 100;
    if (pct > 30) {
      insights.push({
        icon: '😫',
        message: `${pct.toFixed(0)}% of stressed spending is on shopping. Consider mindful spending when stressed.`,
      });
    }
  }
  return insights;
}
