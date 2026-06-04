import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ACHIEVEMENTS, checkAchievements } from '../../utils/achievements';
import EmptyState from '../Common/EmptyState';

export default function Achievements() {
  const { transactions, savingsGoals, budget, monthlyExpenses, currentMonth, earnedAchievements, setEarnedAchievements } = useApp();

  const allEarned = useMemo(() => {
    const current = checkAchievements(transactions, savingsGoals, budget, monthlyExpenses, currentMonth);
    const merged = new Set([...earnedAchievements, ...current]);
    if (merged.size !== earnedAchievements.length) {
      setEarnedAchievements([...merged]);
    }
    return merged;
  }, [transactions, savingsGoals, budget, monthlyExpenses, currentMonth, earnedAchievements, setEarnedAchievements]);

  const earned = ACHIEVEMENTS.filter((a) => allEarned.has(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !allEarned.has(a.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Achievements</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Badges & rewards for your financial milestones</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isEarned = allEarned.has(a.id);
          return (
            <div key={a.id} className={`rounded-xl p-4 border text-center transition-all ${
              isEarned
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60'
            }`}>
              <div className={`text-3xl mb-2 ${isEarned ? '' : 'grayscale'}`}>{a.icon}</div>
              <p className={`text-sm font-semibold ${isEarned ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{a.title}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{a.desc}</p>
              {isEarned && <span className="inline-block mt-2 text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Unlocked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
