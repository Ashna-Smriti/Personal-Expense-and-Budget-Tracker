import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBSCRIPTION_PRESETS, calculateSubscriptionCosts, getUpcomingRenewals } from '../../utils/subscriptions';
import { formatCurrency } from '../../utils/helpers';
import EmptyState from '../Common/EmptyState';

export default function SubscriptionTracker() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, currency } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', monthlyCost: '', category: 'Entertainment', nextRenewal: '' });

  const upcoming = getUpcomingRenewals(subscriptions);
  const { monthlyTotal, annualTotal } = calculateSubscriptionCosts(subscriptions);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.monthlyCost) return;
    const data = {
      name: form.name,
      monthlyCost: parseFloat(form.monthlyCost),
      annualCost: parseFloat(form.monthlyCost) * 12,
      category: form.category,
      nextRenewal: form.nextRenewal || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    if (editing) {
      updateSubscription(editing.id, data);
    } else {
      addSubscription(data);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', monthlyCost: '', category: 'Entertainment', nextRenewal: '' });
  };

  const handleEdit = (sub) => {
    setEditing(sub);
    setForm({ name: sub.name, monthlyCost: String(sub.monthlyCost), category: sub.category, nextRenewal: sub.nextRenewal?.slice(0, 10) || '' });
    setShowForm(true);
  };

  const handlePreset = (preset) => {
    setForm({ name: preset.name, monthlyCost: String(preset.defaultCost), category: preset.category, nextRenewal: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Subscription Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your recurring subscriptions</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', monthlyCost: '', category: 'Entertainment', nextRenewal: '' }); setShowForm(true); }}
          className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">+ Add Subscription</button>
      </div>

      {upcoming.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 text-sm mb-2">📅 Upcoming Renewals</h3>
          <div className="space-y-1.5">
            {upcoming.map((sub) => (
              <p key={sub.id} className="text-sm text-amber-600 dark:text-amber-300">
                {sub.name} renews in {sub.daysUntil === 0 ? 'today' : `${sub.daysUntil} days`} ({formatCurrency(currency, sub.monthlyCost)}/mo)
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500">Active Subscriptions</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{subscriptions.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500">Monthly Total</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(currency, monthlyTotal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500">Annual Total</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(currency, annualTotal)}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">{editing ? 'Edit' : 'Add'} Subscription</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUBSCRIPTION_PRESETS.map((p) => (
              <button key={p.name} type="button" onClick={() => handlePreset(p)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Cost</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" required value={form.monthlyCost} onChange={(e) => setForm((p) => ({ ...p, monthlyCost: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                  <option>Entertainment</option><option>Shopping</option><option>Food</option><option>Bills</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Next Renewal Date</label>
                <input type="date" value={form.nextRenewal} onChange={(e) => setForm((p) => ({ ...p, nextRenewal: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">{editing ? 'Update' : 'Add'} Subscription</button>
            </div>
          </form>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <EmptyState icon="📺" title="No subscriptions" description="Add your subscriptions to track renewals and costs" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
                  <th className="text-left p-3 font-medium text-slate-500 dark:text-slate-400">Category</th>
                  <th className="text-right p-3 font-medium text-slate-500 dark:text-slate-400">Monthly</th>
                  <th className="text-right p-3 font-medium text-slate-500 dark:text-slate-400">Annual</th>
                  <th className="text-right p-3 font-medium text-slate-500 dark:text-slate-400">Next Renewal</th>
                  <th className="text-center p-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {subscriptions.map((sub) => {
                  const daysUntil = Math.ceil((new Date(sub.nextRenewal) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-medium text-slate-800 dark:text-white">{sub.name}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{sub.category}</td>
                      <td className="p-3 text-right text-slate-700 dark:text-slate-200">{formatCurrency(currency, sub.monthlyCost)}</td>
                      <td className="p-3 text-right text-slate-700 dark:text-slate-200">{formatCurrency(currency, sub.annualCost || sub.monthlyCost * 12)}</td>
                      <td className="p-3 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          daysUntil <= 3 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          daysUntil <= 7 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>{daysUntil <= 0 ? 'Due' : `${daysUntil}d`}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(sub)} className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => deleteSubscription(sub.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
