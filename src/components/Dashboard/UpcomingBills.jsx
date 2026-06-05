import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function UpcomingBills() {
  const { upcomingBills, bills, currency } = useApp();

  const urgent = upcomingBills.filter((b) => b.daysUntil <= 3);
  const totalMonthly = bills.reduce((s, b) => s + Number(b.amount), 0);
  const paidCount = bills.filter((b) => b.paid).length;

  if (bills.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card dark:glass-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Bills
        </h3>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {paidCount}/{bills.length} paid
        </span>
      </div>

      {urgent.length > 0 && (
        <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-1">Due Soon</p>
          {urgent.slice(0, 3).map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-rose-600 dark:text-rose-300">{b.name}</span>
              <span className="font-medium text-rose-700 dark:text-rose-200">
                {formatCurrency(currency, b.amount)} {b.daysUntil === 0 ? '🔴' : `(${b.daysUntil}d)`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {upcomingBills.slice(0, 5).map((b) => (
          <div key={b.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {b.daysUntil <= 0 ? (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              ) : b.daysUntil <= 3 ? (
                <Clock className="w-3 h-3 text-amber-500" />
              ) : (
                <Bell className="w-3 h-3 text-slate-400" />
              )}
              <span className="text-slate-600 dark:text-slate-300">{b.name}</span>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {formatCurrency(currency, b.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between text-xs">
        <span className="text-slate-400 dark:text-slate-500">Monthly total</span>
        <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(currency, totalMonthly)}</span>
      </div>
    </motion.div>
  );
}
