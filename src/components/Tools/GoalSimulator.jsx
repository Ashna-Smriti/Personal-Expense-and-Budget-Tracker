import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Target, CalendarDays, PiggyBank, TrendingUp } from 'lucide-react';

export default function GoalSimulator() {
  const { currency } = useApp();
  const [goalName, setGoalName] = useState('New Laptop');
  const [targetCost, setTargetCost] = useState(80000);
  const [monthlySavings, setMonthlySavings] = useState(5000);
  const [currentSaved, setCurrentSaved] = useState(0);

  const result = useMemo(() => {
    if (monthlySavings <= 0 || targetCost <= 0) return null;
    const remaining = targetCost - currentSaved;
    if (remaining <= 0) return { months: 0, total: currentSaved, remaining: 0, milestones: [], achieved: true };
    const monthsNeeded = Math.ceil(remaining / monthlySavings);
    const milestones = [];
    for (let m = 1; m <= Math.min(monthsNeeded, 24); m++) {
      const savedSoFar = currentSaved + monthlySavings * m;
      milestones.push({ month: m, saved: Math.min(savedSoFar, targetCost), pct: Math.min((savedSoFar / targetCost) * 100, 100) });
      if (savedSoFar >= targetCost) break;
    }
    const totalDeposited = currentSaved + monthlySavings * monthsNeeded;
    return { months: monthsNeeded, total: totalDeposited, remaining, milestones, achieved: false };
  }, [targetCost, monthlySavings, currentSaved]);

  const presets = [
    { name: 'New Laptop', cost: 80000 },
    { name: 'Smartphone', cost: 40000 },
    { name: 'Gaming Console', cost: 50000 },
    { name: 'Holiday Trip', cost: 60000 },
    { name: 'Emergency Fund', cost: 100000 },
    { name: 'Car Down Payment', cost: 200000 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Goal Simulator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">See how long it'll take to reach your savings goal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card dark:glass-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Goal Details
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => { setGoalName(p.name); setTargetCost(p.cost); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  goalName === p.name
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Target Cost ({formatCurrency(currency, 0).replace(/\d/g, '').trim()})</label>
              <input
                type="number"
                min="1"
                value={targetCost}
                onChange={(e) => setTargetCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Already Saved</label>
              <input
                type="number"
                min="0"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Savings</label>
              <input
                type="number"
                min="1"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card dark:glass-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Results
          </h3>

          {result ? (
            <div className="space-y-5">
              {result.achieved ? (
                <div className="text-center py-6">
                  <span className="text-4xl">🎉</span>
                  <p className="text-lg font-bold text-emerald-500 mt-2">Goal Already Achieved!</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">You've saved enough for {goalName}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Months Needed</p>
                      <p className="text-2xl font-bold text-primary">{result.months}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Target Date</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {new Date(Date.now() + result.months * 30 * 86400000).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {formatCurrency(currency, currentSaved)} / {formatCurrency(currency, targetCost)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentSaved / targetCost) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      You'll need to save {formatCurrency(currency, monthlySavings)}/month for <strong>{result.months} months</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Milestones</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.milestones.filter((_, i) => i % 2 === 0 || i === result.milestones.length - 1).map((m) => (
                        <div key={m.month} className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-slate-400 dark:text-slate-500">Month {m.month}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary/60" style={{ width: `${m.pct}%` }} />
                          </div>
                          <span className="w-16 text-right text-slate-600 dark:text-slate-300 font-medium">{formatCurrency(currency, m.saved)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Enter a target cost and monthly savings to see results</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
