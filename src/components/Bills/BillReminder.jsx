import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Bell, Plus, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const BILL_PRESETS = [
  { name: 'Rent', amount: 15000, dueDay: 1, category: 'Housing' },
  { name: 'Hostel Fee', amount: 8000, dueDay: 5, category: 'Education' },
  { name: 'Electricity Bill', amount: 1200, dueDay: 10, category: 'Utilities' },
  { name: 'Internet', amount: 799, dueDay: 7, category: 'Utilities' },
  { name: 'Netflix', amount: 199, dueDay: 15, category: 'Entertainment' },
  { name: 'Spotify', amount: 119, dueDay: 20, category: 'Entertainment' },
  { name: 'Phone Recharge', amount: 499, dueDay: 25, category: 'Utilities' },
  { name: 'EMI Payment', amount: 5000, dueDay: 3, category: 'Loan' },
];

export default function BillReminder() {
  const { bills, upcomingBills, addBill, updateBill, deleteBill, currency } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '', category: 'Utilities' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.dueDay) return;
    addBill({
      name: form.name,
      amount: form.amount,
      dueDay: parseInt(form.dueDay),
      category: form.category,
      paid: false,
    });
    setForm({ name: '', amount: '', dueDay: '', category: 'Utilities' });
    setShowForm(false);
  };

  const handlePreset = (preset) => {
    setForm({ name: preset.name, amount: String(preset.amount), dueDay: String(preset.dueDay), category: preset.category });
    setShowForm(true);
  };

  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-800 dark:text-white"
          >
            Bill Reminders
          </motion.h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Never miss a payment again</p>
        </div>
        <button
          onClick={() => { setForm({ name: '', amount: '', dueDay: '', category: 'Utilities' }); setShowForm(true); }}
          className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {upcomingBills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-rose-700 dark:text-rose-400 text-sm">Upcoming Bills Due Soon</h3>
          </div>
          <div className="space-y-1.5">
            {upcomingBills.filter((b) => b.daysUntil <= 7).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-rose-600 dark:text-rose-300">{b.name}</span>
                <span className="font-medium text-rose-700 dark:text-rose-200">
                  {formatCurrency(currency, b.amount)} — {b.daysUntil === 0 ? 'Due Today!' : `${b.daysUntil} days left`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card dark:glass-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">New Bill</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {BILL_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePreset(p)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                {p.name} ({formatCurrency(currency, p.amount)})
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bill Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount</label>
                <input type="number" min="1" required value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Due Day of Month</label>
                <input type="number" min="1" max="31" required value={form.dueDay} onChange={(e) => setForm((p) => ({ ...p, dueDay: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                  <option>Housing</option><option>Education</option><option>Utilities</option><option>Entertainment</option><option>Loan</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
              <button type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Add Bill</button>
            </div>
          </form>
        </motion.div>
      )}

      {bills.length === 0 ? (
        <div className="glass-card dark:glass-dark rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No bills added yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Add your recurring bills to get reminders before they're due</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...bills].sort((a, b) => {
            const aDue = a.dueDay < today ? a.dueDay + daysInMonth : a.dueDay;
            const bDue = b.dueDay < today ? b.dueDay + daysInMonth : b.dueDay;
            return aDue - bDue;
          }).map((bill, idx) => {
            let dueDay = bill.dueDay;
            if (dueDay < today) dueDay += daysInMonth;
            const daysUntil = dueDay - today;
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card dark:glass-dark rounded-2xl p-4 border transition-all ${
                  bill.paid
                    ? 'border-emerald-200 dark:border-emerald-800 opacity-60'
                    : daysUntil <= 0
                      ? 'border-red-200 dark:border-red-800'
                      : daysUntil <= 3
                        ? 'border-amber-200 dark:border-amber-800'
                        : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{bill.name}</p>
                      {bill.paid && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{bill.category}</p>
                  </div>
                  <div className="flex gap-1">
                    {!bill.paid && (
                      <button
                        onClick={() => updateBill(bill.id, { paid: true })}
                        className="p-1.5 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        title="Mark paid"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(currency, bill.amount)}</span>
                  <div className="flex items-center gap-1 text-xs">
                    {bill.paid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Paid</span>
                    ) : daysUntil <= 0 ? (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Due!
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 font-medium ${
                        daysUntil <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        <Clock className="w-3 h-3" /> {daysUntil}d
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Due day: {bill.dueDay}th of month</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
