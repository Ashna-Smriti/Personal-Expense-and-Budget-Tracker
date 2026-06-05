import { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ACHIEVEMENTS, checkAchievements } from '../../utils/achievements';
import ConfettiEffect from '../Premium/ConfettiEffect';
import { Lock, Unlock, Sparkles } from 'lucide-react';

export default function Achievements() {
  const { transactions, savingsGoals, budget, monthlyExpenses, currentMonth, earnedAchievements, setEarnedAchievements } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCountRef = useRef(earnedAchievements.length);

  const allEarned = useMemo(() => {
    const current = checkAchievements(transactions, savingsGoals, budget, monthlyExpenses, currentMonth);
    const merged = new Set([...earnedAchievements, ...current]);
    if (merged.size !== earnedAchievements.length) {
      setEarnedAchievements([...merged]);
    }
    return merged;
  }, [transactions, savingsGoals, budget, monthlyExpenses, currentMonth, earnedAchievements, setEarnedAchievements]);

  useEffect(() => {
    if (allEarned.size > prevCountRef.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      prevCountRef.current = allEarned.size;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = allEarned.size;
  }, [allEarned.size]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <ConfettiEffect active={showConfetti} />

      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-slate-800 dark:text-white"
        >
          Achievements
        </motion.h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {allEarned.size} of {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {ACHIEVEMENTS.map((a, idx) => {
          const isEarned = allEarned.has(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-2xl p-4 sm:p-5 text-center transition-all ${
                isEarned
                  ? 'glass-card dark:glass-dark card-hover'
                  : 'glass-card dark:glass-dark opacity-50'
              }`}
            >
              {isEarned && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg animate-float">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={`text-3xl sm:text-4xl mb-3 transition-all ${isEarned ? '' : 'grayscale opacity-50'}`}>
                {a.icon}
              </div>
              <p className={`text-sm font-bold ${isEarned ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {a.title}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{a.desc}</p>
              <div className="mt-3">
                {isEarned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <Unlock className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
