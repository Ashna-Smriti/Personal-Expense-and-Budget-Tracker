import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

const DAYS_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ExpenseHeatmap() {
  const { transactions, currency } = useApp();

  const { weeks, maxAmount } = useMemo(() => {
    const dailyMap = {};
    transactions.filter((t) => t.type === 'Expense').forEach((t) => {
      const key = t.date.split('T')[0];
      dailyMap[key] = (dailyMap[key] || 0) + Number(t.amount);
    });
    const max = Math.max(...Object.values(dailyMap), 1);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks = [];
    let cursor = new Date(startDate);
    const monthLabels = [];

    while (cursor <= today || weeks.length < 53) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split('T')[0];
        const amount = dailyMap[dateStr] || 0;
        const isToday = dateStr === today.toISOString().split('T')[0];
        week.push({ date: new Date(cursor), dateStr, amount, isToday });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    let lastLabel = '';
    weeks.forEach((week) => {
      const firstDay = week[0].date;
      const monthKey = firstDay.toLocaleString('en', { month: 'short' });
      const yearKey = firstDay.getFullYear();
      const label = `${monthKey} ${yearKey}`;
      if (label !== lastLabel) {
        monthLabels.push({ weekIndex: weeks.indexOf(week), label });
        lastLabel = label;
      }
    });

    return { weeks, maxAmount: max, monthLabels };
  }, [transactions]);

  const getColor = (amount) => {
    if (amount === 0) return 'bg-slate-100 dark:bg-white/5';
    const ratio = amount / maxAmount;
    if (ratio < 0.25) return 'bg-emerald-300 dark:bg-emerald-700';
    if (ratio < 0.5) return 'bg-emerald-500 dark:bg-emerald-500';
    if (ratio < 0.75) return 'bg-yellow-400 dark:bg-yellow-500';
    return 'bg-red-500 dark:bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card dark:glass-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
    >
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Spending Heatmap</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pt-5 mr-1">
            {DAYS_LABELS.map((d, i) => (
              <span key={d} className="w-6 h-3 text-[9px] text-slate-400 dark:text-slate-500 leading-3 text-right pr-1">
                {i % 2 === 0 ? d : ''}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`w-3 h-3 rounded-sm ${getColor(day.amount)} ${day.isToday ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-slate-900' : ''} cursor-pointer group relative`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {day.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })} — {day.amount > 0 ? formatCurrency(currency, day.amount) : 'No spending'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-slate-400 dark:text-slate-500">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <div className="w-3 h-3 rounded-sm bg-yellow-400" />
        <div className="w-3 h-3 rounded-sm bg-red-500" />
        <span>More</span>
      </div>
    </motion.div>
  );
}
